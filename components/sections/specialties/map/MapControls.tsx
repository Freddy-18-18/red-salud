import { RotateCw, ZoomIn, ZoomOut, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MapControlsProps {
    onReset: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    showZoom?: boolean;
}

export function MapControls({ onReset, onZoomIn, onZoomOut, showZoom = false }: MapControlsProps) {
    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                            onClick={onReset}
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Restablecer vista</p>
                    </TooltipContent>
                </Tooltip>

                {showZoom && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                                    onClick={onZoomIn}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Acercar</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                                    onClick={onZoomOut}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Alejar</p>
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}
            </TooltipProvider>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg mt-4">
                <p className="text-[10px] text-white/50 mb-1 font-medium uppercase tracking-wider">Densidad</p>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-white/70">Alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-[10px] text-white/70">Media</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] text-white/70">Baja</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                        <span className="text-[10px] text-white/70">Sin datos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
