"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import type { PatientDetails } from "@/hooks/paciente/useConfiguracion";

type Props = {
  details: PatientDetails;
  setDetails: (d: PatientDetails) => void;
  saving: boolean;
  onSave: () => Promise<void>;
};

export function MedicalInfoCard({ details, setDetails, saving, onSave }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Médica</CardTitle>
        <CardDescription>Mantén actualizada tu información de salud</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grupo_sanguineo">Grupo Sanguíneo</Label>
            <Select value={details.grupo_sanguineo || ""} onValueChange={(value) => setDetails({ ...details, grupo_sanguineo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input
              id="peso"
              type="number"
              value={details.peso_kg ?? ""}
              onChange={(e) => setDetails({ ...details, peso_kg: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="altura">Altura (cm)</Label>
            <Input
              id="altura"
              type="number"
              value={details.altura_cm ?? ""}
              onChange={(e) => setDetails({ ...details, altura_cm: e.target.value === "" ? undefined : parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alergias">Alergias</Label>
          <Textarea
            id="alergias"
            placeholder="Ej: Penicilina, Polen, Mariscos"
            value={details.alergias?.join(", ") || ""}
            onChange={(e) => setDetails({ ...details, alergias: e.target.value ? e.target.value.split(",").map((a) => a.trim()) : [] })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enfermedades">Enfermedades Crónicas</Label>
          <Textarea
            id="enfermedades"
            placeholder="Ej: Diabetes, Hipertensión"
            value={details.enfermedades_cronicas?.join(", ") || ""}
            onChange={(e) => setDetails({ ...details, enfermedades_cronicas: e.target.value ? e.target.value.split(",").map((v) => v.trim()) : [] })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicamentos">Medicamentos Actuales</Label>
          <Textarea id="medicamentos" placeholder="Lista de medicamentos que tomas actualmente" value={details.medicamentos_actuales || ""} onChange={(e) => setDetails({ ...details, medicamentos_actuales: e.target.value })} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cirugias">Cirugías Previas</Label>
          <Textarea id="cirugias" placeholder="Describe cirugías o procedimientos previos" value={details.cirugias_previas || ""} onChange={(e) => setDetails({ ...details, cirugias_previas: e.target.value })} rows={3} />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-4">Contacto de Emergencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contacto_nombre">Nombre</Label>
              <Input id="contacto_nombre" value={details.contacto_emergencia_nombre || ""} onChange={(e) => setDetails({ ...details, contacto_emergencia_nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto_telefono">Teléfono</Label>
              <Input id="contacto_telefono" type="tel" value={details.contacto_emergencia_telefono || ""} onChange={(e) => setDetails({ ...details, contacto_emergencia_telefono: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto_relacion">Relación</Label>
              <Input id="contacto_relacion" placeholder="Ej: Esposo/a, Hijo/a" value={details.contacto_emergencia_relacion || ""} onChange={(e) => setDetails({ ...details, contacto_emergencia_relacion: e.target.value })} />
            </div>
          </div>
        </div>

        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Información Médica
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
