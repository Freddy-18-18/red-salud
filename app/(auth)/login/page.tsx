import { Card } from "@/components/ui/card";
import { ROLE_CONFIG, USER_ROLES, type UserRole } from "@/lib/constants";
import Link from "next/link";
import {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
} from "lucide-react";

/**
 * Página de selección de rol para Login
 * Similar a /auth/register pero para iniciar sesión
 */

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
};

export default function LoginPage() {
  const roles = Object.values(USER_ROLES);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Iniciar Sesión
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>

        {/* Grid de roles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8">
          {roles.map((role) => {
            const config = ROLE_CONFIG[role as UserRole];
            const Icon = iconMap[config.icon];

            return (
              <Link key={role} href={`/auth/login/${role}`}>
                <Card className="p-4 sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-2 hover:border-blue-500 bg-white group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icono */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      {Icon && (
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                      )}
                    </div>

                    {/* Nombre del rol */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {config.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer - Link a registro */}
        <div className="text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
