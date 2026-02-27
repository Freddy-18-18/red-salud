"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Button, DatePicker, LocationPicker, StateCitySelector, type LocationData } from "@red-salud/design-system";
import { Loader2, Save, Upload, User, Phone, MapPin, Mail, CreditCard, Building2, Flag, CheckCircle2, AlertCircle, Lock, ShieldCheck, Map } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { VENEZUELA_ESTADOS, getEstadoName } from "@/lib/data/venezuela-data";

interface Profile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  cedula?: string;
  avatar_url?: string;
  cedula_verificada?: boolean;
}

// ── Venezuelan phone helpers ──────────────────────────────────────────────────
const VE_PREFIXES = ["412", "414", "416", "424", "426", "212", "262"];

function normalizeVenezuelanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  let local = digits;
  if (local.startsWith("58")) local = local.slice(2);
  if (local.startsWith("0")) local = local.slice(1);
  return local;
}

function formatVenezuelanPhone(raw: string): string {
  const local = normalizeVenezuelanPhone(raw).slice(0, 10);
  if (!local) return "";

  if (local.length <= 3) return `+58 ${local}`;
  if (local.length <= 6) return `+58 ${local.slice(0, 3)} ${local.slice(3)}`;
  return `+58 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

function validateVenezuelanPhone(value: string): string | null {
  const local = normalizeVenezuelanPhone(value);
  if (local.length !== 10) return "El teléfono debe tener formato +58 xxx xxx xxxx";
  const prefix = local.slice(0, 3);
  if (!VE_PREFIXES.includes(prefix)) {
    return `Prefijo inválido. Use: ${VE_PREFIXES.map((p) => `+58 ${p}`).join(", ")}`;
  }
  return null;
}

export default function PerfilConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Cédula CNE validation state ──────────────────────────────────────────
  const [nacionalidad, setNacionalidad] = useState<"V" | "E">("V");
  const [numeroCedula, setNumeroCedula] = useState("");
  const [cedulaStatus, setCedulaStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [cedulaError, setCedulaError] = useState("");
  const isCedulaLocked = profile?.cedula_verificada === true || cedulaStatus === "success";

  // ── Phone validation state ──────────────────────────────────────────────
  const [phoneError, setPhoneError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [selectedEstadoCode, setSelectedEstadoCode] = useState("");
  const [isPostalLoading, setIsPostalLoading] = useState(false);

  const resolveEstadoCode = useCallback((estadoValue?: string) => {
    if (!estadoValue) return "";
    const normalized = estadoValue.trim().toLowerCase();
    const byCode = VENEZUELA_ESTADOS.find((estado) => estado.code.toLowerCase() === normalized);
    if (byCode) return byCode.code;
    const byName = VENEZUELA_ESTADOS.find((estado) => estado.name.toLowerCase() === normalized);
    return byName?.code || "";
  }, []);

  const resolvePostalCodeByCity = useCallback(async (estadoName: string, ciudad: string): Promise<string | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !estadoName || !ciudad) return null;
    try {
      setIsPostalLoading(true);
      const query = encodeURIComponent(`${ciudad}, ${estadoName}, Venezuela`);
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`);
      if (!response.ok) return null;
      const data = await response.json();
      const firstResult = data?.results?.[0];
      if (!firstResult?.address_components) return null;
      const postalComponent = firstResult.address_components.find((component: { types?: string[]; long_name?: string }) =>
        component.types?.includes("postal_code")
      );
      return postalComponent?.long_name || null;
    } catch (error) {
      console.error("Error resolving postal code:", error);
      return null;
    } finally {
      setIsPostalLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const loadedProfile: Profile = {
        id: user.id,
        email: user.email || "",
        nombre_completo: profileData?.nombre_completo || "",
        telefono: profileData?.telefono || "",
        fecha_nacimiento: profileData?.fecha_nacimiento || "",
        direccion: profileData?.direccion || "",
        ciudad: profileData?.ciudad || "",
        estado: profileData?.estado || "",
        codigo_postal: profileData?.codigo_postal || "",
        cedula: profileData?.cedula || "",
        avatar_url: profileData?.foto_perfil_url || profileData?.avatar_url || "",
        cedula_verificada: profileData?.cedula_verificada || false,
      };

      setProfile(loadedProfile);

      // Pre-fill cedula fields if present
      if (loadedProfile.cedula) {
        const match = loadedProfile.cedula.match(/^([VE])-?(\d+)$/i);
        if (match && match[1] && match[2]) {
          setNacionalidad(match[1].toUpperCase() as "V" | "E");
          setNumeroCedula(match[2]);
        } else {
          setNumeroCedula(loadedProfile.cedula.replace(/\D/g, ""));
        }
      }

      setSelectedEstadoCode(resolveEstadoCode(loadedProfile.estado));
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Error al cargar el perfil" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Phone validation if provided
    if (profile.telefono) {
      const phoneErr = validateVenezuelanPhone(profile.telefono);
      if (phoneErr) {
        setPhoneError(phoneErr);
        setMessage({ type: "error", text: phoneErr });
        return;
      }
    }
    setPhoneError("");

    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {
        nombre_completo: profile.nombre_completo,
        telefono: profile.telefono,
        fecha_nacimiento: profile.fecha_nacimiento,
        direccion: profile.direccion,
        ciudad: profile.ciudad,
        estado: profile.estado,
        codigo_postal: profile.codigo_postal,
        cedula: profile.cedula,
      };

      // Mark cedula as verified if just validated via CNE
      if (cedulaStatus === "success" && !profile.cedula_verificada) {
        updateData.cedula_verificada = true;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      if (cedulaStatus === "success" && !profile.cedula_verificada) {
        setProfile({ ...profile, cedula_verificada: true });
      }

      setMessage({ type: "success", text: "Perfil guardado correctamente" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Error al guardar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  // ── CNE Cedula Validation ─────────────────────────────────────────────────
  const handleCedulaValidation = useCallback(async () => {
    if (!numeroCedula || numeroCedula.length < 6) {
      setCedulaStatus("error");
      setCedulaError("La cédula debe tener al menos 6 dígitos");
      return;
    }

    setCedulaStatus("validating");
    setCedulaError("");

    try {
      const res = await fetch(
        `/api/cne/validate?cedula=${encodeURIComponent(numeroCedula)}&nacionalidad=${nacionalidad}`
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        setCedulaStatus("error");
        setCedulaError(data.error || "No se pudo validar la cédula con el CNE");
        return;
      }

      // Lock name and cedula with CNE data
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nombre_completo: data.nombre_completo || prev.nombre_completo,
              cedula: `${data.nacionalidad || nacionalidad}-${data.cedula || numeroCedula}`,
            }
          : prev
      );
      setCedulaStatus("success");
    } catch {
      setCedulaStatus("error");
      setCedulaError("Error al conectar con el servicio de verificación");
    }
  }, [numeroCedula, nacionalidad]);

  const handleLocationSelect = useCallback((location: LocationData) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const matchedEstado = location.state
        ? VENEZUELA_ESTADOS.find(
            (estado) =>
              location.state?.toLowerCase().includes(estado.name.toLowerCase()) ||
              estado.name.toLowerCase().includes(location.state?.toLowerCase() || "")
          )
        : undefined;

      if (matchedEstado) {
        setSelectedEstadoCode(matchedEstado.code);
      }

      return {
        ...prev,
        direccion: location.address || prev.direccion || "",
        ciudad: location.city || prev.ciudad || "",
        estado: matchedEstado?.name || location.state || prev.estado || "",
        codigo_postal: location.postalCode || prev.codigo_postal || "",
      };
    });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ foto_perfil_url: publicUrl })
        .eq("id", profile.id);

      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: "success", text: "Foto de perfil actualizada" });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({ type: "error", text: "Error al subir la foto" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No se encontró el perfil</p>
      </div>
    );
  }

  const initials = profile.nombre_completo
    ? profile.nombre_completo.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : (profile.email?.[0] ?? "?").toUpperCase();
  const todayIso = new Date().toISOString().split("T")[0] || "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal y datos de contacto
        </p>
      </div>

      {/* Mensaje */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* ── Avatar Section ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Foto de Perfil
          </CardTitle>
          <CardDescription>
            Tu foto será visible para médicos y en tu perfil público
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Avatar with ring so the circle is always visible */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-2 ring-border shadow-sm">
                <AvatarImage src={profile.avatar_url} alt={profile.nombre_completo || "Avatar"} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingAvatar ? "Subiendo..." : "Cambiar Foto"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG o GIF. Máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Información Personal ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Datos básicos de identificación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lock banner when cedula verified */}
          {isCedulaLocked && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 text-sm">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                <strong>Nombre y cédula bloqueados</strong> — verificados con el CNE
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre Completo
                {isCedulaLocked && <Lock className="inline h-3 w-3 ml-1 text-amber-500" />}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  className={`pl-10 ${isCedulaLocked ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                  value={profile.nombre_completo || ""}
                  onChange={(e) =>
                    !isCedulaLocked && setProfile({ ...profile, nombre_completo: e.target.value })
                  }
                  readOnly={isCedulaLocked}
                  placeholder="Tu nombre completo"
                />
              </div>
              {cedulaStatus === "success" && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Nombre confirmado por el CNE
                </p>
              )}
            </div>

            {/* Cédula */}
            <div className="space-y-2">
              <Label htmlFor="cedula">
                Cédula de Identidad
                {isCedulaLocked && <Lock className="inline h-3 w-3 ml-1 text-amber-500" />}
              </Label>

              {isCedulaLocked ? (
                /* Locked view */
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted text-muted-foreground text-sm cursor-not-allowed">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span>{profile.cedula || "—"}</span>
                  {profile.cedula_verificada && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verificada
                    </span>
                  )}
                </div>
              ) : (
                /* Editable view with CNE validation */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={nacionalidad}
                      onChange={(e) => {
                        setNacionalidad(e.target.value as "V" | "E");
                        setCedulaStatus("idle");
                        setCedulaError("");
                      }}
                      className="h-10 w-16 px-2 border border-input rounded-md bg-background text-foreground text-center font-semibold focus:outline-none focus:ring-2 focus:ring-ring/50 text-sm"
                      aria-label="Nacionalidad"
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </select>

                    <div className="relative flex-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cedula"
                        type="text"
                        inputMode="numeric"
                        placeholder="12345678"
                        value={numeroCedula}
                        maxLength={8}
                        className={`pl-10 pr-10 ${
                          cedulaStatus === "error"
                            ? "border-destructive focus-visible:ring-destructive/30"
                            : cedulaStatus === "success"
                              ? "border-green-500 focus-visible:ring-green-500/30"
                              : ""
                        }`}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setNumeroCedula(digits);
                          setProfile({
                            ...profile,
                            cedula: digits ? `${nacionalidad}-${digits}` : "",
                          });
                          setCedulaStatus("idle");
                          setCedulaError("");
                        }}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        {cedulaStatus === "validating" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {cedulaStatus === "error" && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        {cedulaStatus === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hint / error / success text */}
                  {cedulaStatus === "idle" && (
                    <p className="text-xs text-muted-foreground">
                      Ingrese su cédula y presione “Confirmar con CNE” para validar
                    </p>
                  )}
                  {cedulaStatus === "error" && cedulaError && (
                    <p className="text-xs text-destructive">{cedulaError}</p>
                  )}
                  {cedulaStatus === "success" && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Cédula validada con el CNE
                    </p>
                  )}

                  {/* Validate button as fallback */}
                  {cedulaStatus !== "success" && numeroCedula.length >= 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCedulaValidation}
                      disabled={cedulaStatus === "validating"}
                      className="mt-1 h-8 text-xs"
                    >
                      {cedulaStatus === "validating" ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Validando...</>
                      ) : (
                        <><ShieldCheck className="h-3 w-3 mr-1" /> Confirmar con CNE</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <DatePicker
                value={profile.fecha_nacimiento || ""}
                onChange={(value) => setProfile({ ...profile, fecha_nacimiento: value })}
                maxDate={todayIso}
              />
              <p className="text-xs text-muted-foreground">Selecciona la fecha desde el calendario (no se permiten fechas futuras).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contacto ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
          <CardDescription>Cómo podemos contactarte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email — shown as text (cannot be changed here) */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted text-foreground text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                El correo no puede cambiarse desde aquí
              </p>
            </div>

            {/* Phone — Venezuelan format only */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  type="tel"
                  inputMode="tel"
                  className={`pl-10 ${phoneError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={profile.telefono || ""}
                  onChange={(e) => {
                    const formatted = formatVenezuelanPhone(e.target.value);
                    setProfile({ ...profile, telefono: formatted });
                    setPhoneError("");
                  }}
                  onBlur={() => {
                    if (profile.telefono) {
                      const err = validateVenezuelanPhone(profile.telefono);
                      setPhoneError(err || "");
                    }
                  }}
                  placeholder="+58 412 123 4567"
                  maxLength={16}
                />
              </div>
              {phoneError ? (
                <p className="text-xs text-destructive">{phoneError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Formato venezolano: +58 xxx xxx xxxx
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Dirección ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección
          </CardTitle>
          <CardDescription>Tu dirección de residencia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Ubicación en mapa (opcional)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap((value) => !value)}
              className="h-8 text-xs gap-1"
            >
              <Map className="h-3.5 w-3.5" />
              {showMap ? "Ocultar mapa" : "Mostrar mapa"}
            </Button>
          </div>

          {showMap && (
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              height="320px"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="direccion"
                  className="pl-10"
                  value={profile.direccion || ""}
                  onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
                  placeholder="Av. Principal, Edificio, Piso, Apto..."
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <StateCitySelector
                selectedEstadoCode={selectedEstadoCode}
                selectedCiudad={profile.ciudad || ""}
                onEstadoChange={(estadoCode) => {
                  const estadoName = getEstadoName(estadoCode);
                  setSelectedEstadoCode(estadoCode);
                  setProfile({
                    ...profile,
                    estado: estadoName || profile.estado,
                    ciudad: "",
                    codigo_postal: "",
                  });
                }}
                onCiudadChange={async (ciudad) => {
                  const estadoName = getEstadoName(selectedEstadoCode);
                  const postalCode = await resolvePostalCodeByCity(estadoName, ciudad);
                  setProfile((prev) =>
                    prev
                      ? {
                          ...prev,
                          ciudad,
                          estado: estadoName || prev.estado,
                          codigo_postal: postalCode || prev.codigo_postal || "",
                        }
                      : prev
                  );
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <div className="relative">
                <Input
                  id="codigo_postal"
                  value={profile.codigo_postal || ""}
                  onChange={(e) => setProfile({ ...profile, codigo_postal: e.target.value })}
                  placeholder="Ej: 1060"
                />
                {isPostalLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Se autocompleta al elegir ciudad. Puedes editarlo manualmente si necesitas ajustar un sector específico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Guardar ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
