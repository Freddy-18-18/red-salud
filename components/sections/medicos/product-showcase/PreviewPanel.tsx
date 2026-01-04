"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleData } from "./modules-data";
import { modulePreviewsMap } from "./ModulePreviews";

interface PreviewPanelProps {
    currentModule: ModuleData;
    activeModuleId: string;
}

export function PreviewPanel({ currentModule, activeModuleId }: PreviewPanelProps) {
    const PreviewComponent = modulePreviewsMap[activeModuleId];

    return (
        <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                            currentModule.color
                        )}>
                            <currentModule.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{currentModule.name}</h3>
                            <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Features List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Características
                        </h4>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeModuleId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-2"
                            >
                                {currentModule.features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-secondary" />
                                        </div>
                                        <span className="text-sm text-foreground">{feature}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Preview */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Vista Previa
                        </h4>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeModuleId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {PreviewComponent && <PreviewComponent />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
