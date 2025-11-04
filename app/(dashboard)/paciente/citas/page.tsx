import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Calendar } from "lucide-react";

export default function CitasPage() {
  return (
    <ModulePlaceholder
      title="Citas Médicas"
      description="Agenda y gestiona tus citas con profesionales de la salud"
      icon={Calendar}
      features={[
        "Agendar nuevas citas con médicos",
        "Ver calendario de citas programadas",
        "Cancelar o reprogramar citas",
        "Recibir recordatorios por email/SMS",
        "Ver historial de citas pasadas",
      ]}
    />
  );
}
