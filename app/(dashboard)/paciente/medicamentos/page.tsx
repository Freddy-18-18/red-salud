import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Pill } from "lucide-react";

export default function MedicamentosPage() {
  return (
    <ModulePlaceholder
      title="Medicamentos"
      description="Gestiona recetas y recordatorios de medicamentos"
      icon={Pill}
      features={[
        "Ver recetas médicas activas",
        "Configurar recordatorios de tomas",
        "Historial de medicamentos consumidos",
        "Solicitar renovación de recetas",
        "Información detallada de cada medicamento",
      ]}
    />
  );
}
