import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateGeoData } from "./venezuela-states.data";

export interface StateViewProps {
    state: StateGeoData;
    doctorCount: number;
    onBack: () => void;
}

export function StateView({ state, doctorCount, onBack }: StateViewProps) {
    // Simulamos datos de ciudades si no existen o para rellenar
    const cities = state.cities.length > 0 ? state.cities : [
        { name: "Capital del Estado", coordinates: [50, 50] as [number, number] },
        { name: "Zona Norte", coordinates: [50, 30] as [number, number] },
        { name: "Zona Sur", coordinates: [50, 70] as [number, number] },
    ];

    return (
        <div className="relative w-full h-full flex flex-col p-6 md:p-12 overflow-hidden">
            {/* Background del estado grande y difuminado */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <svg viewBox={state.viewBox || "0 0 800 600"} className="w-full h-full">
                    <path d={state.path} fill="currentColor" className="text-white" />
                </svg>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10 max-w-md"
            >
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-8 text-white hover:text-white hover:bg-white/10 pl-0 -ml-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al mapa nacional
                </Button>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                    {state.name}
                </h2>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-white font-medium">{doctorCount} Especialistas</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-medium">{cities.length} Ciudades</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">
                        Cobertura en el Estado
                    </h3>
                    <div className="grid gap-3">
                        {cities.map((city, idx) => (
                            <motion.div
                                key={city.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white/80 transition-colors">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{city.name}</p>
                                        <p className="text-xs text-white/50">Disponible</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-400 font-bold text-lg">
                                        {Math.floor(doctorCount / cities.length) + (idx % 2 === 0 ? 3 : -1)}
                                    </span>
                                    <p className="text-[10px] text-white/40 uppercase">Drs.</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
