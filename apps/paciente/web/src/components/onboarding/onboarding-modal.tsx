"use client";

import {
  ChevronDown,
  Upload,
  X,
  Loader2,
  User,
  MapPin,
  Camera,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { StepIndicator } from "./onboarding-steps";

import { VENEZUELA_STATES, getCitiesForState } from "@/lib/data/venezuela";
import { supabase } from "@/lib/supabase/client";


interface OnboardingModalProps {
  onComplete: () => void;
}

interface ProfileData {
  full_name: string;
  date_of_birth: string;
  genero: string;
  state: string;
  city: string;
  phone: string;
  avatar_url: string;
}

const STEP_LABELS = ["Datos", "Ubicacion", "Foto"];
const STEP_ICONS = [User, MapPin, Camera];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    date_of_birth: "",
    genero: "",
    state: "",
    city: "",
    phone: "",
    avatar_url: "",
  });

  const cities = useMemo(
    () => getCitiesForState(profileData.state),
    [profileData.state]
  );

  // Load existing profile data on mount to resume progress
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "full_name, date_of_birth, state, city, phone, avatar_url"
          )
          .eq("id", user.id)
          .single();

        if (profile) {
          setProfileData({
            full_name: profile.full_name ?? "",
            date_of_birth: profile.date_of_birth ?? "",
            genero: "",
            state: profile.state ?? "",
            city: profile.city ?? "",
            phone: profile.phone ?? "",
            avatar_url: profile.avatar_url ?? "",
          });
          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
          // Resume at the right step based on existing data
          if (profile.full_name && profile.state) {
            setStep(3);
          } else if (profile.full_name) {
            setStep(2);
          }
        }
      } catch {
        // Proceed with empty form
      } finally {
        setInitialLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateField = useCallback(
    (field: keyof ProfileData, value: string) => {
      setProfileData((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "state") {
          next.city = "";
        }
        return next;
      });
      setError(null);
    },
    []
  );

  const saveStep = useCallback(
    async (fields: Partial<ProfileData>) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sesion expirada. Recarga la pagina.");
          return false;
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        for (const [key, value] of Object.entries(fields)) {
          updateData[key] = value || null;
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          setError("Error al guardar. Intenta de nuevo.");
          return false;
        }
        return true;
      } catch {
        setError("Error inesperado. Intenta de nuevo.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleNextStep1 = async () => {
    if (!profileData.full_name.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    const success = await saveStep({
      full_name: profileData.full_name.trim(),
      date_of_birth: profileData.date_of_birth,
    });
    if (success) setStep(2);
  };

  const handleNextStep2 = async () => {
    const fields: Partial<ProfileData> = {};
    if (profileData.state) fields.state = profileData.state;
    if (profileData.city) fields.city = profileData.city;
    if (profileData.phone) fields.phone = profileData.phone;

    if (Object.keys(fields).length === 0) {
      // Nothing to save, just advance
      setStep(3);
      return;
    }

    const success = await saveStep(fields);
    if (success) setStep(3);
  };

  const handleAvatarSelect = (file: File) => {
    // Validate file type and size (5MB max)
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar los 5MB.");
      return;
    }
    setAvatarFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAvatarSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFinish = async () => {
    if (avatarFile) {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sesion expirada. Recarga la pagina.");
          return;
        }

        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `avatars/${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          setError("Error al subir la imagen. Intenta de nuevo.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        await saveStep({ avatar_url: publicUrl });
      } catch {
        setError("Error al subir la imagen. Intenta de nuevo.");
        return;
      } finally {
        setLoading(false);
      }
    }
    onComplete();
  };

  const handleSkip = () => {
    if (step < 3) {
      setStep(step + 1);
      setError(null);
    } else {
      onComplete();
    }
  };

  const inputClasses =
    "w-full px-4 py-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";

  const selectClasses =
    "w-full px-4 py-3 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none";

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-[hsl(var(--card))] rounded-2xl p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
        </div>
      </div>
    );
  }

  const StepIcon = STEP_ICONS[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[hsl(var(--card))] rounded-2xl shadow-xl border border-[hsl(var(--border))] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] p-6 pb-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <StepIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                  Completa tu perfil
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Paso {step} de 3 — {STEP_LABELS[step - 1]}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
              title="Omitir"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <StepIndicator
            currentStep={step}
            totalSteps={3}
            labels={STEP_LABELS}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Nombre completo *
                </label>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    updateField("full_name", e.target.value)
                  }
                  className={inputClasses}
                  placeholder="Maria Garcia"
                />
              </div>

              <div>
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Fecha de nacimiento{" "}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  id="date_of_birth"
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) =>
                    updateField("date_of_birth", e.target.value)
                  }
                  className={inputClasses}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label
                  htmlFor="genero"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Genero{" "}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="genero"
                    value={profileData.genero}
                    onChange={(e) => updateField("genero", e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Selecciona tu genero</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero_no_decir">
                      Prefiero no decir
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Estado{" "}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={profileData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Selecciona un estado</option>
                    {VENEZUELA_STATES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Ciudad{" "}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="city"
                    value={profileData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={selectClasses}
                    disabled={!profileData.state}
                  >
                    <option value="">
                      {profileData.state
                        ? "Selecciona una ciudad"
                        : "Primero selecciona un estado"}
                    </option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5"
                >
                  Telefono{" "}
                  <span className="text-[hsl(var(--muted-foreground))] font-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={profileData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClasses}
                  placeholder="+58 412 123 4567"
                />
              </div>
            </div>
          )}

          {/* Step 3: Avatar */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Sube una foto de perfil para que tus doctores te reconozcan.
                Este paso es completamente opcional.
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-[hsl(var(--border))] hover:border-emerald-400 hover:bg-[hsl(var(--muted))]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarSelect(file);
                  }}
                />

                {avatarPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-200 dark:border-emerald-800">
                      <img
                        src={avatarPreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Haz clic para cambiar la imagen
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                      <Upload className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        Arrastra tu foto aqui
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        o haz clic para seleccionar. Max 5MB.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(
                      profileData.avatar_url || null
                    );
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Quitar imagen seleccionada
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] p-6 pt-4 rounded-b-2xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
              Omitir
            </button>

            <button
              type="button"
              onClick={
                step === 1
                  ? handleNextStep1
                  : step === 2
                    ? handleNextStep2
                    : handleFinish
              }
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : step === 3 ? (
                "Finalizar"
              ) : (
                "Siguiente"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
