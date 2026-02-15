"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Alert, AlertDescription } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/ui";
import { CheckCircle, XCircle, Loader2, Shield, UserPlus, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { VerificationResult, Specialty } from "./hooks/useProfileSetup";

interface Props {
  cedula: string;
  tipoDocumento: "V" | "E";
  verificationResult: VerificationResult | null;
  verifying: boolean;
  yearsExperience: string;
  loading: boolean;
  specialties: Specialty[];
  onCedulaChange: (v: string) => void;
  onTipoChange: (v: "V" | "E") => void;
  onVerify: () => void;
  onSetYearsExperience: (v: string) => void;
  onComplete: () => void;
  onCompleteManual: (data: {
    nombre_completo: string;
    cedula: string;
    tipo_documento: string;
    especialidad_id: string;
    anos_experiencia: number;
  }) => void;
}

export function VerificationSection({
  cedula,
  tipoDocumento,
  verificationResult,
  verifying,
  yearsExperience,
  loading,
  specialties,
  onCedulaChange,
  onTipoChange,
  onVerify,
  onSetYearsExperience,
  onComplete,
  onCompleteManual,
}: Props) {
  const [manualMode, setManualMode] = useState(false);
  
  // Estados para modo manual
  const [manualNombre, setManualNombre] = useState("");
  const [manualCedula, setManualCedula] = useState("");
  const [manualTipo, setManualTipo] = useState<"V" | "E">("V");
  const [manualEspecialidadId, setManualEspecialidadId] = useState("");
  const [manualExperiencia, setManualExperiencia] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [manualSelectedSpecialtyName, setManualSelectedSpecialtyName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);
  
  const filteredSpecialties = specialties.filter((s) =>
    s.name.toLowerCase().includes(manualSearch.toLowerCase())
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll automático al elemento destacado
  useEffect(() => {
    if (highlightedItemRef.current && isDropdownOpen) {
      highlightedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex, isDropdownOpen]);

  const handleSelectSpecialty = (specialty: Specialty) => {
    setManualEspecialidadId(specialty.id);
    setManualSelectedSpecialtyName(specialty.name);
    setManualSearch("");
    setIsDropdownOpen(false);
    setHighlightedIndex(0);
  };

  const handleSpecialtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredSpecialties.length === 0) {
      // Si presiona Enter sin dropdown abierto, prevenir submit del formulario
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < Math.min(filteredSpecialties.length - 1, 9) ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredSpecialties[highlightedIndex]) {
          handleSelectSpecialty(filteredSpecialties[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(0);
        break;
      case "Tab":
        // Permitir Tab para navegación normal del formulario
        setIsDropdownOpen(false);
        break;
    }
  };

  const handleSpecialtyInputChange = (value: string) => {
    setManualSearch(value);
    setIsDropdownOpen(value.length > 0);
    setHighlightedIndex(0);
    
    // Si borra el input, también limpiar la selección
    if (value === "") {
      setManualEspecialidadId("");
      setManualSelectedSpecialtyName("");
    }
  };

  const handleCompleteManual = () => {
    if (!manualNombre || !manualCedula || !manualEspecialidadId || !manualExperiencia) {
      return;
    }
    onCompleteManual({
      nombre_completo: manualNombre,
      cedula: manualCedula,
      tipo_documento: manualTipo,
      especialidad_id: manualEspecialidadId,
      anos_experiencia: parseInt(manualExperiencia),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 ${manualMode ? "bg-purple-100" : "bg-blue-100"} rounded-full flex items-center justify-center`}>
              {manualMode ? <UserPlus className="h-6 w-6 text-purple-600" /> : <Shield className="h-6 w-6 text-blue-600" />}
            </div>
            <div>
              <CardTitle>{manualMode ? "Registro Manual" : "Verificación SACS"}</CardTitle>
              <CardDescription>
                {manualMode
                  ? "Para profesionales no registrados en SACS"
                  : "Verifica tu identidad como profesional de la salud en Venezuela"}
              </CardDescription>
            </div>
          </div>
        </div>
        
        {/* Toggle entre SACS y Manual */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-xs"
          onClick={() => setManualMode(!manualMode)}
          type="button"
        >
          {manualMode ? (
            <>
              <Shield className="h-3 w-3 mr-2" />
              ¿Estás registrado en SACS? Haz clic aquí
            </>
          ) : (
            <>
              <UserPlus className="h-3 w-3 mr-2" />
              ¿No estás en SACS? (Psicólogos, Asistentes, etc.)
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {!manualMode ? (
          <>
            {/* MODO SACS */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={tipoDocumento} onValueChange={(v) => onTipoChange(v as "V" | "E")}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V">V</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="cedula">Número de Cédula</Label>
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="12345678"
                    value={cedula}
                    onChange={(e) => onCedulaChange(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    disabled={verifying || !!verificationResult?.verified}
                  />
                </div>
              </div>

              <Button
                onClick={onVerify}
                disabled={verifying || !cedula || !!verificationResult?.verified}
                className="w-full"
                size="lg"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verificando con SACS...
                  </>
                ) : verificationResult?.verified ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verificado Exitosamente
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Verificar con SACS
                  </>
                )}
              </Button>
            </div>

            {verificationResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {verificationResult.verified ? (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <p className="font-semibold text-green-900">¡Verificación Exitosa!</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nombre:</span>
                            <span className="font-medium text-gray-900">{verificationResult.data?.nombre_completo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Profesión:</span>
                            <span className="font-medium text-gray-900">{verificationResult.data?.profesion_principal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Matrícula:</span>
                            <span className="font-medium text-gray-900">{verificationResult.data?.matricula_principal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Especialidad:</span>
                            <span className="font-medium text-gray-900">{verificationResult.data?.especialidad_display}</span>
                          </div>
                          {verificationResult.data?.tiene_postgrados && (
                            <Badge className="bg-purple-100 text-purple-800">Con Postgrados</Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Verificación Fallida</p>
                      <p className="text-sm">{verificationResult.message}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}

            {/* Campo de años de experiencia (solo si verificado) */}
            {verificationResult?.verified && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                  <Label htmlFor="experience">Años de Experiencia *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="60"
                    value={yearsExperience}
                    onChange={(e) => onSetYearsExperience(e.target.value)}
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Años de experiencia profesional en el área de la salud</p>
                </div>
              </motion.div>
            )}

            {verificationResult?.verified && yearsExperience && (
              <Button onClick={onComplete} disabled={loading || !yearsExperience} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Completando Registro...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completar Registro
                  </>
                )}
              </Button>
            )}
          </>
        ) : (
          <>
            {/* MODO MANUAL */}
            <div className="space-y-4">
              <Alert className="border-amber-500 bg-amber-50">
                <AlertDescription className="text-sm text-amber-900">
                  <strong>Nota:</strong> Tu perfil será marcado como "pendiente de verificación" hasta que el equipo de
                  Red-Salud valide tu información manualmente.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="manual-nombre">Nombre Completo *</Label>
                <Input
                  id="manual-nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={manualNombre}
                  onChange={(e) => setManualNombre(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="manual-tipo">Tipo</Label>
                  <Select value={manualTipo} onValueChange={(v) => setManualTipo(v as "V" | "E")}>
                    <SelectTrigger id="manual-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V">V</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor="manual-cedula">Número de Cédula *</Label>
                  <Input
                    id="manual-cedula"
                    type="text"
                    placeholder="12345678"
                    value={manualCedula}
                    onChange={(e) => setManualCedula(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="manual-specialty-search">Profesión / Especialidad *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                  <Input
                    ref={inputRef}
                    id="manual-specialty-search"
                    placeholder={
                      manualSelectedSpecialtyName
                        ? ""
                        : "Buscar profesión..."
                    }
                    value={manualSearch}
                    onChange={(e) => handleSpecialtyInputChange(e.target.value)}
                    onKeyDown={handleSpecialtyKeyDown}
                    onFocus={() => {
                      if (manualSearch) setIsDropdownOpen(true);
                    }}
                    className={`pl-10 ${manualSelectedSpecialtyName && !manualSearch ? "text-transparent" : ""}`}
                    autoComplete="off"
                  />
                  {manualSelectedSpecialtyName && !manualSearch && (
                    <div className="absolute left-10 top-1/2 transform -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-sm text-gray-900">{manualSelectedSpecialtyName}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">Seleccionada</Badge>
                    </div>
                  )}
                </div>
                {isDropdownOpen && manualSearch && filteredSpecialties.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="mt-2 max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg z-50 absolute w-full"
                  >
                    {filteredSpecialties.slice(0, 10).map((specialty, index) => (
                      <button
                        key={specialty.id}
                        ref={index === highlightedIndex ? highlightedItemRef : null}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          index === highlightedIndex
                            ? "bg-blue-100 text-blue-900 font-medium"
                            : manualEspecialidadId === specialty.id
                            ? "bg-blue-50 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectSpecialty(specialty)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {specialty.name}
                      </button>
                    ))}
                  </div>
                )}
                {isDropdownOpen && manualSearch && filteredSpecialties.length === 0 && (
                  <div
                    ref={dropdownRef}
                    className="mt-2 border rounded-md bg-white shadow-lg p-3 text-sm text-gray-500 absolute w-full"
                  >
                    No se encontraron especialidades
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {manualSelectedSpecialtyName ? (
                    <>Escribe para cambiar la especialidad seleccionada</>
                  ) : (
                    <>Usa las flechas ↑↓ para navegar, Enter para seleccionar</>
                  )}
                </p>
              </div>

              <div>
                <Label htmlFor="manual-experience">Años de Experiencia *</Label>
                <Input
                  id="manual-experience"
                  type="number"
                  min="0"
                  max="60"
                  value={manualExperiencia}
                  onChange={(e) => setManualExperiencia(e.target.value)}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">Años de experiencia profesional en el área de la salud</p>
              </div>

              <Button
                onClick={handleCompleteManual}
                disabled={
                  loading ||
                  !manualNombre ||
                  !manualCedula ||
                  !manualEspecialidadId ||
                  !manualExperiencia
                }
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creando Perfil...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Crear Perfil (Pendiente de Verificación)
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

