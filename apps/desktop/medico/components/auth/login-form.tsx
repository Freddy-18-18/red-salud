"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Input, Label, Card, CardContent, Logo } from "@red-salud/ui";
import { loginSchema, type LoginFormData } from "@red-salud/core/validations";
import { signIn } from "@/lib/supabase/auth";

export function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        const result = await signIn(data);

        if (!result.success || !result.user) {
            setError(result.error || "Error al iniciar sesión");
            setIsLoading(false);
            return;
        }

        // Redirect to dashboard
        router.push("/");
        router.refresh();
    };

    return (
        <div className="flex-1 flex items-center justify-center px-4 relative z-10 overflow-y-auto py-4 h-full">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Título */}
                    <div className="text-center mb-6 space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Red Salud Desktop
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                            Inicia sesión en tu cuenta
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

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-10 sm:h-11 text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 mt-4"
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
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
