import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Star } from "lucide-react";

export default function CalificacionesPage() {
  return (
    <ModulePlaceholder
      title="Calificaciones y Reviews"
      description="Evalúa servicios médicos y profesionales de la salud"
      icon={Star}
      features={[
        "Calificar médicos y profesionales",
        "Evaluar servicios de laboratorios y clínicas",
        "Escribir reseñas detalladas",
        "Ver historial de calificaciones enviadas",
        "Leer reviews de otros pacientes",
      ]}
    />
  );
}
