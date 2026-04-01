"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  AvatarUpload,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@red-salud/design-system";
import { Loader2, Save, Lock, CheckCircle } from "lucide-react";

import type { Profile } from "@/hooks/paciente/useSettings";

interface TabPersonalDataProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  saving: boolean;
  onSave: () => void;
}

const GENDER_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
  { value: "prefiero_no_decir", label: "Prefiero no decir" },
];

export function TabPersonalData({
  profile,
  setProfile,
  saving,
  onSave,
}: TabPersonalDataProps) {
  if (!profile) return null;

  const isNameLocked = !!profile.national_id_verified;
  const isCedulaLocked = !!profile.national_id_verified;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>Tu imagen visible para doctores y la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AvatarUpload
            currentUrl={profile.avatar_url}
            userName={profile.full_name || "Paciente"}
            size="xl"
            onUpload={(url) => setProfile({ ...profile, avatar_url: url })}
          />
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion personal</CardTitle>
          <CardDescription>
            Los campos marcados con * son obligatorios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre completo *
                {isNameLocked && <Lock className="inline h-3.5 w-3.5 ml-1 text-amber-500" />}
              </Label>
              <Input
                id="nombre"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Tu nombre completo"
                disabled={isNameLocked}
                className={isNameLocked ? "bg-[hsl(var(--muted))]" : ""}
              />
            </div>

            {/* Cedula */}
            <div className="space-y-2">
              <Label htmlFor="cedula">
                Cedula *
                {isCedulaLocked && <Lock className="inline h-3.5 w-3.5 ml-1 text-amber-500" />}
              </Label>
              <div className="relative">
                <Input
                  id="cedula"
                  value={profile.national_id || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, national_id: e.target.value })
                  }
                  placeholder="V-12345678"
                  disabled={isCedulaLocked}
                  className={isCedulaLocked ? "bg-[hsl(var(--muted))] pr-28" : "pr-28"}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {profile.national_id_verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verificada
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => {/* placeholder for verification flow */}}
                    >
                      Verificar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha-nacimiento">Fecha de nacimiento *</Label>
              <Input
                id="fecha-nacimiento"
                type="date"
                value={profile.date_of_birth || ""}
                onChange={(e) =>
                  setProfile({ ...profile, date_of_birth: e.target.value })
                }
              />
            </div>

            {/* Genero */}
            <div className="space-y-2">
              <Label>Genero *</Label>
              <Select
                value={profile.gender || ""}
                onValueChange={(value) =>
                  setProfile({ ...profile, gender: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Telefono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">
                Telefono *
                {profile.phone_verified && (
                  <CheckCircle className="inline h-3.5 w-3.5 ml-1 text-emerald-500" />
                )}
              </Label>
              <Input
                id="telefono"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+58 412 1234567"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email *
                <Lock className="inline h-3.5 w-3.5 ml-1 text-[hsl(var(--muted-foreground))]" />
              </Label>
              <Input
                id="email"
                value={profile.email || ""}
                disabled
                className="bg-[hsl(var(--muted))]"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={profile.state || ""}
                onChange={(e) =>
                  setProfile({ ...profile, state: e.target.value })
                }
                placeholder="Ej: Caracas"
              />
            </div>

            {/* Municipio */}
            <div className="space-y-2">
              <Label htmlFor="municipio">Municipio</Label>
              <Input
                id="municipio"
                value={profile.municipality || ""}
                onChange={(e) =>
                  setProfile({ ...profile, municipality: e.target.value })
                }
                placeholder="Ej: Libertador"
              />
            </div>

            {/* Parroquia */}
            <div className="space-y-2">
              <Label htmlFor="parroquia">Parroquia</Label>
              <Input
                id="parroquia"
                value={profile.parish || ""}
                onChange={(e) =>
                  setProfile({ ...profile, parish: e.target.value })
                }
                placeholder="Ej: San Juan"
              />
            </div>

            {/* Direccion */}
            <div className="space-y-2">
              <Label htmlFor="direccion">Direccion</Label>
              <Input
                id="direccion"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                placeholder="Calle, edificio, apto..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
