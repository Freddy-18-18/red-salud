"use client";

import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Phone, User, MapPinned } from "lucide-react";

interface OfficeInstructionsProps {
    instructions?: string;
    receptionInfo: {
        receptionist_name?: string;
        whatsapp?: string;
    } | undefined;
    onChange: (instructions: string, receptionInfo: any) => void;
}

export function OfficeInstructions({ instructions = "", receptionInfo = {}, onChange }: OfficeInstructionsProps) {

    const handleReceptionChange = (field: string, val: string) => {
        onChange(instructions, {
            ...receptionInfo,
            [field]: val
        });
    };

    const handleInstructionsChange = (val: string) => {
        onChange(val, receptionInfo);
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Instrucciones y Recepción
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Facilita la llegada de tus pacientes con indicaciones claras y contacto directo.
                </p>
            </div>

            {/* Instrucciones de Llegada */}
            <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                    <MapPinned className="h-3.5 w-3.5 text-blue-500" />
                    ¿Cómo llegar a la puerta del consultorio?
                </Label>
                <textarea
                    value={instructions}
                    onChange={(e) => handleInstructionsChange(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Ej: Estacionar en el sótano 2 (puestos azules). Subir a la Torre B, Piso 5. Al salir del ascensor, mano derecha, Puerta 502."
                />
                <p className="text-[10px] text-gray-400 mt-1">
                    Sé lo más específico posible para evitar que el paciente se pierda.
                </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Contacto de Recepción / Secretaria (Opcional)
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Nombre de Recepcionista</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                value={receptionInfo.receptionist_name || ""}
                                onChange={(e) => handleReceptionChange("receptionist_name", e.target.value)}
                                className="pl-8 h-9 text-sm"
                                placeholder="María Pérez"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">WhatsApp de Citas (Sede)</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                type="tel"
                                value={receptionInfo.whatsapp || ""}
                                onChange={(e) => handleReceptionChange("whatsapp", e.target.value)}
                                className="pl-8 h-9 text-sm"
                                placeholder="+58 412 0000000"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
