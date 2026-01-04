"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Book,
  Video,
  FileText,
  Clock,
  ChevronRight,
  Filter,
  Zap,
  Calendar,
  Users,
  CreditCard,
  Shield,
  Pill,
  Play,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GuideType = "article" | "video" | "tutorial";
type GuideLevel = "beginner" | "intermediate" | "advanced";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  type: GuideType;
  level: GuideLevel;
  readTime: number;
  views: number;
  featured?: boolean;
  href: string;
}

const categories = [
  { id: "all", label: "Todas", icon: Book },
  { id: "primeros-pasos", label: "Primeros pasos", icon: Zap },
  { id: "citas", label: "Citas médicas", icon: Calendar },
  { id: "telemedicina", label: "Telemedicina", icon: Video },
  { id: "cuenta", label: "Mi cuenta", icon: Users },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "medicamentos", label: "Medicamentos", icon: Pill },
];

const guides: Guide[] = [
  {
    id: "1",
    title: "Guía completa para empezar con Red-Salud",
    description: "Todo lo que necesitas saber para comenzar a usar la plataforma desde cero",
    category: "primeros-pasos",
    type: "tutorial",
    level: "beginner",
    readTime: 10,
    views: 15420,
    featured: true,
    href: "/soporte/guias/empezar-red-salud",
  },
  {
    id: "2",
    title: "Cómo agendar tu primera cita médica",
    description: "Paso a paso para encontrar un médico y reservar tu consulta",
    category: "citas",
    type: "article",
    level: "beginner",
    readTime: 5,
    views: 12350,
    featured: true,
    href: "/soporte/guias/agendar-cita",
  },
  {
    id: "3",
    title: "Prepararte para una teleconsulta exitosa",
    description: "Consejos y requisitos técnicos para tu consulta virtual",
    category: "telemedicina",
    type: "video",
    level: "beginner",
    readTime: 8,
    views: 9870,
    featured: true,
    href: "/soporte/guias/preparar-teleconsulta",
  },
  {
    id: "4",
    title: "Configurar tu perfil y preferencias",
    description: "Personaliza tu experiencia en Red-Salud",
    category: "cuenta",
    type: "article",
    level: "beginner",
    readTime: 4,
    views: 8540,
    href: "/soporte/guias/configurar-perfil",
  },
  {
    id: "5",
    title: "Gestionar métodos de pago",
    description: "Añade, edita y administra tus formas de pago",
    category: "pagos",
    type: "article",
    level: "beginner",
    readTime: 3,
    views: 6230,
    href: "/soporte/guias/metodos-pago",
  },
  {
    id: "6",
    title: "Activar autenticación de dos factores",
    description: "Protege tu cuenta con una capa extra de seguridad",
    category: "seguridad",
    type: "tutorial",
    level: "intermediate",
    readTime: 5,
    views: 5120,
    href: "/soporte/guias/2fa",
  },
  {
    id: "7",
    title: "Acceder a tu historial médico completo",
    description: "Consulta diagnósticos, tratamientos y documentos médicos",
    category: "primeros-pasos",
    type: "article",
    level: "beginner",
    readTime: 4,
    views: 7890,
    href: "/soporte/guias/historial-medico",
  },
  {
    id: "8",
    title: "Gestionar recordatorios de medicamentos",
    description: "Configura alertas para nunca olvidar tus medicinas",
    category: "medicamentos",
    type: "tutorial",
    level: "beginner",
    readTime: 6,
    views: 4560,
    href: "/soporte/guias/recordatorios-medicamentos",
  },
  {
    id: "9",
    title: "Cancelar o reprogramar citas",
    description: "Aprende a modificar tus citas sin complicaciones",
    category: "citas",
    type: "article",
    level: "beginner",
    readTime: 3,
    views: 6780,
    href: "/soporte/guias/cancelar-cita",
  },
  {
    id: "10",
    title: "Compartir historial con otros médicos",
    description: "Controla quién puede ver tu información médica",
    category: "seguridad",
    type: "tutorial",
    level: "intermediate",
    readTime: 7,
    views: 3450,
    href: "/soporte/guias/compartir-historial",
  },
  {
    id: "11",
    title: "Usar Red-Salud en múltiples dispositivos",
    description: "Sincroniza tu cuenta en móvil, tablet y computadora",
    category: "cuenta",
    type: "article",
    level: "beginner",
    readTime: 4,
    views: 4120,
    href: "/soporte/guias/multiples-dispositivos",
  },
  {
    id: "12",
    title: "Entender tu factura y suscripción",
    description: "Desglose detallado de cargos y cómo gestionar tu plan",
    category: "pagos",
    type: "article",
    level: "intermediate",
    readTime: 5,
    views: 3890,
    href: "/soporte/guias/entender-factura",
  },
];

