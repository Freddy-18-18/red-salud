"use client";

import { useState } from "react";
import { Card } from "@red-salud/design-system";
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2, CreditCard } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export function EligibilityWidget() {
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<'valid' | 'invalid' | null>(null);

    const checkEligibility = () => {
        setChecking(true);
        setTimeout(() => {
            setResult(Math.random() > 0.3 ? 'valid' : 'invalid');
            setChecking(false);
        }, 2000);
    };

    return (
        <Card className="p-6 h-full flex flex-col space-y-4 bg-gradient-to-br from-blue-500/5 to-primary/5 border-blue-500/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Elegibilidad Real-Time</h3>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    RCM & Billing
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase">ID de Seguro / Cédula del Paciente</p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="V-20123456"
                                className="pl-9 h-10 bg-card/50 border-border/50 text-sm"
                            />
                        </div>
                        <Button
                            onClick={checkEligibility}
                            disabled={checking}
                            className="bg-blue-600 hover:bg-blue-700 h-10 px-4 shrink-0"
                        >
                            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <div className="min-h-[100px] flex items-center justify-center border border-border/40 rounded-xl bg-card/30 p-4">
                    {!result && !checking ? (
                        <div className="text-center space-y-2">
                            <p className="text-xs text-muted-foreground italic">Ingresa los datos para verificar cobertura</p>
                        </div>
                    ) : checking ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            <p className="text-[10px] font-medium text-muted-foreground animate-pulse">Consultando Red de Seguros...</p>
                        </div>
                    ) : result === 'valid' ? (
                        <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-emerald-600">Cobertura Activa</p>
                                <p className="text-[10px] text-muted-foreground">Sura Dental • 80% Cobertura</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-red-600">No Elegible</p>
                                <p className="text-[10px] text-muted-foreground">Póliza vencida o sin convenio</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-card border border-border/50 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Copago Estimado</p>
                    <p className="text-lg font-bold text-primary">$15.00</p>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Límite Anual</p>
                    <p className="text-lg font-bold text-blue-600">$1,200</p>
                </div>
            </div>
        </Card>
    );
}
