import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Construction,
    ArrowLeft,
    ShieldAlert,
    Clock,
    Zap,
    ChevronRight
} from 'lucide-react';

const RolePlaceholder: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const premiumEasing = [0.16, 1, 0.3, 1];

    const formattedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Módulo';

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl">
                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: premiumEasing }}
                    className="bg-slate-900/40 backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl"
                >
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />

                    <div className="relative z-10 space-y-10">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                            }}
                            className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4"
                        >
                            <Construction className="h-12 w-12" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">Desposito de Desarrollo v2.4</span>
                            </motion.div>

                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                                {formattedRole} <span className="text-amber-500 not-italic">PENDIENTE</span>
                            </h2>

                            <p className="text-slate-500 font-bold text-sm md:text-base tracking-wide max-w-xl mx-auto uppercase leading-relaxed">
                                Este nodo del sistema está actualmente en fase de despliegue táctico. La integración de datos para <span className="text-white italic">{formattedRole}</span> se activará en la próxima actualización de núcleo.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            {[
                                { icon: Clock, label: 'Lanzamiento', value: 'Q1 2026' },
                                { icon: ShieldAlert, label: 'Seguridad', value: 'Nivel 4' },
                                { icon: Zap, label: 'Prioridad', value: 'ALTA' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="bg-slate-950/40 border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center gap-2"
                                >
                                    <stat.icon className="h-5 w-5 text-slate-600" />
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-sm font-black text-white italic tracking-tighter">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/roles')}
                                className="px-10 py-5 bg-slate-950/60 border border-white/[0.05] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center gap-3 w-full md:w-auto"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al Hub
                            </button>
                            <button
                                className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 w-full md:w-auto group"
                            >
                                Notificar Disponibilidad
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Industrial Progress Bar Design */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 via-amber-500 to-transparent relative"
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RolePlaceholder;
