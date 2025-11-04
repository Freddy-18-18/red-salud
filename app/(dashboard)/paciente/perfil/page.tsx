import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { User } from "lucide-react";

export default function PerfilPage() {
  return (
    <ModulePlaceholder
      title="Mi Perfil"
      description="Gestiona tu información personal y preferencias"
      icon={User}
      features={[
        "Editar datos personales (nombre, email, teléfono)",
        "Actualizar información médica (alergias, grupo sanguíneo)",
        "Cambiar contraseña y configuración de seguridad",
        "Gestionar contactos de emergencia",
        "Preferencias de notificaciones y privacidad",
      ]}
    />
  );
}
