"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleData } from "./modules-data";

interface ModuleSelectorProps {
    modules: ModuleData[];
    activeModule: string;
    onModuleChange: (moduleId: string) => void;
}

export function ModuleSelector({ modules, activeModule, onModuleChange }: ModuleSelectorProps) {
    return (
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
            {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;

                return (
                    <button
                        key={module.id}
                        onClick={() => onModuleChange(module.id)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink",
                            isActive
                                ? "bg-card border-2 border-primary/30 shadow-lg shadow-primary/10"
                                : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                            isActive
                                ? `bg-gradient-to-br ${module.color} text-white`
                                : "bg-muted text-muted-foreground"
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="hidden lg:block">
                            <div className={cn(
                                "font-medium transition-colors",
                                isActive ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {module.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                                {module.description}
                            </div>
                        </div>
                        {isActive && (
                            <ChevronRight className="h-5 w-5 text-primary ml-auto hidden lg:block" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
