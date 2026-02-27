"use client";

import Link from "next/link";
import type { Role } from "./how-it-works-data";

interface RoleCardProps {
    role: Role;
    isSelected: boolean;
    onHover: () => void;
    onLeave: () => void;
}

export function RoleCard({ role, isSelected, onHover, onLeave }: RoleCardProps) {
    const Icon = role.icon;

    return (
        <Link
            href={role.href}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="group"
        >
            <div className={`
                relative p-6 rounded-2xl border transition-all duration-300 h-full
                ${isSelected
                    ? 'bg-gradient-to-br ' + role.color + ' border-transparent shadow-2xl scale-105'
                    : 'bg-card border-border hover:border-primary/50 hover-lift'
                }
            `}>
                <div className={`flex flex-col items-center gap-3 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                    <div className={`p-3 rounded-xl transition-all duration-300 ${isSelected
                            ? 'bg-white/20'
                            : 'bg-gradient-to-br ' + role.color + ' text-white'
                        }`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-sm mb-1">{role.name}</div>
                        <div className={`text-xs transition-opacity duration-300 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {role.description}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
