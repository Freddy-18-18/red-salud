"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Badge,
} from "@red-salud/design-system";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  MapPin,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface CneVerifyResponse {
  error: boolean;
  message?: string;
  data?: {
    nacionalidad: string;
    cedula: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    cne_estado: string | null;
    cne_municipio: string | null;
    cne_parroquia: string | null;
  };
}

interface CedulaVerificationProps {
  /** Current user ID */
  userId: string;
  /** Whether the cedula is already verified */
  isVerified: boolean;
  /** Verified name (displayed when already verified) */
  verifiedName?: string;
  /** Verified cedula (displayed when already verified) */
  verifiedCedula?: string;
  /** Verified nationality */
  verifiedNationality?: string;
  /** CNE estado from verification */
  cneEstado?: string;
  /** CNE municipio from verification */
  cneMunicipio?: string;
  /** CNE parroquia from verification */
  cneParroquia?: string;
  /** Called after successful verification with updated profile fields */
  onVerified?: (fields: {
    full_name: string;
    national_id: string;
    nationality: string;
    cedula_verified: boolean;
    cedula_verified_at: string;
    cne_estado: string | null;
    cne_municipio: string | null;
    cne_parroquia: string | null;
  }) => void;
}

type Step = "input" | "loading" | "confirm" | "success";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

