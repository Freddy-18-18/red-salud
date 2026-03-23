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
    },

    // ===== ESPECIALIDADES MÉDICAS - LISTADO COMPLETO =====
    {
        content: `Red-Salud cuenta con más de 100 especialidades médicas organizadas en categorías:

**Medicina General y Familiar:** Medicina General, Medicina Familiar, Geriatría, Medicina Interna.

**Cardiología y Sistema Cardiovascular:** Cardiología, Cardiología Intervencionista, Electrofisiología Cardíaca, Hemodinamia, Cardiología Pediátrica, Cirugía Cardiovascular.

**Neurología y Sistema Nervioso:** Neurología, Neurocirugía, Neurología Pediátrica, Neurofisiología Clínica, Neuropsicología.

**Sistema Digestivo:** Gastroenterología, Hepatología, Coloproctología, Gastroenterología Pediátrica, Endoscopia Digestiva.

**Sistema Respiratorio:** Neumología, Neumología Pediátrica, Cirugía Torácica, Medicina del Sueño.

**Sistema Renal y Urológico:** Nefrología, Nefrología Pediátrica, Urología, Urología Pediátrica, Andrología.

**Endocrinología y Metabolismo:** Endocrinología, Diabetología, Endocrinología Pediátrica, Nutriología.

**Reumatología:** Reumatología, Reumatología Pediátrica.

**Hematología y Oncología:** Hematología, Oncología Médica, Oncología Radioterápica, Hemato-Oncología Pediátrica, Mastología.

**Infectología e Inmunología:** Infectología, Infectología Pediátrica, Inmunología, Alergología.

**Dermatología:** Dermatología, Dermato-oncología, Dermatopatología, Dermatología Pediátrica.

**Psiquiatría y Salud Mental:** Psiquiatría, Psiquiatría Infantil, Psicología Clínica, Sexología Clínica.

**Cirugía:** Cirugía General, Cirugía Bariátrica, Cirugía Laparoscópica, Cirugía Oncológica, Cirugía Pediátrica.

**Traumatología:** Traumatología y Ortopedia, Artroscopia, Cirugía de Columna, Cirugía de Mano, Medicina del Deporte, Ortopedia Pediátrica.

**Oftalmología:** Oftalmología, Retina y Vítreo, Glaucoma, Oftalmología Pediátrica, Cirugía Refractiva.

**Otorrinolaringología:** Otorrinolaringología, Audiología, Foniatría.

**Ginecología y Obstetricia:** Ginecología, Obstetricia, Medicina Reproductiva, Ginecología Oncológica, Medicina Materno-Fetal.

**Pediatría:** Pediatría, Neonatología, Cuidados Intensivos Pediátricos.

**Odontología:** Odontología, Ortodoncia, Endodoncia, Periodoncia, Implantología Dental, Cirugía Oral.

Para buscar un especialista, ve a /especialidades y usa el buscador o navega por categorías.`,
        metadata: {
            title: "Listado completo de especialidades médicas",
            category: "services",
            url: "/especialidades",
            keywords: ["especialidad", "especialidades", "médico", "doctor", "lista", "todas", "categoría", "buscar especialista", "qué especialidades tienen", "cuantas especialidades"]
        }
    },

    // ===== CARDIOLOGÍA =====
    {
        content: `La Cardiología es la especialidad médica del corazón y sistema cardiovascular. Los cardiólogos diagnostican y tratan enfermedades como hipertensión, arritmias, insuficiencia cardíaca e infarto.

**¿Cuándo consultar a un cardiólogo?**
- Dolor en el pecho o sensación de opresión
- Dificultad para respirar
- Palpitaciones o latidos irregulares
- Mareos o desmayos frecuentes
- Hipertensión arterial
- Antecedentes familiares de enfermedades cardíacas

**Subespecialidades disponibles:**
- Cardiología Intervencionista
- Electrofisiología Cardíaca
- Hemodinamia
- Cardiología Pediátrica
- Cirugía Cardiovascular

El chequeo cardíaco preventivo se recomienda a partir de los 40 años o antes si hay factores de riesgo.`,
        metadata: {
            title: "Cardiología - Especialistas del corazón",
            category: "services",
            url: "/especialidades/cardiologia",
            keywords: ["cardiología", "cardiólogo", "corazón", "hipertensión", "arritmia", "infarto", "palpitaciones"]
        }
    },

    // ===== NEUROLOGÍA =====
    {
        content: `La Neurología trata los trastornos del sistema nervioso: cerebro, médula espinal y nervios periféricos. Los neurólogos diagnostican enfermedades como migraña, epilepsia, Parkinson, Alzheimer y esclerosis múltiple.

**¿Cuándo consultar a un neurólogo?**
- Dolores de cabeza frecuentes o intensos
- Pérdida de memoria o confusión
- Mareos o vértigo
- Hormigueo o adormecimiento
- Convulsiones
- Problemas de coordinación o equilibrio
- Cambios en la visión

**Subespecialidades:**
- Neurocirugía
- Neurología Pediátrica
- Neurofisiología Clínica
- Neuropsicología`,
        metadata: {
            title: "Neurología - Sistema nervioso",
            category: "services",
            url: "/especialidades/neurologia",
            keywords: ["neurología", "neurólogo", "cerebro", "migraña", "dolor de cabeza", "epilepsia", "Parkinson", "Alzheimer", "nervios"]
        }
    },

    // ===== PEDIATRÍA =====
    {
        content: `La Pediatría es la especialidad médica dedicada a la salud de niños y adolescentes, desde el nacimiento hasta los 18 años. Los pediatras realizan controles de crecimiento, vacunación y tratan enfermedades infantiles.

**¿Cuándo llevar a tu hijo al pediatra?**
- Controles de niño sano (mensuales el primer año)
- Fiebre alta o persistente
- Problemas respiratorios
- Vómitos o diarrea
- Sarpullidos o erupciones
- Dolor persistente
- Cambios de comportamiento
- Vacunación según calendario

**Subespecialidades pediátricas:**
- Neonatología (recién nacidos)
- Cuidados Intensivos Pediátricos
- Medicina del Adolescente
- Cardiología Pediátrica
- Neurología Pediátrica
- Gastroenterología Pediátrica`,
        metadata: {
            title: "Pediatría - Salud infantil",
            category: "services",
            url: "/especialidades/pediatria",
            keywords: ["pediatría", "pediatra", "niños", "bebé", "infantil", "vacunas", "control niño sano", "adolescente"]
        }
    },

    // ===== GINECOLOGÍA =====
    {
        content: `La Ginecología atiende la salud del sistema reproductivo femenino. Las ginecólogas/os realizan exámenes preventivos, citologías, controlan el embarazo y tratan trastornos menstruales.

**¿Cuándo consultar a un ginecólogo?**
- Examen anual preventivo (Papanicolaou)
- Irregularidades menstruales
- Dolor pélvico o menstrual intenso
- Planificación familiar y anticoncepción
- Síntomas de menopausia
- Sospecha de embarazo
- Infecciones o flujo anormal

**Subespecialidades:**
- Obstetricia (embarazo y parto)
- Medicina Reproductiva (fertilidad)
- Ginecología Oncológica
- Medicina Materno-Fetal`,
        metadata: {
            title: "Ginecología y Obstetricia - Salud femenina",
            category: "services",
            url: "/especialidades/ginecologia",
            keywords: ["ginecología", "ginecólogo", "mujer", "menstruación", "embarazo", "obstetricia", "papanicolaou", "citología", "menopausia"]
        }
    },

    // ===== DERMATOLOGÍA =====
    {
        content: `La Dermatología trata enfermedades de la piel, cabello y uñas. Los dermatólogos diagnostican desde acné y eczema hasta cáncer de piel.

**¿Cuándo consultar a un dermatólogo?**
- Acné persistente
- Manchas o lunares que cambian
- Erupciones, sarpullidos o alergias cutáneas
- Caída de cabello
- Psoriasis o dermatitis
- Hongos en uñas o piel
- Revisión anual de lunares

**La regla ABCDE para lunares sospechosos:**
- Asimetría
- Bordes irregulares
- Color desigual
- Diámetro mayor a 6mm
- Evolución (cambios)`,
        metadata: {
            title: "Dermatología - Salud de la piel",
            category: "services",
            url: "/especialidades/dermatologia",
            keywords: ["dermatología", "dermatólogo", "piel", "acné", "manchas", "lunares", "eczema", "psoriasis", "cabello"]
        }
    },

    // ===== TRAUMATOLOGÍA =====
    {
        content: `La Traumatología y Ortopedia trata lesiones y enfermedades del sistema musculoesquelético: huesos, articulaciones, músculos, tendones y ligamentos.

**¿Cuándo consultar a un traumatólogo?**
- Fracturas o sospecha de fractura
- Dolor de espalda o columna
- Dolor de rodilla, cadera u hombro
- Esguinces y luxaciones
- Lesiones deportivas
- Artritis o artrosis
- Hernias discales

**Subespecialidades:**
- Artroscopia (cirugía mínimamente invasiva)
- Cirugía de Columna
- Cirugía de Mano
- Medicina del Deporte
- Ortopedia Pediátrica`,
        metadata: {
            title: "Traumatología y Ortopedia",
            category: "services",
            url: "/especialidades/traumatologia",
            keywords: ["traumatología", "traumatólogo", "ortopedia", "huesos", "fracturas", "espalda", "rodilla", "articulaciones", "deportivo"]
        }
    },

    // ===== OFTALMOLOGÍA =====
    {
        content: `La Oftalmología es la especialidad de la salud visual. Los oftalmólogos diagnostican y tratan enfermedades de los ojos como cataratas, glaucoma, y problemas de refracción.

**¿Cuándo consultar a un oftalmólogo?**
- Visión borrosa o cambios en la visión
- Ojos rojos frecuentes
- Dolor ocular
- Sensibilidad a la luz
- Manchas flotantes (moscas volantes)
- Diabetes (control oftalmológico anual)
- Mayores de 40 años (screening de glaucoma)

**Subespecialidades:**
- Retina y Vítreo
- Glaucoma
- Oftalmología Pediátrica
- Cirugía Refractiva (LASIK)
- Optometría`,
        metadata: {
            title: "Oftalmología - Salud visual",
            category: "services",
            url: "/especialidades/oftalmologia",
            keywords: ["oftalmología", "oftalmólogo", "ojos", "visión", "anteojos", "lentes", "cataratas", "glaucoma", "miopía"]
        }
    },

    // ===== PSIQUIATRÍA =====
    {
        content: `La Psiquiatría es la especialidad médica de la salud mental. Los psiquiatras diagnostican y tratan trastornos como depresión, ansiedad, trastorno bipolar y esquizofrenia.

**¿Cuándo consultar a un psiquiatra?**
- Tristeza persistente o depresión
- Ansiedad que interfiere con la vida diaria
- Cambios severos de ánimo
- Insomnio crónico
- Pensamientos de hacerse daño
- Adicciones
- Trastornos de alimentación
- Alucinaciones o delirios

**Subespecialidades:**
- Psiquiatría Infantil y del Adolescente
- Psicología Clínica
- Sexología Clínica
- Adicciones y Toxicomanías

La diferencia entre psiquiatra y psicólogo: el psiquiatra es médico y puede recetar medicamentos; el psicólogo realiza terapia psicológica.`,
        metadata: {
            title: "Psiquiatría y Salud Mental",
            category: "services",
            url: "/especialidades/psiquiatria",
            keywords: ["psiquiatría", "psiquiatra", "salud mental", "depresión", "ansiedad", "psicólogo", "terapia", "bipolar"]
        }
    },

    // ===== ODONTOLOGÍA =====
    {
        content: `La Odontología cuida la salud bucal: dientes, encías y boca. Los dentistas realizan limpiezas, extracciones, empastes y tratamientos preventivos.

**¿Cuándo ir al dentista?**
- Revisión y limpieza semestral
- Dolor de muelas
- Sangrado de encías
- Mal aliento persistente
- Caries o manchas en dientes
- Dientes flojos o móviles
- Corrección de mordida

**Subespecialidades odontológicas:**
- Ortodoncia (brackets, alineadores)
- Endodoncia (tratamiento de conducto)
- Periodoncia (encías)
- Implantología Dental
- Cirugía Oral y Maxilofacial
- Odontopediatría (niños)
- Prostodoncia (prótesis)`,
        metadata: {
            title: "Odontología - Salud bucal",
            category: "services",
            url: "/especialidades/odontologia",
            keywords: ["odontología", "dentista", "dientes", "muelas", "encías", "ortodoncia", "brackets", "caries", "limpieza dental"]
        }
    },

    // ===== GASTROENTEROLOGÍA =====
    {
        content: `La Gastroenterología trata enfermedades del sistema digestivo: esófago, estómago, intestinos, hígado, páncreas y vesícula.

**¿Cuándo consultar a un gastroenterólogo?**
- Acidez o reflujo frecuente
- Dolor abdominal persistente
- Náuseas o vómitos recurrentes
- Diarrea o estreñimiento crónico
- Sangre en las heces
- Problemas de hígado
- Pérdida de peso inexplicable

**Subespecialidades:**
- Hepatología (hígado)
- Coloproctología (colon y recto)
- Endoscopia Digestiva
- Gastroenterología Pediátrica`,
        metadata: {
            title: "Gastroenterología - Sistema digestivo",
            category: "services",
            url: "/especialidades/gastroenterologia",
            keywords: ["gastroenterología", "gastroenterólogo", "digestivo", "estómago", "intestino", "hígado", "reflujo", "acidez", "colonoscopia"]
        }
    },

    // ===== UROLOGÍA =====
    {
        content: `La Urología trata enfermedades del sistema urinario (hombres y mujeres) y del aparato reproductor masculino.

**¿Cuándo consultar a un urólogo?**
- Dificultad para orinar
- Dolor al orinar o sangre en orina
- Infecciones urinarias recurrentes
- Problemas de próstata (hombres mayores de 50)
- Cálculos renales (piedras)
- Incontinencia urinaria
- Disfunción eréctil

**Subespecialidades:**
- Nefrología (riñones - enfoque médico)
- Urología Pediátrica
- Andrología (salud sexual masculina)`,
        metadata: {
            title: "Urología - Sistema urinario",
            category: "services",
            url: "/especialidades/urologia",
            keywords: ["urología", "urólogo", "orina", "riñón", "próstata", "vejiga", "cálculos", "piedras", "incontinencia"]
        }
    },

    // ===== ENDOCRINOLOGÍA =====
    {
        content: `La Endocrinología trata trastornos hormonales y del metabolismo: diabetes, tiroides, obesidad, osteoporosis.

**¿Cuándo consultar a un endocrinólogo?**
- Diabetes tipo 1 o 2
- Problemas de tiroides (hiper/hipotiroidismo)
- Sobrepeso u obesidad
- Trastornos de crecimiento
- Síndrome de ovario poliquístico
- Osteoporosis
- Menopausia con síntomas severos

**Subespecialidades:**
- Diabetología
- Endocrinología Pediátrica
- Nutriología`,
        metadata: {
            title: "Endocrinología - Hormonas y metabolismo",
            category: "services",
            url: "/especialidades/endocrinologia",
            keywords: ["endocrinología", "endocrinólogo", "diabetes", "tiroides", "hormonas", "metabolismo", "obesidad", "osteoporosis"]
        }
    },

    // ===== NEUMOLOGÍA =====
    {
        content: `La Neumología trata enfermedades del sistema respiratorio: pulmones, bronquios y vías respiratorias.

**¿Cuándo consultar a un neumólogo?**
- Tos persistente (más de 3 semanas)
- Dificultad para respirar
- Silbidos al respirar (sibilancias)
- Asma mal controlada
- Ronquidos fuertes y apnea del sueño
- Fumadores (evaluación preventiva)
- COVID-19 con secuelas pulmonares

**Subespecialidades:**
- Neumología Pediátrica
- Cirugía Torácica
- Medicina del Sueño`,
        metadata: {
            title: "Neumología - Sistema respiratorio",
            category: "services",
            url: "/especialidades/neumologia",
            keywords: ["neumología", "neumólogo", "pulmones", "respirar", "asma", "tos", "bronquitis", "apnea", "ronquidos"]
        }
    },

    // ===== OTORRINOLARINGOLOGÍA =====
    {
        content: `La Otorrinolaringología (ORL) trata enfermedades de oído, nariz y garganta, incluyendo problemas de voz y equilibrio.

**¿Cuándo consultar a un otorrino?**
- Pérdida de audición o zumbidos
- Infecciones de oído recurrentes
- Sinusitis o congestión nasal crónica
- Ronquera persistente
- Amigdalitis frecuentes
- Vértigo o problemas de equilibrio
- Sangrado nasal frecuente

**Subespecialidades:**
- Audiología
- Foniatría (voz y habla)
- Cirugía de Cabeza y Cuello`,
        metadata: {
            title: "Otorrinolaringología - Oído, nariz y garganta",
            category: "services",
            url: "/especialidades/otorrinolaringologia",
            keywords: ["otorrinolaringología", "otorrino", "oído", "nariz", "garganta", "sinusitis", "amígdalas", "audición", "sordera"]
        }
    },

    // ===== ONCOLOGÍA =====
    {
        content: `La Oncología es la especialidad del diagnóstico y tratamiento del cáncer. Los oncólogos coordinan quimioterapia, inmunoterapia y cuidados integrales del paciente oncológico.

**¿Cuándo consultar a un oncólogo?**
- Diagnóstico de cáncer confirmado
- Bultos o masas sospechosas
- Pérdida de peso inexplicable
- Síntomas persistentes sin causa clara
- Segunda opinión oncológica
- Antecedentes familiares fuertes de cáncer

**Tipos de oncología:**
- Oncología Médica (quimioterapia)
- Oncología Radioterápica (radioterapia)
- Cirugía Oncológica
- Hemato-Oncología (cánceres de sangre)
- Mastología (mama)`,
        metadata: {
            title: "Oncología - Tratamiento del cáncer",
            category: "services",
            url: "/especialidades/oncologia",
            keywords: ["oncología", "oncólogo", "cáncer", "tumor", "quimioterapia", "radioterapia", "biopsia", "mastología", "mama"]
        }
    },

    // ===== ALERGOLOGÍA =====
    {
        content: `La Alergología diagnostica y trata reacciones alérgicas: rinitis, asma alérgica, alergias alimentarias, urticaria y anafilaxia.

**¿Cuándo consultar a un alergólogo?**
- Estornudos y congestión nasal frecuente
- Ojos llorosos y con picazón
- Urticaria o ronchas recurrentes
- Sospecha de alergia alimentaria
- Reacciones a medicamentos
- Asma alérgica
- Eczema o dermatitis atópica

**Pruebas de alergia:**
- Test cutáneos (prick test)
- Análisis de sangre (IgE)
- Pruebas de provocación`,
        metadata: {
            title: "Alergología e Inmunología",
            category: "services",
            url: "/especialidades/alergologia",
            keywords: ["alergología", "alergólogo", "alergia", "rinitis", "urticaria", "asma", "inmunología", "ronchas", "estornudos"]
        }
    },

    // ===== MEDICINA FÍSICA Y REHABILITACIÓN =====
    {
        content: `La Medicina Física y Rehabilitación ayuda a recuperar la función después de lesiones, cirugías o enfermedades. Incluye fisioterapia, terapia ocupacional y rehabilitación.

**¿Cuándo necesitas rehabilitación?**
- Después de una cirugía ortopédica
- Accidente cerebrovascular (ACV)
- Dolor de espalda crónico
- Lesiones deportivas
- Parálisis o debilidad muscular
- Enfermedades neurológicas
- Después de fracturas

**Disciplinas relacionadas:**
- Fisioterapia
- Terapia Ocupacional
- Quiropráctica
- Fonoaudiología`,
        metadata: {
            title: "Medicina Física y Rehabilitación",
            category: "services",
            url: "/especialidades/rehabilitacion",
            keywords: ["rehabilitación", "fisioterapia", "terapia física", "recuperación", "ejercicios", "dolor espalda", "lesión"]
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
 * Page-specific suggestions
 */
export const pageSuggestions: Record<string, string[]> = {
    "/precios": [
        "¿Es gratis para pacientes?",
        "¿Cuánto cuesta el plan médico?",
        "¿Tienen planes para clínicas?",
        "¿Cómo funciona la prueba gratis?"
    ],
    "/servicios": [
        "¿Qué especialidades tienen?",
        "¿Tienen pediatría?",
        "¿Cómo funciona la telemedicina?",
        "¿Hacen pruebas de laboratorio?"
    ],
    "/auth/register": [
        "¿Es gratis registrarse?",
        "¿Cómo me registro como médico?",
        "¿Qué datos necesito?",
        "¿Puedo registrarme como secretaria?"
    ],
    "/soporte": [
        "¿Cuál es el horario de atención?",
        "Quiero hablar con un humano",
        "Olvidé mi contraseña",
        "¿Cómo reportar un problema?"
    ],
    "/dashboard/medico": [
        "¿Cómo agendo un paciente?",
        "Resumen de mis citas hoy",
        "¿Cómo creo una receta?",
        "Ver historial de paciente"
    ],
    "/dashboard/medico/citas": [
        "¿Cómo reprogramo una cita?",
        "¿Qué significan los colores de las citas?",
        "¿Cómo agendo un paciente sin cuenta?",
        "Ver citas pendientes de confirmar"
    ]
};

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
