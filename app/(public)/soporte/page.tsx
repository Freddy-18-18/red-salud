"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  Book,
  FileText,
  Phone,
  Mail,
  Video,
  Shield,
  CreditCard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ExternalLink,
  Headphones,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ROUTES, CONTACT_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Categorías de ayuda
const helpCategories = [
  {
    id: "getting-started",
    icon: Zap,
    title: "Primeros pasos",
    description: "Aprende a usar Red-Salud desde cero",
    color: "teal",
    articles: 12,
    href: "/soporte/guias/primeros-pasos",
  },
  {
    id: "appointments",
    icon: Calendar,
    title: "Citas médicas",
    description: "Agenda, modifica y gestiona tus citas",
    color: "blue",
    articles: 8,
    href: "/soporte/guias/citas",
  },
  {
    id: "telemedicine",
    icon: Video,
    title: "Telemedicina",
    description: "Consultas virtuales y videollamadas",
    color: "purple",
    articles: 6,
    href: "/soporte/guias/telemedicina",
  },
  {
    id: "account",
    icon: Users,
    title: "Mi cuenta",
    description: "Perfil, seguridad y configuración",
    color: "orange",
    articles: 10,
    href: "/soporte/guias/cuenta",
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Pagos y facturación",
    description: "Suscripciones, facturas y métodos de pago",
    color: "green",
    articles: 7,
    href: "/soporte/guias/pagos",
  },
  {
    id: "security",
    icon: Shield,
    title: "Privacidad y seguridad",
    description: "Protección de datos y configuración",
    color: "red",
    articles: 5,
    href: "/soporte/guias/seguridad",
  },
];

// Artículos populares
const popularArticles = [
  {
    title: "Cómo agendar tu primera cita médica",
    category: "Primeros pasos",
    readTime: "3 min",
    href: "/soporte/articulos/agendar-primera-cita",
  },
  {
    title: "Configurar notificaciones y recordatorios",
    category: "Mi cuenta",
    readTime: "2 min",
    href: "/soporte/articulos/configurar-notificaciones",
  },
  {
    title: "Prepararte para una teleconsulta",
    category: "Telemedicina",
    readTime: "4 min",
    href: "/soporte/articulos/preparar-teleconsulta",
  },
  {
    title: "Acceder a tu historial médico",
    category: "Primeros pasos",
    readTime: "2 min",
    href: "/soporte/articulos/acceder-historial",
  },
  {
    title: "Cambiar tu método de pago",
    category: "Pagos",
    readTime: "2 min",
    href: "/soporte/articulos/cambiar-metodo-pago",
  },
  {
    title: "Cancelar o reprogramar una cita",
    category: "Citas médicas",
    readTime: "2 min",
    href: "/soporte/articulos/cancelar-cita",
  },
];

// Opciones de contacto
const contactOptions = [
  {
    icon: MessageCircle,
    title: "Chat en vivo",
    description: "Respuesta inmediata",
    availability: "24/7",
    action: "Iniciar chat",
    href: "/soporte/chat",
    color: "teal",
    popular: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "Respuesta en 24h",
    availability: "Siempre disponible",
    action: "Enviar email",
    href: `mailto:${CONTACT_INFO.EMAIL}`,
    color: "blue",
  },
  {
    icon: Phone,
    title: "Teléfono",
    description: "Habla con un agente",
    availability: "Lun-Vie 8am-8pm",
    action: "Llamar ahora",
    href: `tel:${CONTACT_INFO.PHONE}`,
    color: "green",
  },
  {
    icon: Video,
    title: "Videollamada",
    description: "Soporte personalizado",
    availability: "Con cita previa",
    action: "Agendar llamada",
    href: "/soporte/agendar-llamada",
    color: "purple",
  },
];

// Preguntas frecuentes destacadas
const quickFaqs = [
  {
    q: "¿Cómo cancelo mi suscripción?",
    a: "Ve a Configuración > Suscripción > Cancelar. Puedes cancelar en cualquier momento sin penalización.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos encriptación de grado médico y cumplimos con todas las regulaciones de privacidad de salud.",
  },
  {
    q: "¿Puedo usar Red-Salud en varios dispositivos?",
    a: "Sí, tu cuenta funciona en cualquier dispositivo. Solo inicia sesión con tus credenciales.",
  },
];

