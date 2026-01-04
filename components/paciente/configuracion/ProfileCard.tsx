"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Save, User } from "lucide-react";
import type { Profile } from "@/hooks/paciente/useConfiguracion";

type Props = {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  saving: boolean;
  onSave: () => Promise<void>;
};

export function ProfileCard({ profile, setProfile, saving, onSave }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>Actualiza tu información básica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Cambiar Foto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={profile?.nombre_completo || ""}
              onChange={(e) => profile && setProfile({ ...profile, nombre_completo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              value={profile?.cedula || ""}
              onChange={(e) => profile && setProfile({ ...profile, cedula: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={profile?.telefono || ""}
              onChange={(e) => profile && setProfile({ ...profile, telefono: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={profile?.fecha_nacimiento || ""}
              onChange={(e) => profile && setProfile({ ...profile, fecha_nacimiento: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" value={profile?.ciudad || ""} onChange={(e) => profile && setProfile({ ...profile, ciudad: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" value={profile?.estado || ""} onChange={(e) => profile && setProfile({ ...profile, estado: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_postal">Código Postal</Label>
            <Input
              id="codigo_postal"
              value={profile?.codigo_postal || ""}
              onChange={(e) => profile && setProfile({ ...profile, codigo_postal: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea id="direccion" value={profile?.direccion || ""} onChange={(e) => profile && setProfile({ ...profile, direccion: e.target.value })} rows={3} />
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
              Guardar Cambios
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
