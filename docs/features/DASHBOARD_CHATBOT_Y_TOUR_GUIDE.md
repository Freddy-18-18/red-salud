# Dashboard Chatbot & Tour Guide System

## Fecha: 9 de diciembre de 2025

## Objetivo

Implementar dos sistemas complementarios para mejorar la experiencia del médico en el dashboard:

1. **Dashboard Chatbot**: Asistente conversacional global accesible desde cualquier página
2. **Tour Guide System**: Sistema de onboarding/tutoriales interactivos paso a paso

---

## Arquitectura Recomendada: Sistema Dual

### ¿Por qué Sistema Dual?

**Ventajas:**
- ✅ Separación de responsabilidades (Single Responsibility Principle)
- ✅ Cada sistema optimizado para su propósito específico
- ✅ Mejor UX: chatbot para consultas, tour para aprendizaje guiado
- ✅ Más fácil de mantener, testear y escalar
- ✅ Integración inteligente: el chatbot puede activar tours

**Desventajas de un sistema único:**
- ❌ Componente monolítico difícil de mantener
- ❌ UX subóptima para tours (chat no es ideal para navegación paso a paso)
- ❌ Viola principios SOLID
- ❌ Dificulta testing y debugging

---

## 1. Dashboard Chatbot

### Características

#### Contextualización Automática
```typescript
interface DashboardChatContext {
  doctor: {
    id: string;
    nombre: string;
    especialidad: string;
    verificado: boolean;
  };
  currentPage: string;
  stats: {
    citasHoy: number;
    citasPendientes: number;
    pacientesActivos: number;
  };
  recentActivity: Activity[];
}
```

#### Comandos Especiales
```typescript
const CHAT_COMMANDS = {
  // Tours
  '/tour': 'Inicia el tour general del dashboard',
  '/tour citas': 'Tour del sistema de citas',
  '/tour pacientes': 'Tour de gestión de pacientes',
  
  // Ayuda contextual
  '/ayuda': 'Muestra ayuda sobre la página actual',
  '/atajos': 'Muestra atajos de teclado disponibles',
  
  // Datos rápidos
  '/estadisticas': 'Muestra estadísticas rápidas',
  '/citashoy': 'Lista de citas de hoy',
  '/urgentes': 'Tareas urgentes pendientes',
  
  // Sistema
  '/config': 'Abre configuración del chatbot',
  '/limpiar': 'Limpia historial de chat'
};
```

#### Integración con IA

**Opción A: Gemini (Recomendado)**
```typescript
// Ventajas:
// - Ya lo estamos usando en el chatbot público
// - Multimodal (puede analizar imágenes de UI)
// - API generosa y económica
// - Buen rendimiento en español

const chatEngine = new GeminiChatEngine({
  model: 'gemini-1.5-pro',
  systemPrompt: `
    Eres un asistente médico virtual integrado en el dashboard de Red Salud.
    
    Contexto del usuario:
    - Doctor: {doctor.nombre}
    - Especialidad: {doctor.especialidad}
    - Página actual: {currentPage}
    - Estadísticas: {stats}
    
    Tus responsabilidades:
    1. Responder preguntas sobre el uso del dashboard
    2. Explicar funcionalidades y features
    3. Sugerir mejores prácticas
    4. Activar tours guiados cuando sea apropiado
    5. Proporcionar estadísticas rápidas
    
    Directrices:
    - Respuestas concisas y profesionales
    - Usar lenguaje médico apropiado
    - Sugerir comandos cuando sea relevante
    - Si no sabes algo, ser honesto
  `,
  temperature: 0.7,
  maxTokens: 1000
});
```

**Opción B: RAG (Retrieval Augmented Generation)**
```typescript
// Para respuestas más precisas sobre documentación
const ragEngine = new RAGChatEngine({
  vectorStore: 'supabase-pgvector',
  embeddings: 'text-embedding-004',
  documents: [
    'docs/dashboard-features.md',
    'docs/medical-workflows.md',
    'docs/keyboard-shortcuts.md',
    // Indexar toda la documentación del sistema
  ]
});
```

