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
import { PrivacySettings } from "@/hooks/paciente/useConfiguracion";

interface PrivacyCardProps {
    privacy: PrivacySettings | null;
    setPrivacy: (privacy: PrivacySettings) => void;
    saving: boolean;
    onSave: () => void;
}

export function PrivacyCard({
    privacy,
    setPrivacy,
    saving,
    onSave,
}: PrivacyCardProps) {
    if (!privacy) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacidad y Seguridad</CardTitle>
                <CardDescription>
                    Controla quién puede ver tu información
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Perfil Público</Label>
                        <p className="text-sm text-gray-500">
                            Permitir que otros usuarios vean tu perfil básico
                        </p>
                    </div>
                    <Switch
                        checked={privacy.profile_public}
                        onCheckedChange={(checked) =>
                            setPrivacy({ ...privacy, profile_public: checked })
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Compartir Historial Médico</Label>
                        <p className="text-sm text-gray-500">
                            Permitir acceso a doctores autorizados
                        </p>
                    </div>
                    <Switch
                        checked={privacy.share_medical_history}
                        onCheckedChange={(checked) =>
                            setPrivacy({ ...privacy, share_medical_history: checked })
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
