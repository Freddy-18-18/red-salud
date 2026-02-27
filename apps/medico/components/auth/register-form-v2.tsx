"use client";

import { useState, Suspense, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  ChevronLeft,
  Stethoscope
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterFormData } from "@red-salud/core/validations";
import { signUp, signIn, type UserRole } from "@/lib/supabase/auth";
import { useOAuthErrors } from "@/hooks/auth/use-oauth-errors";
import { useOAuthSignIn } from "@/hooks/auth/use-oauth-signin";
import { sessionManager } from "@/lib/security/session-manager";

interface RegisterFormProps {
  role: UserRole;
  roleLabel: string;
}

// Animation variants - smooth and performant
const fadeIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

const slideIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// Google Icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

type AuthStep = "choose" | "email-form";

function RegisterFormContent({ role, roleLabel }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("choose");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithGoogle, isLoading: isOAuthLoading } = useOAuthSignIn({
    role,
    mode: "register",
    onError: setError,
    rememberMe: true,
  });
  useOAuthErrors(setError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    const signUpResult = await signUp({ ...data, role });

    if (!signUpResult.success || !signUpResult.user) {
      setError(signUpResult.error || "Error al registrar usuario");
      setIsLoading(false);
      return;
    }

    const signInResult = await signIn({
      email: data.email,
      password: data.password,
    });

    if (!signInResult.success) {
      router.push(`/login/${role}`);
      return;
    }

    // Configurar sesión con preferencias de seguridad
    const getDeviceFingerprint = () => {
      const data = [
        navigator.userAgent,
        navigator.language,
        window.screen.width,
        window.screen.height,
        new Date().getTimezoneOffset(),
      ].join("|");
      return btoa(data);
    };

    await sessionManager.setupSession({
      rememberMe: true, // Por defecto true en registro
      role,
      deviceFingerprint: getDeviceFingerprint(),
    });

    router.push("/consultorio");
  };

  const handleEmailClick = useCallback(() => {
    setStep("email-form");
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setStep("choose");
    setError(null);
  }, []);

  const isSubmitting = isLoading || isOAuthLoading;

  return (
    <div className="h-dvh h-screen bg-[#050505] flex flex-col overflow-hidden relative">
      {/* Abstract Background Decoration - Subtle Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header - Minimalist */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={() => step === "email-form" ? handleBack() : router.push("/")}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-200 transition-all cursor-pointer group px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{step === "email-form" ? "Volver" : "Cambiar rol"}</span>
        </button>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center p-1.5 shadow-lg shadow-primary/20">
          <Stethoscope className="w-full h-full text-white" />
        </div>
      </header>

      {/* Main content - Centered, no scroll */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden z-10">
        <div className="w-full max-w-sm">
          {/* Card - Premium Glass-like on Matte Black */}
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-10 shadow-2xl shadow-black">
            <AnimatePresence mode="wait">
              {step === "choose" ? (
                <motion.div
                  key="choose"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col"
                >
                  {/* Logo & Title */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-white/5 mb-5 group">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center border border-white/5 shadow-inner">
                        <Stethoscope className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                      Registro de {roleLabel}
                    </h1>
                    <p className="text-sm text-neutral-500 font-medium tracking-wide">
                      Únete a la red más avanzada de profesionales
                    </p>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Google Button - Primary */}
                  <Button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-white hover:bg-neutral-200 text-black border-none rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-white/5"
                  >
                    {isOAuthLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="h-5 w-5" />
                        <span>Continuar con Google</span>
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-neutral-800" />
                    <span className="text-xs text-neutral-600 font-medium">o</span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>

                  {/* Email Button - Secondary */}
                  <Button
                    type="button"
                    onClick={handleEmailClick}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-12 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-300 border border-white/5 rounded-2xl font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <span>Continuar con Email</span>
                  </Button>

                  {/* Already have account */}
                  <p className="mt-6 text-center text-sm text-neutral-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-medium cursor-pointer">
                      Inicia sesión
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="email-form"
                  variants={slideIn}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col"
                >
                  {/* Back button + Title */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="shrink-0">
                      <h2 className="text-xl font-bold text-white tracking-tight">Crear cuenta</h2>
                      <p className="text-xs text-neutral-500 font-medium">Completa tus datos profesionales</p>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form - Compact */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm font-medium text-neutral-400">
                        Nombre completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Dr. Juan Pérez"
                          autoComplete="name"
                          className="pl-10 h-12 bg-neutral-950 border-white/5 text-white placeholder:text-neutral-700 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl transition-all"
                          {...register("fullName")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-red-400">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-400">
                        Correo electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        <Input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="tu@email.com"
                          className="pl-10 h-12 bg-neutral-950 border-white/5 text-white placeholder:text-neutral-700 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl transition-all"
                          {...register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium text-neutral-400">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="pl-10 pr-10 h-12 bg-neutral-950 border-white/5 text-white placeholder:text-neutral-700 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl transition-all"
                          {...register("password")}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer p-1"
                          disabled={isSubmitting}
                          aria-label={showPassword ? "Ocultar" : "Mostrar"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-400">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-400">
                        Confirmar contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="pl-10 h-12 bg-neutral-950 border-white/5 text-white placeholder:text-neutral-700 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl transition-all"
                          {...register("confirmPassword")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/10 mt-4 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Creando...</span>
                        </>
                      ) : (
                        "Crear cuenta"
                      )}
                    </Button>
                  </form>

                  {/* Quick login */}
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <span className="text-xs text-neutral-600">Acceso rápido:</span>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      disabled={isSubmitting}
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer"
                      aria-label="Registrar con Google"
                    >
                      <GoogleIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer - Terms */}
          <p className="mt-8 text-center text-[10px] text-neutral-600 px-8 leading-relaxed">
            Al registrarte aceptas nuestros{" "}
            <Link href={ROUTES.TERMINOS} className="text-neutral-500 hover:text-white transition-colors underline decoration-neutral-800 underline-offset-4 cursor-pointer">
              Términos
            </Link>{" "}
            y{" "}
            <Link href={ROUTES.PRIVACIDAD} className="text-neutral-500 hover:text-white transition-colors underline decoration-neutral-800 underline-offset-4 cursor-pointer">
              Privacidad
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function RegisterFormV2(props: RegisterFormProps) {
  return (
    <Suspense fallback={
      <div className="h-dvh h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    }>
      <RegisterFormContent {...props} />
    </Suspense>
  );
}