### Arquitectura de Componentes

```typescript
// components/dashboard/chatbot/dashboard-chatbot.tsx
interface DashboardChatbotProps {
  initialOpen?: boolean;
  showWelcome?: boolean;
}

export function DashboardChatbot({ initialOpen, showWelcome }: DashboardChatbotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { doctor, currentPage, stats } = useDashboardContext();
  
  return (
    <>
      {/* Botón flotante - siempre visible */}
      <ChatbotButton 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)}
        unreadCount={0}
      />
      
      {/* Panel de chat - slide in/out */}
      <ChatbotPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={{ doctor, currentPage, stats }}
        showWelcome={showWelcome}
      />
    </>
  );
}
```

### Posicionamiento y Diseño

```typescript
// Botón flotante - esquina inferior derecha
const ChatbotButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }
  
  // Badge de mensajes no leídos
  &::after {
    content: attr(data-unread);
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 11px;
  }
`;

// Panel de chat - slide desde la derecha
const ChatbotPanel = styled.div`
  position: fixed;
  top: 0;
  right: ${props => props.isOpen ? '0' : '-400px'};
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
  
  // En móvil, pantalla completa
  @media (max-width: 768px) {
    width: 100vw;
    right: ${props => props.isOpen ? '0' : '-100vw'};
  }
`;
```

---

## 2. Tour Guide System

### Características Principales

#### 1. Spotlight Animado
```typescript
interface SpotlightConfig {
  element: string | HTMLElement; // Selector o elemento
  padding?: number; // Espacio alrededor del elemento
  radius?: number; // Border radius del spotlight
  animate?: boolean; // Animación de entrada
}