const typeConfig: Record<GuideType, { label: string; icon: typeof FileText; color: string }> = {
  article: { label: "Artículo", icon: FileText, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  video: { label: "Video", icon: Play, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  tutorial: { label: "Tutorial", icon: BookOpen, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
};

const levelConfig: Record<GuideLevel, { label: string; color: string }> = {
  beginner: { label: "Principiante", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  intermediate: { label: "Intermedio", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  advanced: { label: "Avanzado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function GuideCard({ guide, featured = false }: { guide: Guide; featured?: boolean }) {
  const type = typeConfig[guide.type];
  const level = levelConfig[guide.level];
  const TypeIcon = type.icon;

  return (
    <Link href={guide.href}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "h-full p-6 rounded-2xl border bg-white dark:bg-zinc-900 transition-all group",
          "hover:shadow-lg hover:border-teal-500 dark:hover:border-teal-500",
          featured && "ring-2 ring-teal-500/20"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={type.color}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {type.label}
            </Badge>
            <Badge variant="outline" className={level.color}>
              {level.label}
            </Badge>
          </div>
          {featured && (
            <Badge className="bg-teal-500 text-white">Destacado</Badge>
          )}
        </div>

        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
          {guide.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
          {guide.description}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.readTime} min
            </span>
            <span>{guide.views.toLocaleString()} vistas</span>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-teal-500 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
}

function FeaturedGuide({ guide }: { guide: Guide }) {
  const type = typeConfig[guide.type];
  const TypeIcon = type.icon;

  return (
    <Link href={guide.href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 text-white overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Badge className="bg-white/20 text-white mb-4">
            <TypeIcon className="w-3 h-3 mr-1" />
            {type.label} destacado
          </Badge>
          <h3 className="text-2xl font-bold mb-3 group-hover:underline">
            {guide.title}
          </h3>
          <p className="text-white/80 mb-6">
            {guide.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {guide.readTime} min lectura
            </span>
            <span>{guide.views.toLocaleString()} vistas</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function GuiasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState<GuideType | "all">("all");

  const featuredGuides = guides.filter((g) => g.featured);

  const filteredGuides = useMemo(() => {
    let result = guides.filter((g) => !g.featured);

    if (activeCategory !== "all") {
      result = result.filter((g) => g.category === activeCategory);
    }

    if (activeType !== "all") {
      result = result.filter((g) => g.type === activeType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeCategory, activeType]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">
              <GraduationCap className="w-4 h-4" />
              Centro de aprendizaje
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              Guías y tutoriales
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
              Aprende a sacar el máximo provecho de Red-Salud con nuestras guías paso a paso
            </p>

            {/* Búsqueda */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Buscar guías y tutoriales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guías destacadas */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            Guías destacadas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredGuides.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
              >
                {i === 0 ? (
                  <FeaturedGuide guide={guide} />
                ) : (
                  <GuideCard guide={guide} featured />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros y lista */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const count = category.id === "all"
                ? guides.length
                : guides.filter((g) => g.category === category.id).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-teal-500 text-white"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20" : "bg-zinc-100 dark:bg-zinc-700"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtros de tipo */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Tipo:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveType("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-all",
                  activeType === "all"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                Todos
              </button>
              {Object.entries(typeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveType(key as GuideType)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                      activeType === key
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de guías */}
          {filteredGuides.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                No encontramos guías
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setActiveType("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, i) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GuideCard guide={guide} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Nuestro equipo puede ayudarte con cualquier duda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-12 px-8">
              <Link href="/soporte/contacto">Contactar soporte</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-12 px-8">
              <Link href="/soporte/faq">Ver preguntas frecuentes</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}