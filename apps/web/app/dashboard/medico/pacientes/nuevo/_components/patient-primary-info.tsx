"use client";

import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Textarea } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { CheckCircle, UserPlus, Calendar, Phone, Mail, MapPin, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import "../_styles/responsive.css";

type FormData = {
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
};

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  edad: number | null;
  cedulaFound: boolean;
  validatingCedula: boolean;
  alergias: string[];
  setAlergias: (a: string[]) => void;
  notasMedicas: string;
  setNotasMedicas: (s: string) => void;
  observaciones: string;
  setObservaciones: (s: string) => void;
  emailError?: string | null;
  telefonoError?: string | null;
  ageError?: string | null;
  dateMin?: string;
  dateMax?: string;
  enforcePhonePrefix?: (v: string) => void;
};

export function PatientPrimaryInfo({ formData, setFormData, edad, cedulaFound, validatingCedula, alergias, setAlergias, notasMedicas, setNotasMedicas, observaciones, setObservaciones, emailError, telefonoError, ageError, dateMin, dateMax, enforcePhonePrefix }: Props) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-8">
      {/* Sección 1: Identidad */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Identidad del Paciente</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
              Cédula <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
                className="pr-10"
              />
              {validatingCedula && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Calendar className="h-4 w-4 animate-pulse text-blue-600" />
                </div>
              )}
              {!validatingCedula && cedulaFound && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            {cedulaFound && !validatingCedula && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verificado
              </p>
            )}
          </div>

          {/* Nombre Completo */}
          <div className="space-y-2 md:col-span-2 lg:col-span-2">
            <Label htmlFor="nombre_completo" className="text-sm font-medium text-gray-700">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre_completo"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              required
              disabled={validatingCedula}
              className={cedulaFound ? "bg-green-50 border-green-300" : ""}
            />
          </div>

          {/* Género */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Género</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.genero === "M" ? "default" : "outline"}
                className="flex-1 px-2"
                onClick={() => setFormData({ ...formData, genero: "M" })}
              >
                M
              </Button>
              <Button
                type="button"
                variant={formData.genero === "F" ? "default" : "outline"}
                className="flex-1 px-2"
                onClick={() => setFormData({ ...formData, genero: "F" })}
              >
                F
              </Button>
            </div>
          </div>

          {/* Fecha Nacimiento */}
          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700">
              Fecha Nacimiento
            </Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              min={dateMin}
              max={dateMax}
            />
            {ageError && <p className="text-xs text-red-600">{ageError}</p>}
          </div>

          {/* Edad (Calculada) */}
          <div className="space-y-2">
            <Label htmlFor="edad" className="text-sm font-medium text-gray-700">
              Edad
            </Label>
            <div className="relative">
              <Input
                id="edad"
                type="text"
                value={edad !== null ? `${edad} años` : ""}
                disabled
                placeholder="Auto"
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Contacto */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Phone className="h-4 w-4 text-purple-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Datos de Contacto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
              Teléfono
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="telefono"
                type="tel"
                inputMode="tel"
                placeholder="+58 412 1234567"
                value={formData.telefono}
                onChange={(e) => enforcePhonePrefix ? enforcePhonePrefix(e.target.value) : setFormData({ ...formData, telefono: e.target.value })}
                className={`pl-9 ${telefonoError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                maxLength={16}
              />
            </div>
            {telefonoError && <p className="text-xs text-red-600">{telefonoError}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-2 lg:col-span-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="paciente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`pl-9 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
            </div>
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          </div>

          {/* Dirección */}
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
              Dirección
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="direccion"
                placeholder="Calle, ciudad, estado"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="pl-9 min-h-[60px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 3: Información Médica */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b">
          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Información Médica Básica</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alergias */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alergias" className="text-sm font-medium text-gray-700">
              Alergias Conocidas
            </Label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="alergias"
                type="text"
                placeholder="Ej: Penicilina, Polvo, Mani"
                value={alergias.join(", ")}
                onChange={(e) => setAlergias(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                className="pl-9"
              />
            </div>
          </div>

          {/* Historial */}
          <div className="space-y-2">
            <Label htmlFor="historial" className="text-sm font-medium text-gray-700">
              Historial Médico Breve
            </Label>
            <Textarea
              id="historial"
              placeholder="Antecedentes relevantes..."
              value={notasMedicas}
              onChange={(e) => setNotasMedicas(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
              Observaciones Adicionales
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Notas complementarias..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
