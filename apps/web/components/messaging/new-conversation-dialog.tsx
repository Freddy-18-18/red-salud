"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/design-system";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { createMedicoSdk, type DoctorProfile } from "@red-salud/sdk-medico";

import { supabase } from "@/lib/supabase/client";
import type { CreateConversationData } from "@/lib/supabase/types/messaging";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";

const medicoSdk = createMedicoSdk(supabase);

interface NewConversationDialogProps {
  onCreateConversation: (data: CreateConversationData) => Promise<{ success: boolean; error?: string; data?: unknown }>;
}

export function NewConversationDialog({
  onCreateConversation,
}: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      loadDoctors();
    }
  }, [open]);

  const loadDoctors = async () => {
    try {
      const data = await medicoSdk.appointments.getAvailableDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !message.trim()) return;

    setLoading(true);
    try {
      await onCreateConversation({
        doctor_id: selectedDoctor,
        subject: subject.trim() || undefined,
        initial_message: message.trim(),
      });

      // Reset form
      setSelectedDoctor("");
      setSubject("");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Nueva Conversación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Conversación</DialogTitle>
          <DialogDescription>
            Inicia una conversación con un doctor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor *</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => {
                  const initials = doctor.profile?.nombre_completo
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={doctor.profile?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {doctor.profile?.nombre_completo}
                          </p>
                          {doctor.specialty && (
                            <p className="text-xs text-muted-foreground">
                              {doctor.specialty.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto (opcional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Consulta sobre resultados de laboratorio"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje inicial..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedDoctor || !message.trim() || loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Conversación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
