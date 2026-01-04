"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { modulesData, ModuleSelector, PreviewPanel } from "./product-showcase";

export function ProductShowcase() {
    const [activeModule, setActiveModule] = useState("agenda");
    const currentModule = modulesData.find(m => m.id === activeModule) || modulesData[0];

    return (
        <section id="demo" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <span>Vista previa del dashboard</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                            Todo lo que necesitas,{" "}
                            <span className="gradient-text">en un solo lugar</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Explora las herramientas que transformarán tu práctica médica.
                            Diseñadas para ser simples pero potentes.
                        </p>
                    </motion.div>

                    {/* Interactive Showcase */}
                    <motion.div
                        variants={fadeInUp}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
                            <ModuleSelector
                                modules={modulesData}
                                activeModule={activeModule}
                                onModuleChange={setActiveModule}
                            />
                            <PreviewPanel
                                currentModule={currentModule}
                                activeModuleId={activeModule}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
