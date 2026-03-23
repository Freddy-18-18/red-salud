import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    Switch,
    Button,
} from "@red-salud/design-system";
import { Loader2, Save } from "lucide-react";
import { UserPreferences } from "@/hooks/paciente/useConfiguracion";

interface PreferencesCardProps {
    preferences: UserPreferences | null;
    setPreferences: (preferences: UserPreferences) => void;
    saving: boolean;
    onSave: () => void;
}

export function PreferencesCard({
    preferences,
    setPreferences,
    saving,
    onSave,
}: PreferencesCardProps) {
    if (!preferences) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferencias de Usuario</CardTitle>
                <CardDescription>
                    Personaliza tu experiencia en la plataforma
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Modo Oscuro</Label>
                        <p className="text-sm text-gray-500">
                            Activar el tema oscuro en la interfaz
                        </p>
                    </div>
                    <Switch
                        checked={preferences.dark_mode}
                        onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, dark_mode: checked })
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Notificaciones de Escritorio</Label>
                        <p className="text-sm text-gray-500">
                            Recibir alertas en tu navegador
                        </p>
                    </div>
                    <Switch
                        checked={preferences.desktop_notifications}
                        onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, desktop_notifications: checked })
                        }
                    />
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
