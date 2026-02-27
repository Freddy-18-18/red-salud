"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function ActiveRecallVisual() {

    // Memoize random values for animations to ensure purity
    const randomValues = useState(() => ({
        pulse: Array.from({ length: 8 }).map(() => ({
            duration: 2 + Math.random(),
            delay: Math.random() * 2
        })),
        nodes: Array.from({ length: 7 }).map(() => ({
            delay: Math.random() * 2
        }))
    }))[0];

    // Neural nodes positions
    const nodes = [
        { x: 50, y: 50 },
        { x: 80, y: 20 },
        { x: 20, y: 30 },
        { x: 70, y: 80 },
        { x: 30, y: 70 },
        { x: 50, y: 10 }, // Top
        { x: 90, y: 50 }, // Right
    ];

    // Connections between nodes (indices)
    const connections: [number, number][] = [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 5],
        [3, 6],
        [1, 6],
        [2, 4],
    ];

    return (
        <div className="relative w-full h-64 md:h-80 bg-slate-950/50 rounded-xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[300px] max-h-[300px]">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Connecting Lines */}
                        {connections.map(([start, end], i) => (
                            <motion.line
                                key={`line-${i}`}
                                x1={nodes[start]!.x}
                                y1={nodes[start]!.y}
                                x2={nodes[end]!.x}
                                y2={nodes[end]!.y}
                                stroke="rgba(6,182,212,0.2)"
                                strokeWidth="0.5"
                            />
                        ))}

                        {/* Active Pulses */}
                        {connections.map(([start, end], i) => (
                            <motion.path
                                key={`pulse-${i}`}
                                d={`M ${nodes[start]!.x} ${nodes[start]!.y} L ${nodes[end]!.x} ${nodes[end]!.y}`}
                                stroke="#22d3ee"
                                strokeWidth="1"
                                fill="transparent"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1],
                                    opacity: [0, 1, 0],
                                    pathOffset: [0, 1]
                                }}
                                transition={{
                                    duration: randomValues.pulse[i]?.duration || 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: randomValues.pulse[i]?.delay || 0
                                }}
                            />
                        ))}

                        {/* Nodes */}
                        {nodes.map((node, i) => (
                            <motion.circle
                                key={`node-${i}`}
                                cx={node.x}
                                cy={node.y}
                                r="2"
                                fill="#0ea5e9"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                    filter: ["drop-shadow(0 0 0px #0ea5e9)", "drop-shadow(0 0 5px #22d3ee)", "drop-shadow(0 0 0px #0ea5e9)"]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: randomValues.nodes[i]?.delay || 0,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </svg>

                    {/* Central Brain/Core Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                </div>
            </div>

            {/* Label */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-cyan-500/30">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    CONEXIÓN NEURONAL ACTIVA
                </span>
            </div>
        </div>
    );
}
