import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { MessageSquare } from "lucide-react";

export default function MensajeriaPage() {
  return (
    <ModulePlaceholder
      title="Mensajería"
      description="Comunícate con médicos, clínicas y laboratorios"
      icon={MessageSquare}
      features={[
        "Chat en tiempo real con médicos",
        "Enviar consultas a laboratorios",
        "Adjuntar imágenes y documentos",
        "Historial de conversaciones",
        "Notificaciones de nuevos mensajes",
      ]}
    />
  );
}
