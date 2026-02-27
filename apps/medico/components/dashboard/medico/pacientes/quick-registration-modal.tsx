"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/design-system";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { OfflinePatient } from "@/components/dashboard/medico/patients/utils";



interface QuickRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cedula: string;
  nombre: string;
  onSuccess: (patientId: string, patientData: OfflinePatient) => void;
}

export function QuickRegistrationModal({
  open,
  onOpenChange,
  cedula,
  nombre,
  onSuccess,
}: QuickRegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: nombre || "",
    cedula: cedula || "",
    genero: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Crear paciente offline
      const { data, error } = await supabase
        .from("offline_patients")
        .insert({
          doctor_id: user.id,
          cedula: formData.cedula,
          nombre_completo: formData.nombre_completo,
          genero: formData.genero || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
          status: "offline",
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "offline_patient_created",
        description: `Paciente rápido registrado: ${formData.nombre_completo}`,
        status: "success",
      });

      onSuccess(data.id, data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error registering patient:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Paciente Nuevo</DialogTitle>
          <DialogDescription>
            Este paciente no está registrado. Completa los datos básicos para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Género</Label>
              <Select
                value={formData.genero}
                onValueChange={(val) => setFormData({ ...formData, genero: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (Opcional)</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar y Continuar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
