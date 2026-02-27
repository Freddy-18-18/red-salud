"use client";

import { Card } from "@red-salud/design-system";
import { Smile, Info } from "lucide-react";

export function OdontogramWidget() {
    return (
        <Card className="p-6 h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                    <Smile className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Odontograma Digital</h3>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    V1
                </div>
            </div>

            <div className="flex-1 border-2 border-dashed border-muted rounded-xl bg-muted/5 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smile className="w-12 h-12 text-primary opacity-50" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">Visualizador de Odontograma</p>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                        Selecciona un paciente para visualizar su estado dental, caries y tratamientos realizados.
                    </p>
                </div>
                <button className="text-xs font-bold text-primary hover:underline underline-offset-4">
                    Cargar plantilla predeterminada
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Caries
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Obturación
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Tratado
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Prótesis
                </div>
            </div>
        </Card>
    );
}
