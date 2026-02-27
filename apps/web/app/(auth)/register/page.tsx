import { Card } from "@red-salud/design-system";
import { ROLE_CONFIG, USER_ROLES, type UserRole, ROUTES } from "@/lib/constants";
import Link from "next/link";
import {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
  UserCog,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@red-salud/design-system";
import { ThemeToggle } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";

/**
 * Página de selección de rol para Registro
 * Mobile-first: header sticky, cards horizontales en móvil
 * Desktop: idéntico a /login
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
  UserCog,
};

export default function RegisterPage() {
  const roles = Object.values(USER_ROLES);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">

      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-purple-500/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Header - Sticky en móvil, absoluto en desktop */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex justify-between items-center sm:absolute sm:top-6 sm:left-6 sm:right-6 sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0">
        <Link href={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
          <Logo size="lg" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl">
          {/* Header - Compacto en móvil */}
          <div className="text-center mb-6 sm:mb-12 space-y-2 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Crear Cuenta
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Selecciona tu tipo de cuenta para registrarte
              <span className="hidden sm:inline"> en la plataforma integral de servicios de salud</span>
            </p>
          </div>

          {/* Grid de roles */}
          {/* Mobile (< sm): 1 col, horizontal cards */}
          {/* Desktop (sm+): grid vertical cards igual que login */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {roles.map((role) => {
              const config = ROLE_CONFIG[role as UserRole];
              const Icon = iconMap[config.icon];
              const isEnabled = role === USER_ROLES.MEDICO || role === USER_ROLES.FARMACIA || role === USER_ROLES.PACIENTE;

              return (
                <div key={role} className={cn(
                  "relative block h-full group",
                  !isEnabled && "opacity-60 cursor-not-allowed"
                )}>
                  {isEnabled ? (
                    <Link href={`/register/${role}`} className="block h-full w-full">
                      {/* Mobile: Horizontal card */}
                      <Card className={cn(
                        "h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-card/50 backdrop-blur-sm border-muted/40 relative overflow-hidden",
                        // Mobile: horizontal layout
                        "flex items-center gap-4 p-4",
                        // Desktop: vertical layout
                        "sm:flex-col sm:items-center sm:text-center sm:gap-0 sm:space-y-4 sm:p-6"
                      )}>
                        {/* Icono */}
                        <div className="shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors text-primary ring-1 ring-primary/20 group-hover:ring-primary/40">
                          {Icon && (
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" />
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0 sm:space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate sm:whitespace-normal">
                            {config.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-snug line-clamp-1 sm:line-clamp-none">
                            {config.description}
                          </p>
                        </div>

                        {/* Chevron - Solo móvil */}
                        <ChevronRight className="shrink-0 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors sm:hidden" />
                      </Card>
                    </Link>
                  ) : (
                    <Card className={cn(
                      "h-full bg-card/30 border-muted/20 relative overflow-hidden",
                      // Mobile: horizontal layout
                      "flex items-center gap-4 p-4",
                      // Desktop: vertical layout
                      "sm:flex-col sm:items-center sm:text-center sm:gap-0 sm:space-y-4 sm:p-6"
                    )}>
                      {/* Badge Próximamente */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                        <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                          Próximamente
                        </span>
                      </div>

                      <div className={cn(
                        "flex items-center gap-4 filter grayscale-[0.8] w-full",
                        "sm:flex-col sm:items-center sm:text-center sm:gap-0 sm:space-y-4"
                      )}>
                        {/* Icono */}
                        <div className="shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 text-muted-foreground">
                          {Icon && (
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0 sm:space-y-2">
                          <h3 className="font-semibold text-base sm:text-lg text-muted-foreground truncate sm:whitespace-normal">
                            {config.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground/60 leading-snug line-clamp-1 sm:line-clamp-none">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-muted-foreground text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
