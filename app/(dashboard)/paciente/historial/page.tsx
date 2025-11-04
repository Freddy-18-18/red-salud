import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { FileText } from "lucide-react";

export default function HistorialPage() {
  return (
    <ModulePlaceholder
      title="Historial Clínico"
      description="Consulta diagnósticos, tratamientos y evolución médica"
      icon={FileText}
      features={[
        "Ver diagnósticos y tratamientos previos",
        "Consultar notas médicas de cada consulta",
        "Descargar informes médicos en PDF",
        "Visualizar línea de tiempo de tu salud",
        "Acceder a imágenes y documentos adjuntos",
      ]}
    />
  );
}
