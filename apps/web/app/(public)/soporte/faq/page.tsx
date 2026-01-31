"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Calendar,
  Video,
  CreditCard,
  Shield,
  Users,
  FileText,
  MessageCircle,
} from "lucide-react";
import { Input } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@red-salud/core/utils";

const faqCategories = [
  { id: "all", label: "Todas", icon: HelpCircle },
  { id: "cuenta", label: "Mi cuenta", icon: Users },
  { id: "citas", label: "Citas", icon: Calendar },
  { id: "telemedicina", label: "Telemedicina", icon: Video },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "medicos", label: "Para médicos", icon: FileText },
];

const faqs = [
  {
    category: "cuenta",
    q: "¿Cómo creo una cuenta en Red-Salud?",
    a: "Puedes crear una cuenta gratuita haciendo clic en 'Registrarse' en la página principal. Solo necesitas tu email, crear una contraseña y completar tu perfil básico. El proceso toma menos de 2 minutos.",
  },
  {
    category: "cuenta",
    q: "¿Cómo recupero mi contraseña?",
    a: "Ve a la página de inicio de sesión y haz clic en '¿Olvidaste tu contraseña?'. Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña. El enlace es válido por 24 horas.",
  },
  {
    category: "cuenta",
    q: "¿Puedo cambiar mi email de registro?",
    a: "Sí, puedes cambiar tu email desde Configuración > Mi perfil > Email. Deberás verificar el nuevo email antes de que el cambio sea efectivo.",
  },
  {
    category: "cuenta",
    q: "¿Cómo elimino mi cuenta?",
    a: "Puedes solicitar la eliminación de tu cuenta desde Configuración > Privacidad > Eliminar cuenta. Ten en cuenta que esta acción es irreversible y perderás acceso a tu historial médico.",
  },
  {
    category: "citas",
    q: "¿Cómo agendo una cita médica?",
    a: "Desde tu dashboard, ve a 'Citas' > 'Nueva cita'. Selecciona la especialidad, el médico disponible, fecha y hora. Recibirás una confirmación por email y notificación en la app.",
  },
  {
    category: "citas",
    q: "¿Puedo cancelar o reprogramar mi cita?",
    a: "Sí, puedes cancelar o reprogramar hasta 2 horas antes de la cita sin costo. Ve a 'Mis citas' y selecciona la opción correspondiente. Cancelaciones tardías pueden tener cargo.",
  },
  {
    category: "citas",
    q: "¿Qué pasa si el médico cancela mi cita?",
    a: "Si el médico cancela, recibirás notificación inmediata y se te ofrecerá reprogramar con el mismo médico u otro disponible. Si ya pagaste, recibirás reembolso completo.",
  },
  {
    category: "citas",
    q: "¿Cómo veo mi historial de citas?",
    a: "En tu dashboard, ve a 'Citas' > 'Historial'. Ahí encontrarás todas tus citas pasadas con detalles, diagnósticos y recetas asociadas.",
  },
  {
    category: "telemedicina",
    q: "¿Qué necesito para una teleconsulta?",
    a: "Necesitas un dispositivo con cámara y micrófono (computadora, tablet o smartphone), conexión a internet estable (mínimo 5 Mbps), y un lugar privado y bien iluminado.",
  },
  {
    category: "telemedicina",
    q: "¿Cómo me conecto a mi teleconsulta?",
    a: "15 minutos antes de tu cita, recibirás un recordatorio con el enlace. Haz clic en 'Unirse a consulta' desde tu dashboard o el email. Recomendamos probar tu cámara y audio antes.",
  },
  {
    category: "telemedicina",
    q: "¿Qué hago si tengo problemas técnicos durante la consulta?",
    a: "Si pierdes conexión, intenta reconectarte con el mismo enlace. Si el problema persiste, el médico te contactará por teléfono. También puedes contactar soporte técnico en tiempo real.",
  },
  {
    category: "telemedicina",
    q: "¿Las teleconsultas quedan grabadas?",
    a: "Por defecto no se graban. Si el médico necesita grabar por razones médicas, te pedirá consentimiento explícito. Tú también puedes solicitar grabación para tu registro personal.",
  },
  {
    category: "pagos",
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencia bancaria y algunos seguros médicos. Los métodos disponibles pueden variar por país.",
  },
  {
    category: "pagos",
    q: "¿Cómo funciona la suscripción para médicos?",
    a: "Los médicos pagan $30/mes o $240/año (ahorro del 33%). Incluye pacientes ilimitados, todas las funcionalidades y soporte prioritario. Puedes cancelar en cualquier momento.",
  },
  {
    category: "pagos",
    q: "¿Cómo obtengo mi factura?",
    a: "Las facturas se generan automáticamente y se envían a tu email. También puedes descargarlas desde Configuración > Facturación > Historial de pagos.",
  },
  {
    category: "pagos",
    q: "¿Ofrecen reembolsos?",
    a: "Sí, ofrecemos reembolso completo dentro de los primeros 7 días si no estás satisfecho. Para consultas canceladas por el médico, el reembolso es automático.",
  },
  {
    category: "seguridad",
    q: "¿Mis datos médicos están seguros?",
    a: "Absolutamente. Usamos encriptación AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Cumplimos con HIPAA, GDPR y regulaciones locales de protección de datos de salud.",
  },
  {
    category: "seguridad",
    q: "¿Quién puede ver mi historial médico?",
    a: "Solo tú y los médicos que autorices explícitamente. Puedes gestionar permisos desde Configuración > Privacidad > Acceso a mi historial. Cada acceso queda registrado.",
  },
  {
    category: "seguridad",
    q: "¿Cómo activo la autenticación de dos factores?",
    a: "Ve a Configuración > Seguridad > Autenticación de dos factores. Puedes usar una app autenticadora (Google Authenticator, Authy) o recibir códigos por SMS.",
  },
  {
    category: "seguridad",
    q: "¿Qué hago si creo que mi cuenta fue comprometida?",
    a: "Cambia tu contraseña inmediatamente desde Configuración > Seguridad. Revisa la actividad reciente y cierra sesiones activas. Contacta soporte si ves actividad sospechosa.",
  },
  {
    category: "medicos",
    q: "¿Cómo me registro como médico?",
    a: "Selecciona 'Soy profesional de salud' al registrarte. Deberás subir tu cédula profesional y documentos de verificación. El proceso de validación toma 24-48 horas.",
  },
  {
    category: "medicos",
    q: "¿Cómo configuro mi disponibilidad?",
    a: "Desde tu dashboard médico, ve a 'Agenda' > 'Configurar disponibilidad'. Puedes establecer horarios por día, duración de consultas y bloquear fechas específicas.",
  },
  {
    category: "medicos",
    q: "¿Cómo emito recetas electrónicas?",
    a: "Durante o después de una consulta, ve a 'Recetas' > 'Nueva receta'. Selecciona medicamentos del catálogo, indica dosis y duración. La receta se envía automáticamente al paciente.",
  },
  {
    category: "medicos",
    q: "¿Puedo tener secretaria en mi cuenta?",
    a: "Sí, puedes vincular cuentas de secretaria sin costo adicional. Ellas pueden gestionar tu agenda, confirmar citas y comunicarse con pacientes, pero no acceden a historiales médicos.",
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle
}: {
  faq: typeof faqs[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const category = faqCategories.find((c) => c.id === faq.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-2xl transition-all overflow-hidden",
        isOpen
          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 shadow-lg"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-300 dark:hover:border-teal-700"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.label}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-white pr-8">
            {faq.q}
          </h3>
        </div>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
            isOpen
              ? "bg-teal-500 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          )}
        >
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    let result = faqs;

    // Filtrar por categoría
    if (activeCategory !== "all") {
      result = result.filter((faq) => faq.category === activeCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.q.toLowerCase().includes(query) ||
          faq.a.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(20,184,166,0.15)_1px,transparent_0)] bg-[length:40px_40px]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              Preguntas frecuentes
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
              Encuentra respuestas rápidas a las preguntas más comunes sobre Red-Salud
            </p>

            {/* Barra de búsqueda */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = category.id === "all"
                ? faqs.length
                : faqs.filter((f) => f.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setOpenFaq(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-teal-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lista de FAQs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                No encontramos resultados
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Intenta con otros términos o explora las categorías
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                Limpiar filtros
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  faq={faq}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-12 px-8"
            >
              <Link href={ROUTES.CONTACTO}>Contactar soporte</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 px-8"
            >
              <Link href={ROUTES.SOPORTE}>Volver al centro de ayuda</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
