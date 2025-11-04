import { ModulePlaceholder } from "@/components/dashboard/paciente/module-placeholder";
import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <ModulePlaceholder
      title="Configuración de Módulos"
      description="Personaliza tu dashboard activando o desactivando módulos"
      icon={Settings}
      features={[
        "Activar/Desactivar módulos del dashboard",
        "Reordenar módulos mediante drag-and-drop",
        "Guardar diferentes layouts personalizados",
        "Restaurar configuración por defecto",
        "Exportar/Importar configuración",
      ]}
    />
  );
}
