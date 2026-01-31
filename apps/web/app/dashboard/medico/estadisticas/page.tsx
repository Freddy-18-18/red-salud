/**
 * @file page.tsx
 * @description Página de estadísticas avanzadas del médico con header híbrido.
 * Sistema completo con 8 tabs especializados conectados a Supabase.
 *
 * @module Dashboard/Médico/Estadísticas
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { Card, CardContent } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
  BarChart3,
  Users,
  Activity,
  DollarSign,
  Clock,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";

// Importar tabs
import { ResumenTab } from "@/components/dashboard/medico/estadisticas/tabs/resumen-tab";
import { PacientesTab } from "@/components/dashboard/medico/estadisticas/tabs/pacientes-tab";
import { EnfermedadesTab } from "@/components/dashboard/medico/estadisticas/tabs/enfermedades-tab";
import { FinanzasTab } from "@/components/dashboard/medico/estadisticas/tabs/finanzas-tab";
import { PatronesTab } from "@/components/dashboard/medico/estadisticas/tabs/patrones-tab";
import { LaboratorioTab } from "@/components/dashboard/medico/estadisticas/tabs/laboratorio-tab";
import { EficienciaTab } from "@/components/dashboard/medico/estadisticas/tabs/eficiencia-tab";
import { BrotesTab } from "@/components/dashboard/medico/estadisticas/tabs/brotes-tab";

// ============================================================================
// TIPOS
// ============================================================================

type TabType =
  | "resumen"
  | "pacientes"
  | "enfermedades"
  | "finanzas"
  | "patrones"
  | "laboratorio"
  | "eficiencia"
  | "brotes";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabConfig[] = [
  { id: "resumen", label: "Resumen", icon: BarChart3, description: "Vista general" },
  { id: "pacientes", label: "Pacientes", icon: Users, description: "Demografía" },
  { id: "enfermedades", label: "Enfermedades", icon: Activity, description: "Epidemiología" },
  { id: "finanzas", label: "Finanzas", icon: DollarSign, description: "Ingresos" },
  { id: "patrones", label: "Patrones", icon: Clock, description: "Temporales" },
  { id: "laboratorio", label: "Laboratorio", icon: FlaskConical, description: "Análisis" },
  { id: "eficiencia", label: "Eficiencia", icon: TrendingUp, description: "Operativa" },
  { id: "brotes", label: "Brotes", icon: AlertTriangle, description: "Detección" },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================


function EstadisticasInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  // Obtener tab activo de la URL
  const tabFromUrl = searchParams.get("tab") as TabType;
  const activeTab = (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) ? tabFromUrl : "resumen";

  // Cargar ID del médico
  useEffect(() => {
    const loadDoctorId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setDoctorId(user.id);
      } catch (error) {
        console.error("Error loading doctor ID:", error);
        router.push("/login");
      }
    };

    loadDoctorId();
  }, [router]);

  const handleTabChange = (tabId: TabType) => {
    const newUrl = tabId === "resumen"
      ? "/dashboard/medico/estadisticas"
      : `/dashboard/medico/estadisticas?tab=${tabId}`;
    router.push(newUrl, { scroll: false });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular recarga
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implementar exportación
    alert("Exportación próximamente");
  };

  const renderTabContent = () => {
    if (!doctorId) return null;

    switch (activeTab) {
      case "resumen": return <ResumenTab doctorId={doctorId} dateRange={dateRange} />;
      case "pacientes": return <PacientesTab doctorId={doctorId} dateRange={dateRange} />;
      case "enfermedades": return <EnfermedadesTab doctorId={doctorId} dateRange={dateRange} />;
      case "finanzas": return <FinanzasTab doctorId={doctorId} dateRange={dateRange} />;
      case "patrones": return <PatronesTab doctorId={doctorId} dateRange={dateRange} />;
      case "laboratorio": return <LaboratorioTab doctorId={doctorId} dateRange={dateRange} />;
      case "eficiencia": return <EficienciaTab doctorId={doctorId} dateRange={dateRange} />;
      case "brotes": return <BrotesTab doctorId={doctorId} dateRange={dateRange} />;
      default: return <ResumenTab doctorId={doctorId} dateRange={dateRange} />;
    }
  };

  // Mostrar skeleton mientras carga
  if (!doctorId) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-[1400px]">
      {/* Botones de Acción en la parte superior */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Contenido del Tab */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<LoadingSkeleton />}>
          {renderTabContent()}
        </Suspense>
      </motion.div>
    </div>
  );
}

function EstadisticasContent() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EstadisticasInner />
    </Suspense>
  );
}

// ============================================================================
// SKELETON DE CARGA
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function DoctorEstadisticasPage() {
  return (
    <VerificationGuard>
      <EstadisticasContent />
    </VerificationGuard>
  );
}
