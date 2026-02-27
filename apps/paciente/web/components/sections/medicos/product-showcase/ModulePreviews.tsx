"use client";

import { Video, FileText, Check } from "lucide-react";

// Preview componentes individuales para cada módulo

export function AgendaPreview() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">MG</div>
                    <div>
                        <div className="font-medium">María García</div>
                        <div className="text-xs text-muted-foreground">Consulta General</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm">09:00</div>
                    <div className="text-xs text-blue-500">Confirmada</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">CP</div>
                    <div>
                        <div className="font-medium">Carlos Pérez</div>
                        <div className="text-xs text-muted-foreground">Seguimiento</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm">10:30</div>
                    <div className="text-xs text-emerald-500">Pendiente</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">AM</div>
                    <div>
                        <div className="font-medium">Ana Martínez</div>
                        <div className="text-xs text-muted-foreground">Telemedicina</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-sm">11:00</div>
                    <div className="text-xs text-violet-500 flex items-center gap-1">
                        <Video className="h-3 w-3" /> Video
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PacientesPreview() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">MG</div>
                <div className="flex-1">
                    <div className="font-semibold">María García Rodríguez</div>
                    <div className="text-sm text-muted-foreground">45 años • Femenino</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500">Hipertensión</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500">Diabetes T2</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-emerald-500">24</div>
                    <div className="text-xs text-muted-foreground">Consultas</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-blue-500">3</div>
                    <div className="text-xs text-muted-foreground">Años</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-violet-500">12</div>
                    <div className="text-xs text-muted-foreground">Recetas</div>
                </div>
            </div>
        </div>
    );
}

export function TelemedicinaPreview() {
    return (
        <div className="relative aspect-video rounded-xl bg-gradient-to-br from-violet-900 to-violet-950 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center mb-3 animate-pulse">
                    <Video className="h-10 w-10 text-violet-300" />
                </div>
                <div className="text-sm text-violet-200">Videoconsulta en curso</div>
                <div className="text-xs text-violet-400 mt-1">HD • Encriptado</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-12 rounded-lg bg-violet-800/80 border border-violet-500/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center">
                    <span className="text-xs text-violet-200">Tú</span>
                </div>
            </div>
        </div>
    );
}

export function RecetasPreview() {
    return (
        <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">Receta Médica</span>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Firmada
                </span>
            </div>
            <div className="text-sm space-y-2 text-muted-foreground">
                <div className="p-2 rounded bg-muted/50">
                    <div className="font-medium text-foreground">Losartán 50mg</div>
                    <div className="text-xs">1 tableta cada 12 horas - 30 días</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                    <div className="font-medium text-foreground">Metformina 850mg</div>
                    <div className="text-xs">1 tableta con desayuno - 30 días</div>
                </div>
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dr. Juan Pérez</span>
                <span className="text-amber-500">SACS #12345</span>
            </div>
        </div>
    );
}

export function LaboratorioPreview() {
    return (
        <div className="space-y-3">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Perfil Lipídico</span>
                    <span className="text-xs text-cyan-500">Pendiente</span>
                </div>
                <div className="text-xs text-muted-foreground">Colesterol, Triglicéridos, HDL, LDL</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Hemograma Completo</span>
                    <span className="text-xs text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3" /> Listo</span>
                </div>
                <div className="text-xs text-muted-foreground">Resultados normales</div>
            </div>
        </div>
    );
}

export function EstadisticasPreview() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">$4,280</div>
                    <div className="text-xs text-muted-foreground">Este mes</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-emerald-500">+23%</div>
                    <div className="text-xs text-muted-foreground">vs. anterior</div>
                </div>
            </div>
            <div className="h-24 flex items-end gap-1 px-2">
                {[40, 55, 35, 70, 45, 80, 65, 90, 75, 85, 60, 95].map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-pink-500/50 to-rose-500/80 transition-all hover:from-pink-500/70 hover:to-rose-500"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

// Mapa de previews por ID de módulo
export const modulePreviewsMap: Record<string, React.ComponentType> = {
    agenda: AgendaPreview,
    pacientes: PacientesPreview,
    telemedicina: TelemedicinaPreview,
    recetas: RecetasPreview,
    laboratorio: LaboratorioPreview,
    estadisticas: EstadisticasPreview,
};
