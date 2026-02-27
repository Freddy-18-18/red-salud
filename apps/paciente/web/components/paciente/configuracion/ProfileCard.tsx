import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Button,
} from "@red-salud/design-system";
import { Loader2, Save } from "lucide-react";
import { Profile } from "@/hooks/paciente/useConfiguracion";

interface ProfileCardProps {
    profile: Profile | null;
    setProfile: (profile: Profile) => void;
    saving: boolean;
    onSave: () => void;
}

export function ProfileCard({
    profile,
    setProfile,
    saving,
    onSave,
}: ProfileCardProps) {
    if (!profile) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                    Actualiza tu información personal y de contacto
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input
                            id="nombre"
                            value={profile.nombre_completo || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, nombre_completo: e.target.value })
                            }
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={profile.email || ""}
                            disabled
                            className="bg-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                            id="telefono"
                            value={profile.telefono || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, telefono: e.target.value })
                            }
                            placeholder="+57 300 123 4567"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula</Label>
                        <Input
                            id="cedula"
                            value={profile.cedula || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, cedula: e.target.value })
                            }
                            placeholder="1234567890"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                            id="direccion"
                            value={profile.direccion || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, direccion: e.target.value })
                            }
                            placeholder="Tu dirección"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad</Label>
                        <Input
                            id="ciudad"
                            value={profile.ciudad || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, ciudad: e.target.value })
                            }
                            placeholder="Ciudad"
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
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
