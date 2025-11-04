import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Activity } from "lucide-react";

export default function MetricasPage() {
  return (
    <ModulePlaceholder
      title="Métricas de Salud"
      description="Monitorea tus signos vitales y evolución de salud"
      icon={Activity}
      features={[
        "Registrar presión arterial, peso y glucosa",
        "Visualizar gráficos de evolución temporal",
        "Establecer metas de salud personalizadas",
        "Compartir métricas con tu médico",
        "Recibir alertas de valores anormales",
      ]}
    />
  );
}
