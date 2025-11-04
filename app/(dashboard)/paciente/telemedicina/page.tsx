import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Video } from "lucide-react";

export default function TelemedicinaPage() {
  return (
    <ModulePlaceholder
      title="Telemedicina"
      description="Consultas virtuales por videollamada con médicos"
      icon={Video}
      features={[
        "Agendar consultas por videollamada",
        "Sala de espera virtual",
        "Videollamada HD con pantalla compartida",
        "Grabación de consultas (con autorización)",
        "Recibir recetas digitales al finalizar",
      ]}
    />
  );
}
