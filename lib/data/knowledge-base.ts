/**
 * Knowledge Base for Red-Salud Chatbot
 * This file contains all the structured information about the platform
 * that will be indexed into the vector database for RAG retrieval
 */

export interface KnowledgeDocument {
    content: string;
    metadata: {
        title: string;
        category: string;
        url: string;
        keywords: string[];
    };
}

export const knowledgeDocuments: KnowledgeDocument[] = [
    // ===== INFORMACIÓN GENERAL =====
    {
        content: `Red-Salud es una plataforma integral de gestión médica que conecta pacientes, médicos, secretarias y organizaciones de salud. Ofrece herramientas para agendar citas, gestionar historiales médicos, realizar teleconsultas, enviar mensajes seguros y más. La plataforma está diseñada para ser fácil de usar y accesible desde cualquier dispositivo.`,
        metadata: {
            title: "Sobre Red-Salud",
            category: "general",
            url: "/nosotros",
            keywords: ["red-salud", "plataforma", "gestión médica", "qué es"]
        }
    },

    // ===== PRECIOS Y PLANES =====
    {
        content: `Los planes de Red-Salud son simples y transparentes:

**Plan Paciente - GRATIS**
- Historial médico digital
- Agendar citas médicas
- Recetas electrónicas
- Resultados de laboratorio
- Telemedicina por video
- Mensajería con médicos
- Métricas de salud
- Recordatorios

**Plan Médico - $20/mes (anual) o $30/mes (mensual)**
- Pacientes ilimitados
- Agenda en línea
- Historial clínico digital
- Recetas electrónicas
- Telemedicina integrada
- Mensajería con pacientes
- Reportes y estadísticas
- Soporte prioritario
- Prueba gratis de 30 días sin tarjeta de crédito

**Plan Secretaria - GRATIS**
- Gestión de agenda
- Coordinación de citas
- Comunicación con pacientes
- Recordatorios automáticos
- Acceso al calendario
- Gestión de documentos
- Reportes básicos
- Requiere vinculación con médico suscrito`,
        metadata: {
            title: "Planes y Precios",
            category: "pricing",
            url: "/precios",
            keywords: ["precio", "plan", "costo", "cuánto cuesta", "gratis", "suscripción", "mensual", "anual"]
        }
    },
    {
        content: `Sí, Red-Salud es completamente gratis para pacientes. Tienes acceso completo sin costo: historial médico, citas, recetas, telemedicina y más. Sin límites ni funciones bloqueadas.`,
        metadata: {
            title: "¿Es gratis para pacientes?",
            category: "pricing",
            url: "/precios",
            keywords: ["gratis", "paciente", "costo", "pago"]
        }
    },
    {
        content: `La prueba gratis para médicos incluye 30 días con todas las funcionalidades sin restricciones. No necesitas tarjeta de crédito para comenzar. Después de la prueba, el plan mensual cuesta $30/mes o puedes pagar anualmente $240/año (equivalente a $20/mes, ahorrando $120 al año).`,
        metadata: {
            title: "Prueba gratis para médicos",
            category: "pricing",
            url: "/precios",
            keywords: ["prueba", "trial", "gratis", "médico", "30 días"]
        }
    },
    {
        content: `Las cuentas de secretaria son gratuitas. Solo necesitan vincularse a un médico con suscripción activa para funcionar.`,
        metadata: {
            title: "Cuentas de secretaria",
            category: "pricing",
            url: "/precios",
            keywords: ["secretaria", "gratis", "cuenta", "asistente"]
        }
    },
    {
        content: `Puedes cancelar tu suscripción en cualquier momento sin penalizaciones ni contratos de permanencia. Ve a Configuración > Suscripción > Cancelar.`,
        metadata: {
            title: "Cancelar suscripción",
            category: "pricing",
            url: "/precios",
            keywords: ["cancelar", "suscripción", "baja", "terminar"]
        }
    },

    // ===== SERVICIOS MÉDICOS =====
    {
        content: `Red-Salud ofrece más de 50 especialidades médicas. Las principales son:

1. **Medicina General**: Consultas médicas generales, diagnósticos y tratamientos. Incluye consultas virtuales, recetas electrónicas y seguimiento continuo.

2. **Cardiología**: Especialistas en salud cardiovascular. Electrocardiogramas, monitoreo cardíaco y planes preventivos.

3. **Neurología**: Diagnóstico y tratamiento de trastornos del sistema nervioso. Estudios neurológicos y terapias avanzadas.

4. **Pediatría**: Atención médica para niños desde recién nacidos hasta adolescentes. Control de niño sano, vacunación y emergencias pediátricas.

5. **Oftalmología**: Cuidado integral de la salud visual. Exámenes visuales, cirugía refractiva y tratamiento de cataratas.

6. **Traumatología**: Lesiones, fracturas y enfermedades musculoesqueléticas. Evaluación de lesiones, rehabilitación y cirugía ortopédica.

7. **Medicina Deportiva**: Prevención y tratamiento de lesiones deportivas. Evaluación física, planes de entrenamiento y recuperación.

8. **Odontología**: Cuidado dental completo. Limpieza dental, ortodoncia e implantes dentales.

9. **Farmacología**: Asesoría sobre medicamentos e interacciones farmacológicas.

10. **Laboratorio Clínico**: Análisis clínicos con resultados rápidos. Análisis de sangre, pruebas genéticas y estudios especializados.

11. **Vacunación**: Programas de inmunización para todas las edades. Vacunas infantiles, de viaje y para adultos.

12. **Telemedicina**: Consultas médicas remotas. Videoconsultas HD, chat médico 24/7 y expediente digital.`,
        metadata: {
            title: "Especialidades médicas disponibles",
            category: "services",
            url: "/servicios",
            keywords: ["especialidad", "servicio", "médico", "cardiología", "neurología", "pediatría", "oftalmología", "traumatología", "odontología", "laboratorio", "telemedicina"]
        }
    },

    // ===== ORGANIZACIONES =====
    {
        content: `Red-Salud ofrece planes empresariales personalizados para organizaciones de salud, todos con 1 mes de prueba gratis:

**Farmacias**: Recetas electrónicas, gestión de inventario y conexión directa con médicos.

**Laboratorios**: Resultados digitales, notificaciones automáticas e historial de pacientes.

**Clínicas**: Gestión de múltiples médicos, dashboard administrativo centralizado.

**Ambulancias**: Solicitudes en tiempo real, geolocalización y coordinación de emergencias.

**Seguros**: Verificación de cobertura, autorizaciones electrónicas y reportes detallados.

Para más información sobre precios empresariales, contacta a nuestro equipo de ventas.`,
        metadata: {
            title: "Planes empresariales",
            category: "pricing",
            url: "/precios",
            keywords: ["empresa", "farmacia", "laboratorio", "clínica", "ambulancia", "seguro", "organización", "corporativo"]
        }
    },

    // ===== FUNCIONALIDADES =====
    {
        content: `Para agendar una cita en Red-Salud:
1. Inicia sesión en tu cuenta
2. Ve a la sección "Citas" o "Agendar cita"
3. Selecciona la especialidad médica que necesitas
4. Elige un médico disponible
5. Selecciona fecha y hora que te convenga
6. Confirma tu cita

Recibirás un recordatorio antes de tu cita. También puedes agendar citas por telemedicina si prefieres una consulta virtual.`,
        metadata: {
            title: "Cómo agendar una cita",
            category: "howto",
            url: "/soporte/guias/citas",
            keywords: ["agendar", "cita", "reservar", "turno", "consulta", "cómo"]
        }
    },
    {
        content: `Para cancelar o reprogramar una cita:
1. Ve a "Mis Citas" en tu dashboard
2. Encuentra la cita que deseas modificar
3. Haz clic en "Cancelar" o "Reprogramar"
4. Si reprogramas, selecciona la nueva fecha y hora
5. Confirma los cambios

Te recomendamos hacerlo con al menos 24 horas de anticipación para evitar cargos.`,
        metadata: {
            title: "Cancelar o reprogramar cita",
            category: "howto",
            url: "/soporte/articulos/cancelar-cita",
            keywords: ["cancelar", "reprogramar", "cita", "cambiar", "fecha"]
        }
    },
    {
        content: `La telemedicina en Red-Salud te permite tener consultas médicas por videollamada. Para prepararte:
1. Asegúrate de tener buena conexión a internet
2. Usa un dispositivo con cámara y micrófono
3. Busca un lugar privado y bien iluminado
4. Ten a la mano tus medicamentos actuales y síntomas a discutir
5. Conecta unos minutos antes de la hora de la cita

Las videoconsultas son en HD y puedes chatear con tu médico antes y después de la consulta.`,
        metadata: {
            title: "Telemedicina y videoconsultas",
            category: "howto",
            url: "/soporte/guias/telemedicina",
            keywords: ["telemedicina", "videoconsulta", "virtual", "online", "videollamada"]
        }
    },
    {
        content: `Tu historial médico digital en Red-Salud incluye:
- Todas tus citas pasadas y futuras
- Diagnósticos y tratamientos
- Recetas electrónicas
- Resultados de laboratorio
- Documentos médicos
- Métricas de salud

Para acceder, ve a "Mi Historial" o "Expediente" en tu dashboard. Puedes descargar o compartir tu historial con otros médicos de forma segura.`,
        metadata: {
            title: "Historial médico digital",
            category: "features",
            url: "/soporte/articulos/acceder-historial",
            keywords: ["historial", "expediente", "historia clínica", "documentos", "récord médico"]
        }
    },
    {
        content: `Las recetas electrónicas en Red-Salud:
- Son emitidas por tu médico después de la consulta
- Se almacenan en tu historial digital
- Puedes descargarlas en PDF
- Son aceptadas en farmacias asociadas
- Incluyen código QR de verificación

Para ver tus recetas, ve a "Recetas" en tu dashboard o dentro del detalle de tu cita.`,
        metadata: {
            title: "Recetas electrónicas",
            category: "features",
            url: "/servicios",
            keywords: ["receta", "medicamento", "prescripción", "farmacia"]
        }
    },

    // ===== SOPORTE Y AYUDA =====
    {
        content: `Para obtener soporte en Red-Salud tienes varias opciones:

**Chat en vivo**: Respuesta inmediata, disponible 24/7. Es la opción más rápida.

**Email**: Respuesta en 24 horas. Escríbenos a soporte@red-salud.com

**Teléfono**: Lunes a Viernes de 8am a 8pm. Habla directamente con un agente.

**Videollamada de soporte**: Con cita previa para asistencia personalizada.

Nuestras estadísticas de soporte:
- Tiempo de respuesta en chat: menos de 2 minutos
- Satisfacción del cliente: 98%
- Más de 50,000 tickets resueltos`,
        metadata: {
            title: "Opciones de soporte",
            category: "support",
            url: "/soporte",
            keywords: ["soporte", "ayuda", "contacto", "chat", "teléfono", "email", "problema"]
        }
    },
    {
        content: `Puedes configurar notificaciones y recordatorios para:
- Recordatorios de citas (1 día antes, 1 hora antes)
- Nuevos mensajes de tu médico
- Resultados de laboratorio disponibles
- Renovación de recetas
- Alertas de salud

Ve a Configuración > Notificaciones para personalizar qué alertas recibir y por qué medio (email, SMS, push).`,
        metadata: {
            title: "Configurar notificaciones",
            category: "howto",
            url: "/soporte/articulos/configurar-notificaciones",
            keywords: ["notificación", "recordatorio", "alerta", "configurar", "avisos"]
        }
    },

    // ===== SEGURIDAD Y PRIVACIDAD =====
    {
        content: `La seguridad de tus datos en Red-Salud:
- Usamos encriptación de grado médico
- Cumplimos con regulaciones de privacidad de salud
- Toda la información está encriptada y protegida
- Tus datos nunca se comparten sin tu consentimiento
- Puedes solicitar la eliminación de tu cuenta y datos

Tu cuenta funciona en cualquier dispositivo. Solo inicia sesión con tus credenciales.`,
        metadata: {
            title: "Seguridad y privacidad",
            category: "security",
            url: "/privacidad",
            keywords: ["seguridad", "privacidad", "datos", "encriptación", "protección", "seguro"]
        }
    },

    // ===== CUENTA Y PERFIL =====
    {
        content: `Para cambiar tu método de pago:
1. Ve a Configuración > Suscripción > Métodos de pago
2. Haz clic en "Agregar nuevo método" o "Editar"
3. Ingresa los datos de tu nueva tarjeta
4. Confirma los cambios

Aceptamos tarjetas de crédito y débito principales.`,
        metadata: {
            title: "Cambiar método de pago",
            category: "howto",
            url: "/soporte/articulos/cambiar-metodo-pago",
            keywords: ["pago", "tarjeta", "método", "facturación", "cambiar"]
        }
    },
    {
        content: `Para crear una cuenta en Red-Salud:
1. Ve a red-salud.com y haz clic en "Crear cuenta"
2. Selecciona tu tipo de usuario (paciente, médico, secretaria)
3. Ingresa tu correo electrónico y crea una contraseña
4. Completa tu perfil con información básica
5. Verifica tu correo electrónico

Los pacientes y secretarias tienen acceso gratuito. Los médicos tienen 30 días de prueba gratis.`,
        metadata: {
            title: "Crear cuenta",
            category: "howto",
            url: "/auth/register",
            keywords: ["crear", "cuenta", "registrar", "registro", "nueva", "empezar"]
        }
    },

    // ===== PREGUNTAS FRECUENTES ADICIONALES =====
    {
        content: `Para recuperar tu contraseña:
1. Ve a la página de inicio de sesión
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa tu correo electrónico
4. Revisa tu bandeja de entrada (y spam)
5. Haz clic en el enlace y crea una nueva contraseña`,
        metadata: {
            title: "Recuperar contraseña",
            category: "howto",
            url: "/auth/forgot-password",
            keywords: ["contraseña", "olvidé", "recuperar", "restablecer", "password"]
        }
    },
    {
        content: `Los horarios de atención dependen de cada médico y clínica. Puedes ver los horarios disponibles al momento de agendar tu cita. La plataforma está disponible 24/7 para que puedas gestionar tus citas, ver tu historial y usar el chat de soporte.`,
        metadata: {
            title: "Horarios de atención",
            category: "general",
            url: "/servicios",
            keywords: ["horario", "atención", "disponible", "cuándo", "abierto"]
        }
    }
];

/**
 * Quick suggestions for the chatbot
 */
export const suggestedQuestions = [
    "¿Cuáles son los planes y precios?",
    "¿Es gratis para pacientes?",
    "¿Cómo agendo una cita médica?",
    "¿Qué especialidades tienen?",
    "¿Cómo funciona la telemedicina?",
    "¿Cómo cancelo mi suscripción?"
];

/**
 * Categories for organizing knowledge
 */
export const knowledgeCategories = {
    general: "Información general sobre Red-Salud",
    pricing: "Precios, planes y suscripciones",
    services: "Servicios y especialidades médicas",
    howto: "Guías y tutoriales paso a paso",
    features: "Funcionalidades de la plataforma",
    support: "Soporte y ayuda al cliente",
    security: "Seguridad y privacidad"
};
