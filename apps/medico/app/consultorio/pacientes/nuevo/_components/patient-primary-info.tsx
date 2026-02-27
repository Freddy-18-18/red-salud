"use client";

import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import {
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  Shield,
} from "lucide-react";
import "../_styles/responsive.css";

type FormData = {
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  office_id?: string | undefined;
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
  dateMin?: string | undefined;
  dateMax?: string | undefined;
  enforcePhonePrefix?: (v: string) => void;
};

export function PatientPrimaryInfo({
  formData,
  setFormData,
  cedulaFound,
  validatingCedula,
  alergias,
  setAlergias,
  notasMedicas,
  setNotasMedicas,
  observaciones,
  setObservaciones,
  emailError,
  telefonoError,
  ageError,
  dateMin,
  dateMax,
  enforcePhonePrefix
}: Props) {
  return (
    <div className="space-y-6">

      {/* Fila 1: Identidad - Grid de 5 columnas (sin consultorio) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Cédula */}
        <div className="space-y-2">
          <Label htmlFor="cedula" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            Cédula <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="cedula"
              type="text"
              placeholder="12345678"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              required
              className={`h-10 text-sm pr-9 ${cedulaFound
                ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20"
                : ""
                }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {validatingCedula && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              {!validatingCedula && cedulaFound && <CheckCircle className="h-4 w-4 text-emerald-600" />}
            </div>
          </div>
        </div>

        {/* Nombre Completo */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="nombre_completo" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-blue-500" />
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre_completo"
            type="text"
            placeholder="Juan Pérez"
            value={formData.nombre_completo}
            onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
            required
            disabled={validatingCedula}
            className={`h-10 text-sm ${cedulaFound ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}
          />
        </div>

        {/* Género - Botones compactos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-white/80">Género</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={formData.genero === "M" ? "default" : "outline"}
              className={`flex-1 h-10 text-sm ${formData.genero === "M" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
              onClick={() => setFormData({ ...formData, genero: "M" })}
            >
              M
            </Button>
            <Button
              type="button"
              size="sm"
              variant={formData.genero === "F" ? "default" : "outline"}
              className={`flex-1 h-10 text-sm ${formData.genero === "F" ? "bg-pink-500 hover:bg-pink-600" : ""}`}
              onClick={() => setFormData({ ...formData, genero: "F" })}
            >
              F
            </Button>
          </div>
        </div>

        {/* Fecha Nacimiento */}
        <div className="space-y-2">
          <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            Nacimiento
          </Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            min={dateMin}
            max={dateMax}
            className="h-10 text-sm"
          />
          {ageError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {ageError}
            </p>
          )}
        </div>
      </div>

      {/* Fila 2: Contacto - Grid de 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-purple-500" />
            Teléfono
          </Label>
          <div className="relative">
            <Input
              id="telefono"
              type="tel"
              inputMode="tel"
              placeholder="+58 412 1234567"
              value={formData.telefono}
              onChange={(e) => enforcePhonePrefix ? enforcePhonePrefix(e.target.value) : setFormData({ ...formData, telefono: e.target.value })}
              className={`h-10 text-sm pl-9 ${telefonoError && formData.telefono && formData.telefono.length > 4 ? "border-red-300" : ""}`}
              maxLength={16}
            />
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {telefonoError && formData.telefono && formData.telefono.length > 4 && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {telefonoError}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-purple-500" />
            Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="paciente@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`h-10 text-sm pl-9 ${emailError ? "border-red-300" : ""}`}
            />
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {emailError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {emailError}
            </p>
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-purple-500" />
            Dirección
          </Label>
          <div className="relative">
            <Input
              id="direccion"
              placeholder="Calle, ciudad, estado"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="h-10 text-sm pl-9"
            />
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Campos Médicos - Vertical con más espacio */}
      <div className="space-y-6 pt-4">
        {/* Alergias */}
        <div className="space-y-2">
          <Label htmlFor="alergias" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            Alergias Conocidas
            <span className="text-xs text-gray-400 font-normal">(separar con comas)</span>
          </Label>
          <div className="relative">
            <Input
              id="alergias"
              type="text"
              placeholder="Penicilina, Polvo, Maní..."
              value={alergias.join(", ")}
              onChange={(e) => setAlergias(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="h-10 text-sm pl-9"
            />
            <AlertCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          </div>
          {alergias.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {alergias.map((alergia, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {alergia}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Historial Médico */}
        <div className="space-y-2">
          <Label htmlFor="historial" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-500" />
            Historial Médico Breve
          </Label>
          <Textarea
            id="historial"
            placeholder="Antecedentes relevantes, cirugías previas, condiciones crónicas..."
            value={notasMedicas}
            onChange={(e) => setNotasMedicas(e.target.value)}
            className="min-h-[120px] text-sm resize-none"
          />
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-500" />
            Observaciones Adicionales
          </Label>
          <Textarea
            id="observaciones"
            placeholder="Notas complementarias, indicaciones especiales..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="min-h-[120px] text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
