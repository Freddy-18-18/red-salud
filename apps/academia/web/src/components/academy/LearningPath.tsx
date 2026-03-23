"use client";

import { motion } from "framer-motion";
import { Check, Lock, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@red-salud/core/utils";
import { Course, Module, LessonNode } from "@/types/academy";

interface LearningPathProps {
    course: Course;
}

export function LearningPath({ course }: LearningPathProps) {
    return (
        <div className="max-w-md mx-auto py-20 px-4 space-y-12 pb-32">
            {course.modules.map((module, index) => (
                <ModuleSection key={module.id} module={module} index={index} />
            ))}
        </div>
    );
}

function ModuleSection({ module }: { module: Module; index: number }) {
    return (
        <div className="relative">
            {/* Module Header */}
            <div className={`mb-8 p-4 rounded-2xl border bg-gradient-to-br ${getThemeColors(module.color)}`}>
                <h3 className="text-lg font-bold text-white mb-1">
                    Unidad {module.order}: {module.title}
                </h3>
                <p className="text-sm text-white/70">
                    {module.description}
                </p>
            </div>

            {/* Path Nodes */}
            <div className="relative space-y-8">
                {module.nodes.map((node, i) => (
                    <LessonNodeItem
                        key={node.id}
                        node={node}
                        color={module.color}
                        isLast={i === module.nodes.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}

function LessonNodeItem({
    node,
    color,
}: {
    node: LessonNode;
    color: string;
    isLast: boolean;
}) {
    // Calculate horizontal offset based on node.position.x (approximate for now)
    // We map 0-100 to -left to +right deviation
    // -2 is left, 0 is center, 2 is right
    const horizontalOffset = (node.position.x - 50) * 2;

    return (
        <div
            className="relative flex justify-center z-10"
            style={{
                transform: `translateX(${horizontalOffset}px)`
            }}
        >
            <Link href={node.status !== 'locked' ? `/academy/lesson/${node.contentId}` : '#'}>
                <motion.div
                    whileHover={node.status !== 'locked' ? { scale: 1.1 } : {}}
                    whileTap={node.status !== 'locked' ? { scale: 0.95 } : {}}
                    className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center border-b-8 transition-all relative group",
                        getNodeStyles(node.status, color)
                    )}
                >
                    {/* Icon Content */}
                    <div className="relative z-10">
                        {node.status === 'completed' && <Check className="w-8 h-8 stroke-[4]" />}
                        {node.status === 'active' && <Play className="w-8 h-8 fill-current ml-1" />}
                        {node.status === 'locked' && <Lock className="w-6 h-6 opacity-50" />}
                    </div>

                    {/* Active Pulse Effect */}
                    {node.status === 'active' && (
                        <div className="absolute inset-0 rounded-[2rem] bg-white/20 animate-ping" />
                    )}

                    {/* Popover/Tooltip on Hover */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-xs font-bold py-2 px-3 rounded-xl -top-12 whitespace-nowrap shadow-xl pointer-events-none transform -translate-y-2 group-hover:translate-y-0 duration-200">
                        {node.title}
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                    </div>
                </motion.div>
            </Link>
        </div>
    );
}

// Helper to get color styles
const maps: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20',
    default: 'from-slate-800 to-slate-900 border-slate-800'
};

const activeMaps: Record<string, string> = {
    emerald: 'bg-emerald-500 border-emerald-700 text-white shadow-emerald-500/40',
    blue: 'bg-blue-500 border-blue-700 text-white shadow-blue-500/40',
    rose: 'bg-rose-500 border-rose-700 text-white shadow-rose-500/40',
    default: 'bg-slate-200 border-slate-400 text-slate-900'
};

function getThemeColors(color: string) {
    return maps[color] || maps.default;
}

function getNodeStyles(status: string, color: string) {
    if (status === 'locked') {
        return "bg-slate-800 border-slate-900 text-slate-600 grayscale cursor-not-allowed";
    }

    if (status === 'completed') {
        return "bg-amber-500 border-amber-700 text-white shadow-lg shadow-amber-500/20";
    }

    return activeMaps[color] || activeMaps.default;
}
