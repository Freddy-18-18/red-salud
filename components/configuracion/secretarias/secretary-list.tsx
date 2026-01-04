"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, Settings as SettingsIcon, UserPlus } from "lucide-react";
import { Secretary } from "./types";

interface SecretaryListProps {
    secretaries: Secretary[];
    onInvite: () => void;
    onEditPermissions: (secretary: Secretary) => void;
    onDelete: (secretaryId: string) => void;
}

export function SecretaryList({
    secretaries,
    onInvite,
    onEditPermissions,
    onDelete,
}: SecretaryListProps) {
    if (secretaries.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No tienes secretarias registradas
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Invita a tu secretaria para que pueda ayudarte a gestionar tu agenda
                        </p>
                        <Button onClick={onInvite}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invitar Primera Secretaria
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {secretaries.map((secretary) => (
                <Card key={secretary.id}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{secretary.secretary_name}</h3>
                                    <Badge variant={secretary.status === "active" ? "default" : "secondary"}>
                                        {secretary.status === "active" ? "Activa" : "Inactiva"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    <Mail className="h-4 w-4 inline mr-1" />
                                    {secretary.secretary_email}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {secretary.permissions.can_view_agenda && (
                                        <Badge variant="outline">Ver Agenda</Badge>
                                    )}
                                    {secretary.permissions.can_create_appointments && (
                                        <Badge variant="outline">Crear Citas</Badge>
                                    )}
                                    {secretary.permissions.can_view_patients && (
                                        <Badge variant="outline">Ver Pacientes</Badge>
                                    )}
                                    {secretary.permissions.can_register_patients && (
                                        <Badge variant="outline">Registrar Pacientes</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditPermissions(secretary)}
                                >
                                    <SettingsIcon className="h-4 w-4 mr-1" />
                                    Permisos
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(secretary.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
