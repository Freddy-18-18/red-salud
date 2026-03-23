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
import { NotificationSettings } from "@/hooks/paciente/useConfiguracion";

interface NotificationsCardProps {
    notifications: NotificationSettings | null;
    setNotifications: (notifications: NotificationSettings) => void;
    saving: boolean;
    onSave: () => void;
}

export function NotificationsCard({
    notifications,
    setNotifications,
    saving,
    onSave,
}: NotificationsCardProps) {
    if (!notifications) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Notificaciones</CardTitle>
                <CardDescription>Elige qué alertas deseas recibir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Recordatorios de Citas</Label>
                        <p className="text-sm text-gray-500">
                            Recibir avisos antes de tus citas médicas
                        </p>
                    </div>
                    <Switch
                        checked={notifications.appointment_reminders}
                        onCheckedChange={(checked) =>
                            setNotifications({
                                ...notifications,
                                appointment_reminders: checked,
                            })
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Resultados de Laboratorio</Label>
                        <p className="text-sm text-gray-500">
                            Notificar cuando estén listos los resultados
                        </p>
                    </div>
                    <Switch
                        checked={notifications.lab_results}
                        onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, lab_results: checked })
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
