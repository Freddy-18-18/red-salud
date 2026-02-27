"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, BookOpen, Activity, Award } from "lucide-react";
import CountUp from "react-countup";

interface AcademyStatsProps {
    stats: {
        students: number;
        courses: number;
        specialties: number;
        satisfaction: number;
    }
}

export function AcademyStats({ stats }: AcademyStatsProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const STATS = [
        {
            label: 'Estudiantes',
            value: stats.students,
            suffix: stats.students > 1000 ? '+' : '',
            icon: Users,
            color: "text-blue-400"
        },
        {
            label: 'Cursos Activos',
            value: stats.courses,
            suffix: stats.courses > 1000 ? '+' : '',
            icon: BookOpen,
            color: "text-emerald-400"
        },
        {
            label: 'Especialidades',
            value: stats.specialties,
            suffix: '+',
            icon: Activity,
            color: "text-purple-400"
        },
        {
            label: 'Satisfacción',
            value: stats.satisfaction,
            suffix: '%',
            icon: Award,
            color: "text-amber-400"
        },
    ];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-md ml-auto"
        >
            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                {STATS.map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center text-center group">
                        <div className={`mb-3 p-2 rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>

                        <div className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg tabular-nums mb-1">
                            {isInView ? (
                                <CountUp
                                    start={0}
                                    end={stat.value}
                                    duration={2.5}
                                    separator=","
                                    suffix={stat.suffix}
                                />
                            ) : (
                                <span>0</span>
                            )}
                        </div>

                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
