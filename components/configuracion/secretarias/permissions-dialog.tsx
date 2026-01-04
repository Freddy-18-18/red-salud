"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Secretary } from "./types";

interface PermissionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    secretary: Secretary | null;
    onUpdate: () => Promise<void>;
    onTogglePermission: (key: keyof Secretary["permissions"]) => void;
    loading: boolean;
}

export function PermissionsDialog({
    open,
    onOpenChange,
    secretary,
    onUpdate,
    onTogglePermission,
    loading,
}: PermissionsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Configurar Permisos</DialogTitle>
                    <DialogDescription>
                        Define qué puede hacer {secretary?.secretary_name}
                    </DialogDescription>
                </DialogHeader>
                {secretary && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ver Agenda</Label>
                                <p className="text-xs text-gray-500">Puede ver el calendario de citas</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_view_agenda}
                                onCheckedChange={() => onTogglePermission("can_view_agenda")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Crear Citas</Label>
                                <p className="text-xs text-gray-500">Puede agendar nuevas citas</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_create_appointments}
                                onCheckedChange={() => onTogglePermission("can_create_appointments")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Editar Citas</Label>
                                <p className="text-xs text-gray-500">Puede modificar citas existentes</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_edit_appointments}
                                onCheckedChange={() => onTogglePermission("can_edit_appointments")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Cancelar Citas</Label>
                                <p className="text-xs text-gray-500">Puede cancelar citas</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_cancel_appointments}
                                onCheckedChange={() => onTogglePermission("can_cancel_appointments")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ver Pacientes</Label>
                                <p className="text-xs text-gray-500">Puede ver la lista de pacientes</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_view_patients}
                                onCheckedChange={() => onTogglePermission("can_view_patients")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Registrar Pacientes</Label>
                                <p className="text-xs text-gray-500">Puede registrar nuevos pacientes</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_register_patients}
                                onCheckedChange={() => onTogglePermission("can_register_patients")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ver Historial Clínico</Label>
                                <p className="text-xs text-gray-500 text-red-600">⚠️ Acceso a información médica sensible</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_view_medical_records}
                                onCheckedChange={() => onTogglePermission("can_view_medical_records")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Enviar Mensajes</Label>
                                <p className="text-xs text-gray-500">Puede enviar mensajes a pacientes</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_send_messages}
                                onCheckedChange={() => onTogglePermission("can_send_messages")}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ver Estadísticas</Label>
                                <p className="text-xs text-gray-500 text-red-600">⚠️ Incluye información financiera</p>
                            </div>
                            <Switch
                                checked={secretary.permissions.can_view_statistics}
                                onCheckedChange={() => onTogglePermission("can_view_statistics")}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onUpdate} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