function capitalize(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCedula(value: string): string {
  const digits = value.replace(/\D/g, "");
  // Format as X.XXX.XXX
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, -3)}.${digits.slice(-3)}`;
  return `${digits.slice(0, -6)}.${digits.slice(-6, -3)}.${digits.slice(-3)}`;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export function CedulaVerification({
  userId,
  isVerified,
  verifiedName,
  verifiedCedula,
  verifiedNationality,
  cneEstado,
  cneMunicipio,
  cneParroquia,
  onVerified,
}: CedulaVerificationProps) {
  const [step, setStep] = useState<Step>(isVerified ? "success" : "input");
  const [nacionalidad, setNacionalidad] = useState<"V" | "E">("V");
  const [cedula, setCedula] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cneData, setCneData] = useState<CneVerifyResponse["data"] | null>(null);

  // For the success state, use either verified props or freshly-confirmed data
  const displayName = verifiedName ?? "";
  const displayCedula = verifiedCedula ?? "";
  const displayNationality = verifiedNationality ?? "";
  const displayEstado = cneEstado ?? cneData?.cne_estado ?? null;
  const displayMunicipio = cneMunicipio ?? cneData?.cne_municipio ?? null;
  const displayParroquia = cneParroquia ?? cneData?.cne_parroquia ?? null;

  // -----------------------------------------------------------------
  // Step 1: Input -> Call API
  // -----------------------------------------------------------------
  const handleVerify = useCallback(async () => {
    const cedulaClean = cedula.replace(/\D/g, "");
    if (!cedulaClean || cedulaClean.length < 6 || cedulaClean.length > 9) {
      setErrorMessage("Ingresa un numero de cedula valido (6-9 digitos).");
      return;
    }

    setErrorMessage(null);
    setStep("loading");

    try {
      const response = await fetch("/api/verify-cedula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nacionalidad, cedula: cedulaClean }),
      });

      const result = (await response.json()) as CneVerifyResponse;

      if (result.error || !result.data) {
        setErrorMessage(result.message ?? "Error al verificar la cedula.");
        setStep("input");
        return;
      }

      setCneData(result.data);
      setStep("confirm");
    } catch {
      setErrorMessage("Error de conexion. Intenta nuevamente.");
      setStep("input");
    }
  }, [cedula, nacionalidad]);

  // -----------------------------------------------------------------
  // Step 3: Confirm -> Save to DB
  // -----------------------------------------------------------------
  const handleConfirm = useCallback(async () => {
    if (!cneData) return;

    setStep("loading");
    setErrorMessage(null);

    const fullName = [
      capitalize(cneData.primer_nombre),
      capitalize(cneData.segundo_nombre),
      capitalize(cneData.primer_apellido),
      capitalize(cneData.segundo_apellido),
    ]
      .filter(Boolean)
      .join(" ");

    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          national_id: cneData.cedula,
          nationality: cneData.nacionalidad,
          cedula_verified: true,
          cedula_verified_at: now,
          cne_estado: cneData.cne_estado,
          cne_municipio: cneData.cne_municipio,
          cne_parroquia: cneData.cne_parroquia,
          updated_at: now,
        })
        .eq("id", userId);

      if (error) throw error;

      // Log activity
      await supabase.from("user_activity_log").insert({
        user_id: userId,
        activity_type: "cedula_verified",
        description: `Cedula verificada via CNE: ${cneData.nacionalidad}-${cneData.cedula}`,
        status: "success",
      });

      onVerified?.({
        full_name: fullName,
        national_id: cneData.cedula,
        nationality: cneData.nacionalidad,
        cedula_verified: true,
        cedula_verified_at: now,
        cne_estado: cneData.cne_estado,
        cne_municipio: cneData.cne_municipio,
        cne_parroquia: cneData.cne_parroquia,
      });

      setStep("success");
    } catch {
      setErrorMessage("Error al guardar la verificacion. Intenta nuevamente.");
      setStep("confirm");
    }
  }, [cneData, userId, onVerified]);

  // -----------------------------------------------------------------
  // Step 3 (alt): Not me -> go back
  // -----------------------------------------------------------------
  const handleReject = useCallback(() => {
    setCneData(null);
    setErrorMessage(
      "Si los datos no coinciden, verifica el numero de cedula e intenta de nuevo.",
    );
    setStep("input");
  }, []);

  // -----------------------------------------------------------------
  // Render: Already verified
  // -----------------------------------------------------------------
  if (step === "success" && isVerified) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              Identidad Verificada
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700">
              Verificado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Name */}
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {displayNationality}-{displayCedula}
              </p>
            </div>
          </div>

          {/* CNE Location */}
          {displayEstado && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Ubicacion registral (CNE)
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {[capitalize(displayEstado), capitalize(displayMunicipio ?? "")]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {displayParroquia && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Parroquia: {capitalize(displayParroquia)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // -----------------------------------------------------------------
  // Render: Just-confirmed success (fresh verification in this session)
  // -----------------------------------------------------------------
  if (step === "success" && cneData) {
    const fullName = [
      capitalize(cneData.primer_nombre),
      capitalize(cneData.segundo_nombre),
      capitalize(cneData.primer_apellido),
      capitalize(cneData.segundo_apellido),
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              Identidad Verificada
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700">
              Verificado
            </Badge>
          </div>
          <CardDescription className="text-emerald-700 dark:text-emerald-400">
            Tu identidad ha sido verificada exitosamente con el CNE.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {cneData.nacionalidad}-{cneData.cedula}
              </p>
            </div>
          </div>
          {cneData.cne_estado && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Ubicacion registral (CNE)
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {[capitalize(cneData.cne_estado), capitalize(cneData.cne_municipio ?? "")]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {cneData.cne_parroquia && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Parroquia: {capitalize(cneData.cne_parroquia)}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // -----------------------------------------------------------------
  // Render: Input / Loading / Confirm steps
  // -----------------------------------------------------------------
  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Verificacion de Cedula
        </CardTitle>
        <CardDescription>
          Verifica tu identidad con el Consejo Nacional Electoral (CNE) para
          desbloquear funciones avanzadas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error banner */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step: Input */}
        {step === "input" && (
          <>
            {/* Nationality Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nacionalidad</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNacionalidad("V")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                    nacionalidad === "V"
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  V - Venezolano
                </button>
                <button
                  type="button"
                  onClick={() => setNacionalidad("E")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border transition-all ${
                    nacionalidad === "E"
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  E - Extranjero
                </button>
              </div>
            </div>

            {/* Cedula Input */}
            <div className="space-y-2">
              <Label htmlFor="cedula-input" className="text-sm font-medium">
                Numero de Cedula
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {nacionalidad}-
                </span>
                <Input
                  id="cedula-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="12.345.678"
                  value={formatCedula(cedula)}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  className="pl-10"
                  maxLength={12}
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ingresa tu numero de cedula sin puntos ni guiones.
              </p>
            </div>

            {/* Verify button */}
            <Button
              onClick={handleVerify}
              disabled={!cedula.replace(/\D/g, "")}
              className="w-full gap-2"
            >
              Verificar Cedula
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Step: Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consultando el CNE...
            </p>
          </div>
        )}

        {/* Step: Confirm identity */}
        {step === "confirm" && cneData && (
          <>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                Encontramos estos datos. Confirma que sos vos:
              </p>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {capitalize(cneData.primer_nombre)}{" "}
                  {capitalize(cneData.segundo_nombre)}{" "}
                  {capitalize(cneData.primer_apellido)}{" "}
                  {capitalize(cneData.segundo_apellido)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cneData.nacionalidad}-{cneData.cedula}
                </p>
                {cneData.cne_estado && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {capitalize(cneData.cne_estado)}
                    {cneData.cne_municipio && `, ${capitalize(cneData.cne_municipio)}`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleConfirm} className="flex-1 gap-2">
                <ShieldCheck className="h-4 w-4" />
                Si, soy yo
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                No soy yo
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
