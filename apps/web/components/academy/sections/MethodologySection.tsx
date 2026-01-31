"use client";

import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { ActiveRecallVisual } from "@/components/academy/visuals/ActiveRecallVisual";
import { SpacedRepetitionChart } from "@/components/academy/visuals/SpacedRepetitionChart";
import { Button, Card, CardContent } from "@red-salud/ui";
import Link from 'next/link';

export function MethodologySection() {
    return (
        <section className="py-24 px-4 relative overflow-hidden bg-slate-900">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-7xl relative z-10">

                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-6"
                    >
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Neurociencia Aplicada</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        No estudies más.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Estudia mejor.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Olvídate de leer pasivamente. Nuestra plataforma utiliza algoritmos basados en evidencia
                        científica para hackear tu curva de aprendizaje.
                    </motion.p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                    {/* Active Recall Card (Large Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7"
                    >
                        <Card className="h-full bg-slate-950/50 border-white/10 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 group">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                                        <Target className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Active Recall</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        La ciencia demuestra que intentar recordar información activamente fortalece las conexiones neuronales un <strong className="text-white">50% más</strong> que la re-lectura pasiva. Nuestro sistema te desafía constantemente antes de mostrarte la respuesta.
                                    </p>
                                </div>
                                <div className="mt-auto">
                                    <ActiveRecallVisual />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Spaced Repetition Card (Large Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5"
                    >
                        <Card className="h-full bg-slate-950/50 border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-500 group">
                            <CardContent className="p-8 flex flex-col h-full">
                                <div className="mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                        <TrendingUp className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Spaced Repetition</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        Nuestro algoritmo predice el momento exacto en que vas a olvidar algo y te lo muestra justo antes. Maximizamos la retención con el mínimo esfuerzo posible.
                                    </p>
                                </div>
                                <div className="mt-auto">
                                    <SpacedRepetitionChart />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Smaller Feature Cards (Bottom Row) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4"
                    >
                        <Card className="h-full bg-slate-950/30 border-white/5 hover:bg-slate-950/60 hover:border-white/10 transition-colors">
                            <CardContent className="p-6">
                                <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                                <h4 className="text-lg font-bold text-white mb-2">Metacognición</h4>
                                <p className="text-sm text-slate-400">Aprende a aprender. Entiende tus propios procesos cognitivos y optimiza tu tiempo de estudio.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4"
                    >
                        <Card className="h-full bg-slate-950/30 border-white/5 hover:bg-slate-950/60 hover:border-white/10 transition-colors">
                            <CardContent className="p-6">
                                <Brain className="w-8 h-8 text-purple-400 mb-4" />
                                <h4 className="text-lg font-bold text-white mb-2">Interleaving</h4>
                                <p className="text-sm text-slate-400">Alternamos conceptos relacionados para mejorar tu capacidad de discriminación y resolución de problemas.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <Link href="/academy/metodologia">
                                <Button
                                    className="bg-transparent hover:bg-white/5 text-white border-2 border-white/10 hover:border-cyan-400/50 text-lg px-8 py-6 h-auto transition-all group"
                                >
                                    Ver Ciencia Completa
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
