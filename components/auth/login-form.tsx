"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/supabase/auth";
import { useRateLimit } from "@/hooks/auth/use-rate-limit";
import { useOAuthErrors } from "@/hooks/auth/use-oauth-errors";
import { useOAuthSignIn } from "@/hooks/auth/use-oauth-signin";
import { RememberMeCheckbox } from "@/components/auth/remember-me-checkbox";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { validateUserRole } from "@/lib/auth/role-validator";
import { type UserRole } from "@/lib/constants";
import { sessionManager } from "@/lib/security/session-manager";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  role: UserRole;
  roleLabel: string;
}

function LoginFormContent({ role, roleLabel }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Hooks personalizados
  const { checkRateLimit, recordFailedAttempt, resetAttempts } = useRateLimit();
  const { signInWithGoogle, isLoading: isOAuthLoading } = useOAuthSignIn({
    role,
    mode: "login",
    onError: setError,
    rememberMe, // Pasar rememberMe al hook de OAuth
  });
  useOAuthErrors(setError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Helper para fingerprinting
  const getDeviceFingerprint = async (): Promise<string> => {
    if (typeof window === "undefined") return "";
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");
    return btoa(data);
  };

  const onSubmit = async (data: LoginFormData) => {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message!);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signIn(data);

    if (!result.success || !result.user) {
      recordFailedAttempt();
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
      return;
    }

    resetAttempts();
    const userRole = result.user.user_metadata?.role || "paciente";

    // Validar que el rol del usuario coincida con el rol de la página
    const validation = validateUserRole(userRole, role);
    if (!validation.isValid) {
      setError(validation.errorMessage!);
      setIsLoading(false);
      // Cerrar sesión automáticamente
      await signOut();
      return;
    }

    // Configurar sesión con preferencias de seguridad
    await sessionManager.setupSession({
      rememberMe,
      role: userRole,
      deviceFingerprint: await getDeviceFingerprint(),
    });

    router.push(`/dashboard/${userRole}`);
  };

  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Header bar with Back button and Logo */}
      <div className="relative z-10 px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group px-3 py-1.5 rounded-full hover:bg-muted/50 relative z-20"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs sm:text-sm font-medium">Cambiar tipo de cuenta</span>
        </Link>

        {/* Centered Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-2">
          <Logo size="md" showIcon className="pointer-events-auto" />
        </div>
      </div>

      {/* Contenedor centrado */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 overflow-y-auto py-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Título */}
            <div className="text-center mb-6 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Bienvenido de vuelta
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Inicia sesión como <span className="font-semibold text-primary">{roleLabel}</span>
              </p>
            </div>

            {/* Card del formulario */}
            <Card className="border shadow-glow bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error-message"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OAuth Google */}
                <div className="mb-4">
                  <GoogleSignInButton
                    onClick={signInWithGoogle}
                    disabled={isLoading || isOAuthLoading}
                    mode="login"
                  />
                </div>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="bg-card px-2 text-muted-foreground">
                      O continúa con tu email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-foreground/80 text-xs sm:text-sm">Correo electrónico</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-9 sm:pl-10 h-10 sm:h-11 bg-background/50 focus:bg-background transition-all text-sm"
                        {...register("email")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground/80 text-xs sm:text-sm">Contraseña</Label>
                      <Link
                        href="/forgot-password"
                        className="text-[10px] sm:text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-all"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 sm:pl-10 pr-10 h-10 sm:h-11 bg-background/50 focus:bg-background transition-all text-sm"
                        {...register("password")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-1">
                    <RememberMeCheckbox
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      role={role}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-10 sm:h-11 text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>

                <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href={`/register/${role}`}
                    className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
