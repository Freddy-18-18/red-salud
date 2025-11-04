import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { FlaskConical } from "lucide-react";

export default function LaboratorioPage() {
  return (
    <ModulePlaceholder
      title="Resultados de Laboratorio"
      description="Visualiza y descarga resultados de exámenes médicos"
      icon={FlaskConical}
      features={[
        "Ver resultados de exámenes de sangre, orina, etc.",
        "Descargar PDFs de resultados",
        "Comparar resultados históricos",
        "Solicitar nuevos exámenes",
        "Recibir notificaciones de resultados listos",
      ]}
    />
  );
}
