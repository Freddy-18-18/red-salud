import Link from "next/link";
import { Button } from "@red-salud/design-system";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function AccesoDenegadoPage({
  searchParams,
}: {
  searchParams: { razón?: string; reason?: string }
}) {
  const razon = searchParams.razón || searchParams.reason || "unknown";

  const mensajes: Record<string, { titulo: string; descripcion: string }> = {
    no_paciente: {
      titulo: "Acceso Restringido",
      descripcion: "Esta sección es exclusiva para pacientes. Por favor, contacta al administrador si crees que esto es un error.",
    },
    no_autorizado: {
      titulo: "No Autorizado",
      descripcion: "No tienes permiso para acceder a esta información.",
    },
    default: {
      titulo: "Acceso Denegado",
      descripcion: "No tienes los permisos necesarios para acceder a esta página.",
    },
  };

  const mensaje = mensajes[razon] || mensajes.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldX className="w-16 h-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          {mensaje.titulo}
        </h1>

        <p className="text-muted-foreground">
          {mensaje.descripcion}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              <Home className="w-4 h-4 mr-2" />
              Ir a Iniciar Sesión
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
