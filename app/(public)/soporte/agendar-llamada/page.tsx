"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

const supportTopics = [
  { id: "technical", label: "Soporte técnico", description: "Problemas con la plataforma" },
  { id: "billing", label: "Facturación", description: "Pagos y suscripciones" },
  { id: "account", label: "Mi cuenta", description: "Configuración y acceso" },
  { id: "enterprise", label: "Empresas", description: "Soluciones corporativas" },
  { id: "other", label: "Otro", description: "Consultas generales" },
];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days: (number | null)[] = [];
  
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}

export default function AgendarLlamadaPage() {
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const isDateAvailable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  const handleDateSelect = (day: number) => {
    if (isDateAvailable(day)) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      setSelectedTime("");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsComplete(true);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedTopic;
      case 2:
        return !!selectedDate && !!selectedTime;
      case 3:
        return formData.name && formData.email;
      default:
        return false;
    }
  };

  if (isComplete) {
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
            ¡Llamada agendada!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-2">
            Tu videollamada ha sido programada para:
          </p>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-6">
            <p className="font-semibold text-zinc-900 dark:text-white">
              {selectedDate?.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-teal-600 dark:text-teal-400 font-medium">
              {selectedTime} hrs
            </p>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Recibirás un email de confirmación con el enlace para unirte a la llamada.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 rounded-full">
              <Link href="/soporte">Volver al centro de ayuda</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                setIsComplete(false);
                setStep(1);
                setSelectedTopic("");
                setSelectedDate(null);
                setSelectedTime("");
                setFormData({ name: "", email: "", phone: "", description: "" });
              }}
            >
              Agendar otra llamada
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
              <Video className="w-4 h-4" />
              Soporte personalizado
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              Agenda una videollamada
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Habla directamente con nuestro equipo de soporte
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  step >= s
                    ? "bg-teal-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                )}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-24 sm:w-32 h-1 mx-2 rounded-full transition-all",
                    step > s ? "bg-teal-500" : "bg-zinc-200 dark:bg-zinc-800"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>Tema</span>
          <span>Fecha y hora</span>
          <span>Tus datos</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Card className="p-6 sm:p-8">
          {/* Step 1: Topic */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                ¿Sobre qué necesitas ayuda?
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Selecciona el tema principal de tu consulta
              </p>
              <div className="space-y-3">
                {supportTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      selectedTopic === topic.id
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700"
                    )}
                  >
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {topic.label}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {topic.description}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Selecciona fecha y hora
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Elige el momento que mejor te convenga
              </p>

              {/* Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      disabled={day === null || !isDateAvailable(day)}
                      onClick={() => day && handleDateSelect(day)}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-all",
                        day === null && "invisible",
                        day && !isDateAvailable(day) && "text-zinc-300 dark:text-zinc-700 cursor-not-allowed",
                        day && isDateAvailable(day) && "hover:bg-teal-100 dark:hover:bg-teal-900/30 text-zinc-900 dark:text-white",
                        selectedDate?.getDate() === day &&
                          selectedDate?.getMonth() === currentMonth.getMonth() &&
                          "bg-teal-500 text-white hover:bg-teal-600"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Label className="text-zinc-700 dark:text-zinc-300 mb-3 block">
                    Horarios disponibles para {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          selectedTime === time
                            ? "bg-teal-500 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Tus datos de contacto
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Te enviaremos la confirmación y el enlace de la llamada
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">
                    Teléfono (opcional)
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300">
                    Describe brevemente tu consulta
                  </Label>
                  <div className="relative mt-2">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <Textarea
                      id="description"
                      placeholder="Cuéntanos más sobre tu consulta para prepararnos mejor..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="pl-10 min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <h3 className="font-medium text-zinc-900 dark:text-white mb-3">
                    Resumen de tu cita
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tema:</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {supportTopics.find((t) => t.id === selectedTopic)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fecha:</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {selectedDate?.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hora:</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        {selectedTime} hrs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Confirmar cita
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}