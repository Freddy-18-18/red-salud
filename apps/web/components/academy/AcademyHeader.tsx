
"use client";

import Link from "next/link";
import { GraduationCap, Flame, Star, ChevronLeft } from "lucide-react";
import { Button } from "@red-salud/ui";

interface AcademyHeaderProps {
    courseName: string;
    streak?: number;
    totalXp?: number;
}

export function AcademyHeader({
    courseName,
    streak = 0,
    totalXp = 0
}: AcademyHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-16">
            <div className="container mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/academy/cursos">
                        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="font-bold text-white hidden md:block">
                            {courseName}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Streaks */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <Flame className="w-4 h-4 fill-orange-500/20" />
                        <span className="font-bold text-sm">{streak}</span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-500/20" />
                        <span className="font-bold text-sm">{totalXp} XP</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
