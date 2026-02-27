"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2, Pill } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Card, CardContent } from "@red-salud/design-system";
import { supabase } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error al enviar el correo de recuperación");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background decorativo minimalista */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border shadow-lg bg-card/80 backdrop-blur-sm dark:bg-card/40 dark:border-white/10">
            <CardContent className="px-8 py-12 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  ¡Correo Enviado!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">💡 Consejo:</span> Si no ves el correo en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <Link href="/login" className="block">
                <Button className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-background flex items-center justify-center p-4 relative">
      {/* Botón de regreso estilizado */}
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group px-4 py-2 rounded-xl bg-white dark:bg-card shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs sm:text-sm font-bold">Volver</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Título e Icono estilo Registro */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-2 border border-blue-500/20">
            <Pill className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No te preocupes, te enviaremos instrucciones para restablecerla
          </p>
        </div>

        {/* Card del formulario */}
        <Card className="border shadow-lg bg-card/80 backdrop-blur-sm dark:bg-card/40 dark:border-white/10">
          <CardContent className="px-8 py-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10 h-11 bg-background"
                    {...register("email")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Enviar Instrucciones</span>
                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
