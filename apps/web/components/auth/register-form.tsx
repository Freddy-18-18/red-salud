"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Card, CardContent } from "@red-salud/ui";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { registerSchema, type RegisterFormData } from "@red-salud/core/validations";
import { signUp, signIn, type UserRole } from "@/lib/supabase/auth";
import { useOAuthErrors } from "@/hooks/auth/use-oauth-errors";
import { useOAuthSignIn } from "@/hooks/auth/use-oauth-signin";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

interface RegisterFormProps {
  role: UserRole;
  roleLabel: string;
}

function RegisterFormContent({ role, roleLabel }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithGoogle, isLoading: isOAuthLoading } = useOAuthSignIn({
    role,
    mode: "register",
    onError: setError,
    rememberMe: true, // Por defecto true en registro
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



  return (
    <div className="h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 overflow-hidden">
      {/* Header horizontal FUERA del contenedor principal */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between px-4">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar tipo de cuenta
        </Link>

        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
          <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
            RS
          </div>
          <span className="font-bold text-xl text-gray-900">{APP_NAME}</span>
        </Link>
      </motion.div>

      {/* Contenedor principal centrado */}
      <div className="h-full flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Título centrado (sin ícono) */}
          <motion.div variants={fadeInUp} className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Registro de {roleLabel}
            </h1>
            <p className="text-sm text-gray-600">
              Crea tu cuenta en pocos segundos
            </p>
          </motion.div>

          {/* Card limpio solo con formulario */}
          <Card className="border-2 shadow-xl bg-white">
            <CardContent className="px-6 py-6">
              {/* Error Message con AnimatePresence */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OAuth Google - más estrecho */}
              <motion.div variants={fadeInUp} className="mb-4 flex justify-center">
                <GoogleSignInButton
                  onClick={signInWithGoogle}
                  disabled={isLoading || isOAuthLoading}
                  mode="register"
                  size="default"
                />
              </motion.div>

              <motion.div variants={fadeInUp} className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-500">O con tu email</span>
                </div>
              </motion.div>

              {/* Form compacto */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Nombre y Apellido en horizontal */}
                <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">Nombre</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        className="pl-9 h-9 text-sm"
                        {...register("fullName")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Apellido</Label>
                    <div className="relative mt-1">
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Pérez"
                        className="h-9 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Label htmlFor="email" className="text-sm">Correo electrónico</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-9 h-9 text-sm"
                      {...register("email")}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.email.message}</p>
                  )}
                </motion.div>

                {/* Contraseñas en horizontal */}
                <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="password" className="text-sm">Contraseña</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-9 text-sm"
                        {...register("password")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm">Confirmar contraseña</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 h-9 text-sm"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 h-10"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm">Creando cuenta...</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">Crear Cuenta</span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.p variants={fadeInUp} className="mt-3 text-center text-xs text-gray-600">
                Al registrarte, aceptas nuestros{" "}
                <Link href={ROUTES.TERMINOS} className="text-blue-600 hover:text-blue-700">
                  Términos y Condiciones
                </Link>{" "}
                y{" "}
                <Link href={ROUTES.PRIVACIDAD} className="text-blue-600 hover:text-blue-700">
                  Política de Privacidad
                </Link>
              </motion.p>

              <motion.p variants={fadeInUp} className="mt-3 text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Inicia sesión
                </Link>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export function RegisterForm(props: RegisterFormProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <RegisterFormContent {...props} />
    </Suspense>
  );
}
