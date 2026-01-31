"use client";

import { motion } from "framer-motion";

export function SpacedRepetitionChart() {
    // Data points for the forgetting curve simulation
    // Path 1: Rapid decay (No review)
    const curve1 = "M 0 10 Q 50 150 280 180";

    // Path 2: First Review (Decay slows)
    const curve2 = "M 60 40 Q 120 120 280 150";

    // Path 3: Second Review (Retention stays high)
    const curve3 = "M 150 30 Q 200 60 280 80";

    return (
        <div className="relative w-full h-64 md:h-80 bg-slate-950/50 rounded-xl overflow-hidden border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] p-6">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative h-full flex flex-col justify-between z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-blue-500/30">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            RETENCIÓN DE MEMORIA
                        </span>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="relative flex-1 w-full mt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 200" preserveAspectRatio="none">
                        {/* Axes */}
                        <line x1="0" y1="0" x2="0" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <line x1="0" y1="200" x2="300" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

                        {/* Forgetting Curve (No Review) */}
                        <motion.path
                            d={curve1}
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            strokeDasharray="5 5"
                        />

                        {/* Review Points (Vertical Jumps) */}
                        <motion.line
                            x1="60" y1="180" x2="60" y2="40"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        />
                        <motion.circle cx="60" cy="40" r="4" fill="#60a5fa"
                            initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1 }}
                        />

                        {/* Curve after Review 1 */}
                        <motion.path
                            d={curve2}
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ delay: 1, duration: 1.5 }}
                        />

                        {/* Review Point 2 */}
                        <motion.line
                            x1="150" y1="140" x2="150" y2="30"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 2.5, duration: 0.5 }}
                        />
                        <motion.circle cx="150" cy="30" r="4" fill="#60a5fa"
                            initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 3 }}
                        />

                        {/* Curve after Review 2 (Optimal) */}
                        <motion.path
                            d={curve3}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ delay: 3, duration: 2 }}
                        />

                        {/* Area under curve (Gradient) */}
                        <defs>
                            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={`${curve3} L 280 200 L 150 200 Z`}
                            fill="url(#curveGradient)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 3.5, duration: 1 }}
                        />
                    </svg>

                    {/* Labels */}
                    <div className="absolute top-[20%] left-[22%] text-[10px] text-blue-200 bg-blue-900/50 px-2 py-0.5 rounded backdrop-blur-sm border border-blue-500/20">
                        1er Repaso
                    </div>
                    <div className="absolute top-[15%] left-[52%] text-[10px] text-blue-200 bg-blue-900/50 px-2 py-0.5 rounded backdrop-blur-sm border border-blue-500/20">
                        2do Repaso
                    </div>
                    <div className="absolute bottom-2 right-0 text-[10px] text-white/40">
                        Tiempo
                    </div>
                    <div className="absolute top-0 left-2 text-[10px] text-white/40">
                        Retención
                    </div>
                </div>
            </div>
        </div>
    );
}
