"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Building2,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/design-system";
import { CONTACT_INFO, ROUTES } from "@/lib/constants";
import { cn } from "@red-salud/core/utils";
import { toast } from "sonner";
import Link from "next/link";
import { supportService } from "@/lib/supabase/services/support-service";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: CONTACT_INFO.EMAIL,
    link: `mailto:${CONTACT_INFO.EMAIL}`,
    description: "Respuesta en 24 horas",
    color: "blue",
  },
  {
    icon: Phone,
    title: "Teléfono",
    value: CONTACT_INFO.PHONE,
    link: `tel:${CONTACT_INFO.PHONE}`,
    description: "Lun-Vie 8am-8pm",
    color: "green",
  },
  {
    icon: MapPin,
    title: "Oficina",
    value: CONTACT_INFO.ADDRESS,
    link: "#",
    description: "Visítanos con cita previa",
    color: "purple",
  },
  {
    icon: Clock,
    title: "Horario",
    value: "Lun - Vie: 8am - 8pm",
    link: "#",
    description: "Zona horaria local",
    color: "orange",
  },
];

const subjectOptions = [
  { value: "consulta", label: "Consulta general", icon: MessageCircle },
  { value: "soporte", label: "Soporte técnico", icon: AlertCircle },
  { value: "facturacion", label: "Facturación y pagos", icon: FileText },
  { value: "empresas", label: "Soluciones empresariales", icon: Building2 },
  { value: "feedback", label: "Sugerencias y feedback", icon: User },
  { value: "otro", label: "Otro", icon: Mail },
];

const priorityOptions = [
  { value: "baja", label: "Baja - Consulta general" },
  { value: "media", label: "Media - Necesito ayuda pronto" },
  { value: "alta", label: "Alta - Problema urgente" },
  { value: "critica", label: "Crítica - Sistema no funciona" },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  priority: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
};

export default function ContactoPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    priority: "media",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.subject) {
      newErrors.subject = "Selecciona un asunto";
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "El mensaje debe tener al menos 20 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await supportService.createTicket({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        priority: formData.priority,
        message: formData.message,
      });

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Mensaje enviado correctamente");
      } else {
        toast.error("Hubo un error al enviar el mensaje. Por favor intente de nuevo.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Error inesperado al enviar el mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            ¡Mensaje enviado!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Hemos recibido tu mensaje. Nuestro equipo te responderá en las próximas 24 horas.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 rounded-full">
              <Link href={ROUTES.SOPORTE}>Volver al centro de ayuda</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  subject: "",
                  priority: "media",
                  message: "",
                });
              }}
            >
              Enviar otro mensaje
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="absolute inset-0 opacity-30 dark:opacity-10 bg-[radial-gradient(circle_at_2px_2px,rgba(20,184,166,0.15)_1px,transparent_0)] bg-[length:40px_40px]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 mb-4">
              <Mail className="w-4 h-4" />
              Contacto
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
              Estamos aquí para ayudarte
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Completa el formulario y nuestro equipo te responderá lo antes posible
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="p-8 border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                  Envíanos un mensaje
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre y Email */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">
                        Nombre completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={cn(
                          "mt-2",
                          errors.name && "border-red-500 focus:ring-red-500"
                        )}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={cn(
                          "mt-2",
                          errors.email && "border-red-500 focus:ring-red-500"
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Teléfono y Empresa */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">
                        Teléfono (opcional)
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-zinc-700 dark:text-zinc-300">
                        Empresa (opcional)
                      </Label>
                      <Input
                        id="company"
                        placeholder="Nombre de tu empresa"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Asunto y Prioridad */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300">
                        Asunto <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => handleChange("subject", value)}
                      >
                        <SelectTrigger className={cn("mt-2", errors.subject && "border-red-500")}>
                          <SelectValue placeholder="Selecciona un asunto" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="w-4 h-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300">
                        Prioridad
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleChange("priority", value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <Label htmlFor="message" className="text-zinc-700 dark:text-zinc-300">
                      Mensaje <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu consulta o problema con el mayor detalle posible..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className={cn(
                        "mt-2 min-h-[150px] resize-none",
                        errors.message && "border-red-500 focus:ring-red-500"
                      )}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.message ? (
                        <p className="text-red-500 text-sm">{errors.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-zinc-400">
                        {formData.message.length} caracteres
                      </span>
                    </div>
                  </div>

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Al enviar este formulario, aceptas nuestra{" "}
                    <Link href="/privacidad" className="text-teal-600 hover:underline">
                      política de privacidad
                    </Link>
                  </p>
                </form>
              </Card>
            </motion.div>

            {/* Información de contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const defaultColor = { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" };
                const colors = colorClasses[method.color] || defaultColor;
                return (
                  <Card
                    key={method.title}
                    className="p-6 border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:border-teal-500 dark:hover:border-teal-500 transition-all"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", colors.bg)}>
                          <Icon className={cn("w-6 h-6", colors.text)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                            {method.title}
                          </h3>
                          <a
                            href={method.link}
                            className="text-zinc-600 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors block mb-1"
                          >
                            {method.value}
                          </a>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Mapa o información adicional */}
              <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                  ¿Prefieres autoservicio?
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Encuentra respuestas rápidas en nuestro centro de ayuda
                </p>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href={ROUTES.SOPORTE}>
                    Ir al centro de ayuda
                  </Link>
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
