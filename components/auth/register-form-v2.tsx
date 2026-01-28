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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { signUp, signIn, type UserRole } from "@/lib/supabase/auth";
import { useOAuthErrors } from "@/hooks/auth/use-oauth-errors";
import { useOAuthSignIn } from "@/hooks/auth/use-oauth-signin";
import { cn } from "@/lib/utils";

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

    router.push(`/dashboard/${role}`);
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
    <div className="h-dvh h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header - Minimal, always visible */}
      <header className="shrink-0 px-4 py-3 flex items-center justify-between">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Cambiar tipo</span>
        </Link>

        <Link href={ROUTES.HOME} className="cursor-pointer">
          <span className="font-semibold text-lg text-teal-400 hover:text-teal-300 transition-colors">
            {APP_NAME}
          </span>
        </Link>
      </header>

      {/* Main content - Centered, no scroll */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-neutral-800 p-6 sm:p-8">
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
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-4">
                      <Stethoscope className="w-7 h-7 text-teal-400" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                      Registro de {roleLabel}
                    </h1>
                    <p className="text-sm text-neutral-500">
                      Únete a la red de profesionales
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
                    className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
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
                    className="w-full h-12 bg-transparent hover:bg-neutral-800/50 text-neutral-300 border border-neutral-700 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Continuar con Email</span>
                  </Button>

                  {/* Already have account */}
                  <p className="mt-6 text-center text-sm text-neutral-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer">
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
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Volver"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Crear cuenta</h2>
                      <p className="text-xs text-neutral-500">Completa tus datos</p>
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
                          className="pl-10 h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl"
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
                          className="pl-10 h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl"
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
                          className="pl-10 pr-10 h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl"
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
                          className="pl-10 h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl"
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
                      className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl shadow-lg shadow-teal-500/20 mt-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
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
          <p className="mt-4 text-center text-xs text-neutral-600 px-4">
            Al registrarte aceptas nuestros{" "}
            <Link href={ROUTES.TERMINOS} className="text-neutral-500 hover:text-neutral-400 underline cursor-pointer">
              Términos
            </Link>{" "}
            y{" "}
            <Link href={ROUTES.PRIVACIDAD} className="text-neutral-500 hover:text-neutral-400 underline cursor-pointer">
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
      <div className="h-dvh h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    }>
      <RegisterFormContent {...props} />
    </Suspense>
  );
}
