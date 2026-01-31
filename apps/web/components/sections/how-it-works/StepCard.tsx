"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import type { Step } from "./how-it-works-data";

interface StepCardProps {
    step: Step;
    index: number;
    totalSteps: number;
}

export function StepCard({ step, index, totalSteps }: StepCardProps) {
    const Icon = step.icon;

    return (
        <motion.div
            variants={fadeInUp}
            className="relative group"
        >
            {/* Connector line */}
            {index < totalSteps - 1 && (
                <div className="hidden md:block absolute top-16 left-[calc(100%-2rem)] w-[calc(100%+4rem)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent dark:from-primary/20 dark:to-transparent z-0" />
            )}

            <div className="relative bg-card border border-border rounded-2xl p-8 transition-all duration-500 hover-lift hover:border-primary/50 h-full flex flex-col">
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                </div>

                <div className="mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4">
                    {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                    {step.description}
                </p>

                <div className="mt-6 pt-6 border-t border-border dark:border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        <span>Rápido y seguro</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
