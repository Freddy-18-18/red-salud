"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { signUp, signInWithOAuth, type UserRole } from "@/lib/supabase/auth";

interface RegisterFormProps {
  role: UserRole;
  roleLabel: string;
  roleIcon: React.ComponentType<{ className?: string }>;
  roleGradient: string;
}

export function RegisterForm({ role, roleLabel, roleIcon: Icon, roleGradient }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const result = await signUp({ ...data, role });

    if (result.success) {
      // Redirigir al dashboard correspondiente según el rol
      router.push(`/dashboard/${role}`);
    } else {
      setError(result.error || "Error al registrar usuario");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signInWithOAuth("google");

    if (!result.success) {
      setError(result.error || "Error al iniciar sesión con Google");
      setIsLoading(false);
    }
    // Si es exitoso, el usuario será redirigido automáticamente
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Cambiar tipo de cuenta
          </Link>
        </motion.div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-6 pt-8">
            <motion.div variants={fadeInUp}>
              <Link href={ROUTES.HOME} className="inline-flex items-center justify-center gap-2 mb-6">
                <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
                  RS
                </div>
                <span className="font-bold text-2xl text-gray-900">{APP_NAME}</span>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-4">
              <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${roleGradient} flex items-center justify-center mx-auto`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-900 mb-2 font-(family-name:--font-poppins)"
            >
              Registro de {roleLabel}
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-600">
              Crea tu cuenta en pocos segundos
            </motion.p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* OAuth Google */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">O con tu email</span>
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <motion.div variants={fadeInUp}>
                <Label htmlFor="fullName">Nombre completo</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    className="pl-10"
                    {...register("fullName")}
                    disabled={isLoading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    {...register("email")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-gray-600">
              Al registrarte, aceptas nuestros{" "}
              <Link href={ROUTES.TERMINOS} className="text-blue-600 hover:text-blue-700">
                Términos y Condiciones
              </Link>{" "}
              y{" "}
              <Link href={ROUTES.PRIVACIDAD} className="text-blue-600 hover:text-blue-700">
                Política de Privacidad
              </Link>
            </motion.p>

            <motion.p variants={fadeInUp} className="mt-4 text-center text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Inicia sesión
              </Link>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
