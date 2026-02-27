"use client";

import * as React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { DynamicIcon } from "./dynamic-icon";
import { cn } from "./lib/utils";

interface AppSwitcherProps {
    activeRole: string;
    availableRoles: string[];
    onSwitch: (role: string) => void;
    className?: string;
}

const ROLE_METADATA: Record<string, { label: string; icon: string; description: string; color: string }> = {
    medico: {
        label: "Panel Médico",
        icon: "Stethoscope",
        description: "Gestión profesional y consultas",
        color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    paciente: {
        label: "Portal Paciente",
        icon: "UserCircle",
        description: "Mi salud y citas",
        color: "text-green-600 bg-green-50 border-green-100",
    },
    secretaria: {
        label: "Secretaría",
        icon: "UserCog",
        description: "Agenda y administración",
        color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    farmacia: {
        label: "Farmacia",
        icon: "Pill",
        description: "Dispensación y stock",
        color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    laboratorio: {
        label: "Laboratorio",
        icon: "FlaskConical",
        description: "Resultados y analítica",
        color: "text-rose-600 bg-rose-50 border-rose-100",
    },
};

export function AppSwitcher({ activeRole, availableRoles, onSwitch, className }: AppSwitcherProps) {
    const currentRole = ROLE_METADATA[activeRole] || {
        label: "Selector de App",
        icon: "LayoutGrid",
        description: "Cambiar de aplicación",
        color: "text-gray-600 bg-gray-50 border-gray-100",
    };

    if (availableRoles.length <= 1) return null;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 h-auto font-medium transition-all hover:bg-opacity-80 border shadow-sm",
                            currentRole.color
                        )}
                    >
                        <DynamicIcon name={currentRole.icon as any} className="w-4 h-4" />
                        <span className="hidden sm:inline-block">{currentRole.label}</span>
                        <DynamicIcon name="ChevronDown" className="w-3 h-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-2">
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Cambiar de Aplicación
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableRoles.map((role) => {
                        const metadata = ROLE_METADATA[role];
                        if (!metadata) return null;

                        const isActive = role === activeRole;

                        return (
                            <DropdownMenuItem
                                key={role}
                                onClick={() => onSwitch(role)}
                                className={cn(
                                    "flex items-start gap-3 p-2 cursor-pointer transition-colors rounded-md",
                                    isActive ? "bg-accent" : "hover:bg-accent/50"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg border",
                                    metadata.color
                                )}>
                                    <DynamicIcon name={metadata.icon as any} className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold">{metadata.label}</span>
                                    <span className="text-xs text-muted-foreground leading-tight">
                                        {metadata.description}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="ml-auto">
                                        <DynamicIcon name="Check" className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
