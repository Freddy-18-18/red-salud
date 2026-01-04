-- Migración: Agregar contenido para la página de médicos
-- Fecha: 2025-12-12

-- Insertar contenido para Features de médicos
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'medicos', 
  'features', 
  '{
    "items": [
      {
        "title": "Agenda Digital Inteligente",
        "description": "Sistema de citas automatizado con recordatorios SMS/WhatsApp y sincronización en tiempo real",
        "benefits": ["Automatización completa", "Recordatorios inteligentes", "Sincronización en tiempo real"],
        "icon_name": "Calendar"
      },
      {
        "title": "Gestión Completa de Pacientes",
        "description": "Historial médico electrónico, expedientes digitales y seguimiento personalizado",
        "benefits": ["Historial centralizado", "Seguimiento automático", "Expedientes digitales"],
        "icon_name": "Users"
      },
      {
        "title": "Videoconsultas HD",
        "description": "Plataforma de telemedicina profesional con grabación opcional y sala de espera virtual",
        "benefits": ["Calidad HD garantizada", "Grabación opcional", "Sala de espera virtual"],
        "icon_name": "Video"
      },
      {
        "title": "Recetas Digitales Certificadas",
        "description": "Prescripciones médicas con firma electrónica válida en toda Venezuela",
        "benefits": ["Firma electrónica certificada", "Entrega instantánea", "Válidas en farmacias afiliadas"],
        "icon_name": "FileText"
      },
      {
        "title": "Pagos Seguros Automatizados",
        "description": "Cobros automáticos, facturación electrónica y múltiples métodos de pago",
        "benefits": ["Cobros automáticos", "Facturación electrónica", "Múltiples métodos de pago"],
        "icon_name": "CreditCard"
      },
      {
        "title": "Dashboard Analítico",
        "description": "Métricas de desempeño, ingresos, satisfacción de pacientes y reportes personalizados",
        "benefits": ["Métricas en tiempo real", "Reportes personalizados", "Análisis de desempeño"],
        "icon_name": "TrendingUp"
      }
    ]
  }'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar contenido para Benefits de médicos
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'medicos', 
  'benefits', 
  '[
    { 
      "title": "Aumenta tus ingresos hasta 40%", 
      "description": "Con telemedicina puedes atender más pacientes sin límites geográficos", 
      "icon": "TrendingUp",
      "color": "bg-blue-500"
    },
    { 
      "title": "Flexibilidad Total", 
      "description": "Trabaja desde cualquier lugar con horarios que se adapten a tu vida", 
      "icon": "Clock",
      "color": "bg-teal-500"
    },
    { 
      "title": "Sin Costos de Consultorio", 
      "description": "Elimina gastos de alquiler, servicios y mantenimiento de espacios físicos", 
      "icon": "Home",
      "color": "bg-indigo-500"
    },
    { 
      "title": "Herramientas Profesionales", 
      "description": "Accede a tecnología médica avanzada sin inversión adicional", 
      "icon": "Settings",
      "color": "bg-purple-500"
    },
    { 
      "title": "Soporte 24/7", 
      "description": "Equipo especializado disponible en todo momento para resolver tus dudas", 
      "icon": "Headset",
      "color": "bg-pink-500"
    },
    { 
      "title": "Cumple Normativas", 
      "description": "Plataforma certificada que cumple con regulaciones médicas venezolanas", 
      "icon": "ShieldCheck",
      "color": "bg-orange-500"
    }
  ]'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar contenido para Process de médicos
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'medicos', 
  'process', 
  '[
    { 
      "title": "Registro y Verificación", 
      "description": "Crea tu perfil profesional. Nuestro equipo verifica tu título y colegiación en 24-48 horas.", 
      "step": 1, 
      "icon": "UserCheck" 
    },
    { 
      "title": "Configura tu Consultorio", 
      "description": "Establece tus horarios, precios, especialidades y servicios. Personaliza tu perfil público.", 
      "step": 2, 
      "icon": "Settings" 
    },
    { 
      "title": "Recibe Pacientes", 
      "description": "Los pacientes te encuentran, agendan citas y pagan online. Tú solo atiendes.", 
      "step": 3, 
      "icon": "Calendar" 
    },
    { 
      "title": "Crece tu Práctica", 
      "description": "Analiza métricas, optimiza horarios y expande tu alcance con nuestra tecnología.", 
      "step": 4, 
      "icon": "BarChart3" 
    }
  ]'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar contenido para FAQs de médicos
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'medicos', 
  'faqs', 
  '[
    {
      "question": "¿Cómo funciona el proceso de verificación?",
      "answer": "Una vez que te registras, nuestro equipo de cumplimiento verifica tu título médico y colegiación con el Colegio de Médicos de Venezuela. Este proceso toma entre 24-48 horas hábiles. Necesitarás subir tu título universitario, certificado de colegiación vigente y cédula de identidad."
    },
    {
      "question": "¿Qué comisión cobra Red-Salud?",
      "answer": "Depende de tu plan. Plan Básico: 15% por consulta. Plan Profesional: 10% por consulta + suscripción mensual de $29. Plan Premium: 0% comisión + suscripción mensual de $79. Todos los planes incluyen procesamiento de pagos sin costos adicionales."
    },
    {
      "question": "¿Puedo usar mi propia agenda y solo usar Red-Salud para videoconsultas?",
      "answer": "Sí, ofrecemos integración con calendarios externos (Google Calendar, Outlook). Sin embargo, recomendamos usar nuestra agenda integrada para aprovechar recordatorios automáticos, confirmaciones de citas y sincronización con el historial del paciente."
    },
    {
      "question": "¿Las recetas digitales son legalmente válidas?",
      "answer": "Absolutamente. Nuestras recetas médicas cuentan con firma electrónica certificada conforme a la Ley de Mensajes de Datos y Firmas Electrónicas de Venezuela. Son válidas en todas las farmacias afiliadas a nuestra red (500+ en todo el país) y en farmacias que acepten recetas digitales."
    },
    {
      "question": "¿Qué pasa si tengo problemas técnicos durante una consulta?",
      "answer": "Contamos con soporte técnico 24/7 para médicos. Si experimentas problemas durante una videoconsulta, puedes llamar a nuestro soporte inmediato que te ayudará a resolverlo en minutos. Además, el sistema automáticamente reprograma la cita sin cargo si hay problemas técnicos comprobados."
    },
    {
      "question": "¿Puedo atender pacientes internacionales?",
      "answer": "Sí, la plataforma te permite atender pacientes en cualquier país. Sin embargo, debes cumplir con las regulaciones médicas del país donde se encuentra el paciente. Actualmente, la mayoría de nuestros médicos atienden pacientes venezolanos en el exterior y turismo médico hacia Venezuela."
    },
    {
      "question": "¿Cómo funcionan los pagos? ¿Cuándo recibo mi dinero?",
      "answer": "Los pacientes pagan por adelantado al agendar. El dinero se retiene en una cuenta escrow y se libera a tu cuenta bancaria 24 horas después de completar la consulta. Esto protege tanto al médico como al paciente. Puedes retirar tu dinero acumulado cada semana o mensualmente."
    },
    {
      "question": "¿Necesito equipo especial o internet de alta velocidad?",
      "answer": "No necesitas equipo especial. Funciona con cualquier computadora, tablet o smartphone con cámara y micrófono. En cuanto a internet, recomendamos mínimo 5 Mbps de bajada y 2 Mbps de subida para videoconsultas en calidad HD. La plataforma se adapta automáticamente a tu velocidad de internet."
    }
  ]'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar contenido para Pricing de médicos
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'medicos', 
  'pricing', 
  '[
    {
      "name": "Básico",
      "price": "Gratis",
      "period": "para siempre",
      "description": "Perfecto para comenzar",
      "features": [
        "Hasta 10 pacientes/mes",
        "Agenda digital básica",
        "Videoconsultas ilimitadas",
        "Recetas digitales",
        "Comisión 15% por consulta"
      ],
      "cta": "Comenzar Gratis",
      "popular": false
    },
    {
      "name": "Profesional",
      "price": "$29",
      "period": "/mes",
      "description": "Para médicos activos",
      "features": [
        "Pacientes ilimitados",
        "Agenda avanzada con IA",
        "Videoconsultas HD grabables",
        "Recetas e informes digitales",
        "Comisión reducida 10%",
        "Soporte prioritario",
        "Dashboard analítico"
      ],
      "cta": "Prueba 30 días gratis",
      "popular": true
    },
    {
      "name": "Premium",
      "price": "$79",
      "period": "/mes",
      "description": "Para consultorios múltiples",
      "features": [
        "Todo de Profesional",
        "Multi-consultorio (hasta 3)",
        "Secretaria virtual incluida",
        "Sin comisiones por consulta",
        "API personalizada",
        "Marca blanca disponible",
        "Account manager dedicado"
      ],
      "cta": "Agendar Demo",
      "popular": false
    }
  ]'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar testimonios de médicos
INSERT INTO testimonials (name, role, content, rating, page_context, is_featured)
VALUES
('Dr. Carlos Mendoza', 'Cardiólogo', 'En 6 meses aumenté mis ingresos en un 35%. La plataforma es excelente y los pacientes la aman. Ahora atiendo pacientes de todo el país sin moverme de casa.', 5, 'medicos', true),
('Dra. María González', 'Pediatra', 'Como madre, la flexibilidad de horarios es invaluable. Puedo atender pacientes temprano en la mañana o tarde en la noche. La calidad del video es perfecta.', 5, 'medicos', true),
('Dr. Roberto Silva', 'Dermatólogo', 'Las herramientas de diagnóstico visual son sorprendentes. Puedo ver manchas y lesiones con gran detalle. Mis pacientes están fascinados con el servicio.', 5, 'medicos', true)
ON CONFLICT DO NOTHING;