// Estadísticas de soporte
const supportStats = [
  { value: "< 2 min", label: "Tiempo de respuesta chat" },
  { value: "98%", label: "Satisfacción del cliente" },
  { value: "24/7", label: "Disponibilidad" },
  { value: "50k+", label: "Tickets resueltos" },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

function CategoryCard({ category }: { category: typeof helpCategories[0] }) {
  const Icon = category.icon;
  const colors = colorClasses[category.color];

  return (
    <Link href={category.href}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all duration-300",
          "hover:shadow-lg hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer group"
        )}
      >
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", colors.bg)}>
          <Icon className={cn("w-6 h-6", colors.text)} />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {category.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {category.articles} artículos
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
}

function ContactCard({ option }: { option: typeof contactOptions[0] }) {
  const Icon = option.icon;
  const colors = colorClasses[option.color];

  return (
    <Link href={option.href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all duration-300",
          "hover:shadow-lg cursor-pointer group",
          option.popular && "ring-2 ring-teal-500"
        )}
      >
        {option.popular && (
          <Badge className="absolute -top-2 right-4 bg-teal-500 text-white text-xs">
            Más rápido
          </Badge>
        )}
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", colors.bg)}>
          <Icon className={cn("w-6 h-6", colors.text)} />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
          {option.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          {option.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-4">
          <Clock className="w-3 h-3" />
          {option.availability}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-500 transition-all"
        >
          {option.action}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </Link>
  );
}

function ArticleCard({ article }: { article: typeof popularArticles[0] }) {
  return (
    <Link href={article.href}>
      <motion.div
        whileHover={{ x: 4 }}
        className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span>{article.category}</span>
              <span>•</span>
              <span>{article.readTime} lectura</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-teal-500 transition-colors" />
      </motion.div>
    </Link>
  );
}

export default function SoportePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return helpCategories;
    const query = searchQuery.toLowerCase();
    return helpCategories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return popularArticles;
    const query = searchQuery.toLowerCase();
    return popularArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero con búsqueda */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(20,184,166,0.15)_1px,transparent_0)] bg-[length:40px_40px]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">
              <Headphones className="w-4 h-4" />
              Centro de Ayuda
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Busca en nuestra base de conocimiento o contacta a nuestro equipo de soporte
            </p>
          </motion.div>

          {/* Barra de búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Buscar artículos, guías, preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-20"
              >
                <p className="text-sm text-zinc-500 dark:text-zinc-400 px-3 py-2">
                  {filteredArticles.length + filteredCategories.length} resultados para "{searchQuery}"
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Estadísticas de soporte */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {supportStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías de ayuda */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Explora por categoría
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Encuentra respuestas organizadas por tema
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artículos populares */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Artículos populares
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Los más consultados por nuestra comunidad
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/soporte/guias">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <div className="space-y-3">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/soporte/guias">
                Ver todos los artículos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Opciones de contacto */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Contacta con nosotros
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Elige el canal que mejor se adapte a ti
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map((option, i) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ContactCard option={option} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ rápido */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Respuestas rápidas a las dudas más comunes
            </p>
          </motion.div>

          <div className="space-y-4">
            {quickFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className={cn(
                    "p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all cursor-pointer",
                    expandedFaq === i
                      ? "border-teal-500 shadow-lg"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700"
                  )}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-white pr-4">
                      {faq.q}
                    </h3>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
                        expandedFaq === i
                          ? "bg-teal-500 text-white rotate-180"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      )}
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Button asChild variant="outline" className="rounded-full">
              <Link href={ROUTES.FAQ}>
                Ver todas las preguntas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Estado del sistema */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">
                    Todos los sistemas operativos
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Última actualización: hace 5 minutos
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/soporte/estado">
                  Ver estado completo
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-400 mb-6">
            <Sparkles className="w-4 h-4" />
            Soporte premium
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Necesitas ayuda personalizada?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Nuestro equipo de expertos está disponible para ayudarte con cualquier consulta o problema técnico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-14 px-8"
            >
              <Link href={ROUTES.CONTACTO}>
                Contactar soporte
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800 rounded-full h-14 px-8"
            >
              <Link href="/soporte/agendar-llamada">
                <Video className="w-5 h-5 mr-2" />
                Agendar videollamada
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}