// Overlay oscuro con recorte para el elemento destacado
const Spotlight = ({ element, padding = 8, radius = 8 }: SpotlightConfig) => {
  const [rect, setRect] = useState<DOMRect>();
  
  useEffect(() => {
    const el = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    if (el) {
      setRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [element]);
  
  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Overlay oscuro con SVG mask */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect fill="white" width="100%" height="100%" />
            {rect && (
              <rect
                fill="black"
                x={rect.x - padding}
                y={rect.y - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                rx={radius}
              />
            )}
          </mask>
        </defs>
        <rect
          fill="rgba(0, 0, 0, 0.7)"
          width="100%"
          height="100%"
          mask="url(#spotlight-mask)"
        />
      </svg>
      
      {/* Borde animado alrededor del elemento */}
      {rect && (
        <div
          className="absolute animate-pulse"
          style={{
            left: rect.x - padding - 2,
            top: rect.y - padding - 2,
            width: rect.width + padding * 2 + 4,
            height: rect.height + padding * 2 + 4,
            border: '2px solid #667eea',
            borderRadius: radius + 'px',
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
          }}
        />
      )}
    </div>
  );
};
```

#### 2. Tooltips Inteligentes
```typescript
interface TooltipPosition {
  placement: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

interface TourTooltipProps {
  title: string;
  description: string;
  element: HTMLElement;
  position?: TooltipPosition;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const TourTooltip = ({
  title,
  description,
  element,
  position = { placement: 'bottom', align: 'center' },
  step,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose
}: TourTooltipProps) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  
  // Calcular posición inteligente (evita salirse de pantalla)
  useEffect(() => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.bottom + 16;
    
    // Ajustar si se sale de la pantalla
    if (x < 16) x = 16;
    if (x + tooltipWidth > window.innerWidth - 16) {
      x = window.innerWidth - tooltipWidth - 16;
    }
    if (y + tooltipHeight > window.innerHeight - 16) {
      y = rect.top - tooltipHeight - 16; // Posicionar arriba
    }
    
    setCoords({ x, y });
  }, [element]);
  
  return (
    <div
      className="fixed z-[9999] bg-white rounded-lg shadow-2xl p-6 w-80 animate-in fade-in slide-in-from-bottom-4"
      style={{ left: coords.x, top: coords.y }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs font-medium text-purple-600 mb-1">
            Paso {step} de {totalSteps}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Omitir tour
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={step === 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
          >
            ◀ Anterior
          </button>
          <button
            onClick={onNext}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg"
          >
            {step === totalSteps ? 'Finalizar' : 'Siguiente ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 3. Definición de Tours
```typescript
// lib/tour-guide/tours/dashboard-overview.ts
export const dashboardOverviewTour: TourDefinition = {
  id: 'dashboard-overview',
  name: 'Introducción al Dashboard',
  description: 'Conoce las funcionalidades principales de tu dashboard',
  autoStart: true, // Se inicia automáticamente para nuevos usuarios
  steps: [
    {
      id: 'welcome',
      target: 'body', // Sin spotlight específico
      title: '¡Bienvenido a Red Salud! 👋',
      description: 'Te guiaremos por las funcionalidades principales del dashboard. Este tour tomará aproximadamente 2 minutos.',
      placement: 'center', // Modal centrado
    },
    {
      id: 'sidebar-navigation',
      target: '[data-tour="sidebar"]',
      title: 'Menú de Navegación',
      description: 'Desde aquí puedes acceder a todas las secciones: Citas, Pacientes, Telemedicina, Mensajería y más.',
      placement: 'right',
    },
    {
      id: 'calendar-section',
      target: '[data-tour="calendar"]',
      title: 'Calendario de Citas',
      description: 'Gestiona tus citas con vistas Día, Semana y Mes. Puedes arrastrar y soltar para reprogramar.',
      placement: 'bottom',
      action: () => {
        // Navegar a la página si no estamos ahí
        if (window.location.pathname !== '/dashboard/medico/citas') {
          router.push('/dashboard/medico/citas');
        }
      }
    },
    {
      id: 'new-appointment',
      target: '[data-tour="new-appointment-btn"]',
      title: 'Crear Nueva Cita',
      description: 'Haz clic aquí para agendar una nueva cita. También puedes usar el atajo de teclado "N".',
      placement: 'bottom',
      highlight: 'pulse', // Animación de pulso
    },
    {
      id: 'realtime-updates',
      target: '[data-tour="calendar-grid"]',
      title: 'Actualizaciones en Tiempo Real',
      description: 'Las citas se actualizan automáticamente sin necesidad de recargar. Verás cambios instantáneos.',
      placement: 'top',
    },
    {
      id: 'keyboard-shortcuts',
      target: 'body',
      title: 'Atajos de Teclado ⌨️',
      description: 'Usa atajos para ser más eficiente:\n• N - Nueva cita\n• T - Ir a hoy\n• ← → - Navegar semanas\n• D/W/M/L - Cambiar vistas',
      placement: 'center',
    },
    {
      id: 'chatbot',
      target: '[data-tour="chatbot-button"]',
      title: 'Asistente Virtual',
      description: 'Si tienes dudas, haz clic aquí. Puedo ayudarte con preguntas sobre el sistema, estadísticas y más.',
      placement: 'left',
      highlight: 'bounce',
    },
    {
      id: 'complete',
      target: 'body',
      title: '¡Tour Completado! 🎉',
      description: 'Ya conoces lo básico. Puedes reactivar este tour desde el chatbot con el comando "/tour" o explorar tours específicos.',
      placement: 'center',
    }
  ]
};
```

#### 4. Provider y Context
```typescript
// components/dashboard/tour-guide/tour-guide-provider.tsx
interface TourGuideContextValue {
  currentTour: TourDefinition | null;
  currentStep: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  closeTour: () => void;
  completedTours: string[];
}

export function TourGuideProvider({ children }: { children: React.ReactNode }) {
  const [currentTour, setCurrentTour] = useState<TourDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  
  // Cargar tours completados de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completed-tours');
    if (saved) {
      setCompletedTours(JSON.parse(saved));
    }
  }, []);
  
  // Auto-start tour para nuevos usuarios
  useEffect(() => {
    const isNewUser = !localStorage.getItem('dashboard-visited');
    if (isNewUser) {
      const autoTour = TOURS.find(t => t.autoStart && !completedTours.includes(t.id));
      if (autoTour) {
        setTimeout(() => startTour(autoTour.id), 1000);
      }
      localStorage.setItem('dashboard-visited', 'true');
    }
  }, []);
  
  const startTour = (tourId: string) => {
    const tour = TOURS.find(t => t.id === tourId);
    if (tour) {
      setCurrentTour(tour);
      setCurrentStep(0);
    }
  };
  
  const nextStep = () => {
    if (currentTour && currentStep < currentTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      
      // Ejecutar acción del paso si existe
      const nextStepData = currentTour.steps[currentStep + 1];
      if (nextStepData.action) {
        nextStepData.action();
      }
    } else {
      completeTour();
    }
  };
  
  const completeTour = () => {
    if (currentTour) {
      const updated = [...completedTours, currentTour.id];
      setCompletedTours(updated);
      localStorage.setItem('completed-tours', JSON.stringify(updated));
      closeTour();
    }
  };
  
  const skipTour = () => {
    // Marcar como completado pero guardar que fue saltado
    if (currentTour) {
      const skipped = JSON.parse(localStorage.getItem('skipped-tours') || '[]');
      skipped.push(currentTour.id);
      localStorage.setItem('skipped-tours', JSON.stringify(skipped));
      closeTour();
    }
  };
  
  // ... más funciones
  
  return (
    <TourGuideContext.Provider value={{
      currentTour,
      currentStep,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      closeTour,
      completedTours
    }}>
      {children}
      
      {/* Renderizar tour si está activo */}
      {currentTour && (
        <TourGuideOverlay
          tour={currentTour}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onClose={closeTour}
        />
      )}
    </TourGuideContext.Provider>
  );
}
```

---

## 3. Integración: Chatbot ↔ Tour Guide

### Comandos del Chatbot para Activar Tours

```typescript
// components/dashboard/chatbot/chatbot-commands.tsx
const handleChatCommand = (command: string) => {
  const { startTour } = useTourGuide();
  
  switch (command) {
    case '/tour':
      startTour('dashboard-overview');
      return 'Iniciando tour general del dashboard...';
      
    case '/tour citas':
      // Navegar a la página primero
      router.push('/dashboard/medico/citas');
      setTimeout(() => startTour('appointments-tour'), 500);
      return 'Iniciando tour del calendario de citas...';
      
    case '/tour pacientes':
      router.push('/dashboard/medico/pacientes');
      setTimeout(() => startTour('patients-tour'), 500);
      return 'Iniciando tour de gestión de pacientes...';
      
    case '/tours':
      return `Tours disponibles:
        • /tour - Tour general del dashboard
        • /tour citas - Sistema de citas
        • /tour pacientes - Gestión de pacientes
        • /tour telemedicina - Videoconsultas
        • /tour mensajes - Sistema de mensajería
        
        Escribe el comando para iniciar un tour.`;
      
    default:
      return null; // No es un comando de tour
  }
};
```

### Botón del Tour Guide para Abrir Chatbot

```typescript
// En el tooltip del tour
<button
  onClick={() => {
    closeTour();
    openChatbot();
    sendChatMessage('Tengo una pregunta sobre ' + currentStep.title);
  }}
  className="text-sm text-purple-600 hover:text-purple-700"
>
  💬 Preguntar al asistente
</button>
```

---

## 4. Persistencia y Analytics

### LocalStorage Schema

```typescript
interface TourPersistence {
  completedTours: string[];
  skippedTours: string[];
  currentProgress: {
    tourId: string;
    stepIndex: number;
    timestamp: string;
  } | null;
  settings: {
    autoStartTours: boolean;
    showTooltips: boolean;
    animationsEnabled: boolean;
  };
}

// Guardar en localStorage
const TOUR_STORAGE_KEY = 'red-salud:tour-guide';
```

### Analytics (opcional)

```typescript
// Tracking de eventos para mejorar tours
const trackTourEvent = (event: TourEvent) => {
  // Enviar a Supabase o analytics
  supabase.from('tour_analytics').insert({
    doctor_id: doctorId,
    tour_id: event.tourId,
    step_index: event.stepIndex,
    event_type: event.type, // 'start', 'complete', 'skip', 'step-next', 'step-prev'
    timestamp: new Date().toISOString(),
  });
};

// Insights:
// - ¿Qué tours se completan más?
// - ¿En qué pasos abandonan los usuarios?
// - ¿Qué tours se saltan más (mejorar esos)?
```

---

## 5. Accesibilidad y UX

### Consideraciones de Accesibilidad

```typescript
// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!currentTour) return;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'Enter':
        nextStep();
        break;
      case 'ArrowLeft':
        prevStep();
        break;
      case 'Escape':
        closeTour();
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [currentTour, nextStep, prevStep, closeTour]);

// ARIA labels
<div
  role="dialog"
  aria-labelledby="tour-title"
  aria-describedby="tour-description"
  aria-live="polite"
>
  {/* Tour content */}
</div>

// Focus trap (mantener foco dentro del tour)
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <TourTooltip {...props} />
</FocusTrap>
```

### Responsive Design

```typescript
// Adaptar tooltips en móvil
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  // Bottom sheet en móvil
  <div className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-2xl p-6 animate-slide-up">
    {/* Tour content */}
  </div>
) : (
  // Tooltip posicionado en desktop
  <TourTooltip {...props} />
)}
```

---

## 6. Data Attributes para Tours

### Marcar elementos para tours

```typescript
// En los componentes del dashboard
<button
  data-tour="new-appointment-btn"
  data-tour-group="calendar"
  onClick={handleNewAppointment}
>
  Nueva Cita
</button>

<nav data-tour="sidebar" data-tour-group="navigation">
  {/* Sidebar content */}
</nav>

<div data-tour="calendar-grid" data-tour-group="calendar">
  {/* Calendar */}
</div>
```

Esto permite:
- Seleccionar elementos fácilmente desde las definiciones de tours
- Agrupar elementos relacionados
- Buscar elementos disponibles para crear nuevos tours

---

## Conclusión y Próximos Pasos

### Mi Recomendación Final

1. **Implementar Sistema Dual** (Chatbot + Tour Guide separados)
2. **Fase 1**: Dashboard Chatbot básico
3. **Fase 2**: Tour Guide System con tour de overview
4. **Fase 3**: Integración y comandos cruzados
5. **Fase 4**: Tours específicos para cada sección
6. **Fase 5**: Analytics y optimización

### ¿Qué opinas?

**Preguntas para ti:**

1. ¿Te convence el sistema dual o prefieres todo en el chatbot?
2. ¿Qué IA prefieres para el chatbot: Gemini (ya lo usamos) u OpenAI?
3. ¿Quieres implementar RAG para respuestas más precisas?
4. ¿Prioridad: chatbot primero o tour guide primero?
5. ¿El tour debe auto-iniciarse para nuevos médicos?

### Estimación de Tiempo

**Chatbot Dashboard:**
- Estructura base: 2-3 horas
- Integración con IA: 2-3 horas
- Comandos especiales: 1-2 horas
- **Total: ~6-8 horas**

**Tour Guide System:**
- Provider y context: 2 horas
- Spotlight y tooltips: 3-4 horas
- Navegación y persistencia: 2 horas
- Tour de overview: 2 horas
- **Total: ~9-10 horas**

**Integración:**
- Comandos cruzados: 1 hora
- Testing completo: 2 horas
- **Total: ~3 horas**

**TOTAL ESTIMADO: 18-21 horas de desarrollo**

---

¿Quieres que empiece a implementar? ¿Por cuál sistema empezamos?
