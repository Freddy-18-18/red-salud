"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  Video,
  MessageCircle,
  CreditCard,
  Shield,
  RefreshCw,
  Bell,
  ExternalLink,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ServiceStatus = "operational" | "degraded" | "partial" | "major" | "maintenance";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: ServiceStatus;
  uptime: number;
  responseTime: number;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  updates: {
    time: string;
    message: string;
    status: string;
  }[];
}

const services: Service[] = [
  {
    id: "api",
    name: "API Principal",
    description: "Servicios core de la plataforma",
    icon: Server,
    status: "operational",
    uptime: 99.99,
    responseTime: 45,
  },
  {
    id: "database",
    name: "Base de datos",
    description: "Almacenamiento y consultas",
    icon: Database,
    status: "operational",
    uptime: 99.98,
    responseTime: 12,
  },
  {
    id: "web",
    name: "Aplicación Web",
    description: "Portal principal y dashboard",
    icon: Globe,
    status: "operational",
    uptime: 99.97,
    responseTime: 120,
  },
  {
    id: "telemedicine",
    name: "Telemedicina",
    description: "Videollamadas y consultas virtuales",
    icon: Video,
    status: "operational",
    uptime: 99.95,
    responseTime: 85,
  },
  {
    id: "messaging",
    name: "Mensajería",
    description: "Chat y notificaciones",
    icon: MessageCircle,
    status: "operational",
    uptime: 99.96,
    responseTime: 35,
  },
  {
    id: "payments",
    name: "Pagos",
    description: "Procesamiento de transacciones",
    icon: CreditCard,
    status: "operational",
    uptime: 99.99,
    responseTime: 250,
  },
  {
    id: "auth",
    name: "Autenticación",
    description: "Login y seguridad",
    icon: Shield,
    status: "operational",
    uptime: 99.99,
    responseTime: 55,
  },
];

const recentIncidents: Incident[] = [
  {
    id: "inc-001",
    title: "Latencia elevada en servicio de telemedicina",
    status: "resolved",
    severity: "minor",
    createdAt: "2025-12-05T14:30:00Z",
    updatedAt: "2025-12-05T15:45:00Z",
    updates: [
      {
        time: "15:45",
        message: "El problema ha sido resuelto. Todos los servicios operan con normalidad.",
        status: "resolved",
      },
      {
        time: "15:15",
        message: "Hemos identificado el problema y estamos aplicando la solución.",
        status: "identified",
      },
      {
        time: "14:30",
        message: "Estamos investigando reportes de latencia elevada en videollamadas.",
        status: "investigating",
      },
    ],
  },
];

// Historial de uptime de los últimos 90 días (simulado)
const uptimeHistory = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000),
  status: Math.random() > 0.02 ? "operational" : Math.random() > 0.5 ? "degraded" : "partial",
}));

const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType; bg: string }> = {
  operational: {
    label: "Operativo",
    color: "text-green-600 dark:text-green-400",
    icon: CheckCircle2,
    bg: "bg-green-500",
  },
  degraded: {
    label: "Degradado",
    color: "text-yellow-600 dark:text-yellow-400",
    icon: AlertTriangle,
    bg: "bg-yellow-500",
  },
  partial: {
    label: "Parcial",
    color: "text-orange-600 dark:text-orange-400",
    icon: AlertTriangle,
    bg: "bg-orange-500",
  },
  major: {
    label: "Interrupción",
    color: "text-red-600 dark:text-red-400",
    icon: XCircle,
    bg: "bg-red-500",
  },
  maintenance: {
    label: "Mantenimiento",
    color: "text-blue-600 dark:text-blue-400",
    icon: Clock,
    bg: "bg-blue-500",
  },
};

function ServiceCard({ service }: { service: Service }) {
  const status = statusConfig[service.status];
  const Icon = service.icon;
  const StatusIcon = status.icon as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-white">
              {service.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {service.description}
            </p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5", status.color)}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span>Uptime: {service.uptime}%</span>
        <span>•</span>
        <span>Respuesta: {service.responseTime}ms</span>
      </div>
    </motion.div>
  );
}

function UptimeBar() {
  return (
    <div className="flex gap-0.5">
      {uptimeHistory.map((day, i) => {
        const status = statusConfig[day.status as ServiceStatus];
        return (
          <div
            key={i}
            className={cn(
              "w-1 h-8 rounded-sm transition-all hover:scale-y-125",
              status.bg,
              day.status !== "operational" && "opacity-80"
            )}
            title={`${day.date.toLocaleDateString()}: ${status.label}`}
          />
        );
      })}
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors = {
    minor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    major: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusColors = {
    investigating: "text-yellow-600",
    identified: "text-orange-600",
    monitoring: "text-blue-600",
    resolved: "text-green-600",
  };

  return (
    <Card className="p-6 border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={severityColors[incident.severity]}>
              {incident.severity === "minor" ? "Menor" : incident.severity === "major" ? "Mayor" : "Crítico"}
            </Badge>
            <Badge variant="outline" className={statusColors[incident.status]}>
              {incident.status === "resolved" ? "Resuelto" :
                incident.status === "investigating" ? "Investigando" :
                  incident.status === "identified" ? "Identificado" : "Monitoreando"}
            </Badge>
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {incident.title}
          </h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(incident.createdAt).toLocaleDateString()}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-teal-600 hover:text-teal-700 p-0 h-auto"
      >
        {isExpanded ? "Ocultar actualizaciones" : "Ver actualizaciones"}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
          {incident.updates.map((update, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {update.time}
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {update.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function EstadoPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const allOperational = services.every((s) => s.status === "operational");
  const overallUptime = (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8",
              allOperational
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-yellow-100 dark:bg-yellow-900/30"
            )}>
              {allOperational ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className={cn(
                "text-lg font-semibold",
                allOperational
                  ? "text-green-700 dark:text-green-400"
                  : "text-yellow-700 dark:text-yellow-400"
              )}>
                {allOperational ? "Todos los sistemas operativos" : "Algunos sistemas con problemas"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              Estado del Sistema
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
              Monitoreo en tiempo real de todos los servicios de Red-Salud
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                Actualizar
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Uptime general */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Uptime últimos 90 días
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Promedio general: {overallUptime}%
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Operativo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Degradado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-orange-500" />
                <span className="text-zinc-500 dark:text-zinc-400">Parcial</span>
              </div>
            </div>
          </div>
          <UptimeBar />
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            Estado de servicios
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Incidentes recientes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Incidentes recientes
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Ver historial
            </Button>
          </div>

          {recentIncidents.length === 0 ? (
            <Card className="p-8 text-center border-zinc-200 dark:border-zinc-800">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Sin incidentes recientes
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                No ha habido incidentes en los últimos 7 días
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Suscribirse a actualizaciones */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Mantente informado
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Suscríbete para recibir notificaciones sobre el estado del sistema y mantenimientos programados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-12 px-8">
              <Bell className="w-5 h-5 mr-2" />
              Suscribirse a alertas
            </Button>
            <Button variant="outline" className="rounded-full h-12 px-8" asChild>
              <Link href="/soporte">
                Volver al centro de ayuda
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}