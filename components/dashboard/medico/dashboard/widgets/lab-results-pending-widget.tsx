/**
 * @file lab-results-pending-widget.tsx
 * @description Widget de resultados de laboratorio pendientes de revisión.
 * Muestra órdenes de lab con resultados nuevos que requieren atención del médico.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FlaskConical,
    AlertCircle,
    ChevronRight,
    Loader2,
    Eye,
    CheckCircle,
    FileText,
    User,
    Clock,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { WidgetWrapper } from "../widget-wrapper";
import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TIPOS
// ============================================================================

interface LabResultsPendingWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface PendingLabResult {
    /** ID de la orden */
    id: string;
    /** ID del paciente */
    patientId: string;
    /** Nombre del paciente */
    patientName: string;
    /** Avatar del paciente */
    patientAvatar?: string;
    /** Tipos de exámenes */
    testTypes: string[];
    /** Fecha de los resultados */
    resultDate: Date;
    /** Si tiene valores anormales */
    hasAbnormal: boolean;
    /** Cantidad de valores anormales */
    abnormalCount: number;
    /** Estado: nuevo o revisado */
    status: "new" | "reviewed";
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene las iniciales de un nombre.
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/**
 * Formatea fecha relativa.
 */
function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short"
    });
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de resultados de laboratorio pendientes.
 * Muestra órdenes con resultados listos para revisar.
 * 
 * @example
 * <LabResultsPendingWidget doctorId="uuid-del-doctor" />
 */
export function LabResultsPendingWidget({
    doctorId,
    isDragging
}: LabResultsPendingWidgetProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [pendingResults, setPendingResults] = useState<PendingLabResult[]>([]);
    const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

    // Cargar datos de laboratorio
    useEffect(() => {
        const loadLabResults = async () => {
            if (!doctorId) {
                setIsLoading(false);
                return;
            }

            try {
                // Intentar cargar órdenes de lab con resultados pendientes de revisar
                const { data: orders, error } = await supabase
                    .from("lab_orders")
                    .select(`
                        id,
                        paciente_id,
                        status,
                        created_at,
                        lab_results (
                            id,
                            test_type:lab_test_types(nombre),
                            lab_result_values (
                                es_anormal
                            )
                        ),
                        patient:profiles!lab_orders_paciente_id_fkey (
                            nombre_completo,
                            avatar_url
                        )
                    `)
                    .eq("medico_id", doctorId)
                    .eq("status", "completada")
                    .order("created_at", { ascending: false })
                    .limit(20);

                if (error) {
                    // Si no existe la tabla, no mostrar nada
                    console.log("[LabResultsPending] Error o sin tabla:", error.message);
                    setPendingResults([]);
                } else if (orders && orders.length > 0) {
                    // Procesar órdenes reales
                    const processed = processLabOrders(orders);
                    setPendingResults(processed);
                } else {
                    // Sin órdenes
                    setPendingResults([]);
                }
            } catch (err) {
                console.error("[LabResultsPending] Error:", err);
                setPendingResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadLabResults();
    }, [doctorId]);

    // Handler para ver resultado
    const handleViewResult = (orderId: string) => {
        router.push(`/dashboard/medico/laboratorio/orden/${orderId}`);
    };

    // Handler para marcar como revisado
    const handleMarkReviewed = (orderId: string) => {
        setReviewedIds(prev => new Set([...prev, orderId]));
        // TODO: Actualizar en Supabase
    };

    // Filtrar resultados no revisados
    const visibleResults = pendingResults.filter(r => !reviewedIds.has(r.id));
    const hasAbnormalResults = visibleResults.some(r => r.hasAbnormal);

    return (
        <WidgetWrapper
            id="lab-results-pending"
            title="Lab Pendientes"
            icon={<FlaskConical className="h-4 w-4 text-pink-500" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header con conteo */}
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] gap-1",
                                    hasAbnormalResults && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                            >
                                <FileText className="h-2.5 w-2.5" />
                                {visibleResults.length} por revisar
                            </Badge>
                            {hasAbnormalResults && (
                                <Badge
                                    variant="destructive"
                                    className="text-[10px] gap-1"
                                >
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    Valores anormales
                                </Badge>
                            )}
                        </div>

                        {/* Lista de resultados */}
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {visibleResults.length > 0 ? (
                                    visibleResults.slice(0, 4).map((result, index) => (
                                        <motion.div
                                            key={result.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg",
                                                "bg-muted/30 hover:bg-muted/50 transition-colors",
                                                result.hasAbnormal && "border-l-2 border-l-red-500"
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    {result.patientAvatar ? (
                                                        <AvatarImage src={result.patientAvatar} alt={result.patientName} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                                                        {getInitials(result.patientName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {result.hasAbnormal && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background flex items-center justify-center">
                                                        <span className="text-[8px] text-white font-bold">
                                                            {result.abnormalCount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {result.patientName}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <span className="truncate max-w-[100px]">
                                                        {result.testTypes.slice(0, 2).join(", ")}
                                                        {result.testTypes.length > 2 && ` +${result.testTypes.length - 2}`}
                                                    </span>
                                                    <span className="text-border">•</span>
                                                    <span>{formatRelativeDate(result.resultDate)}</span>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => handleMarkReviewed(result.id)}
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Marcar como revisado
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <Button
                                                    size="sm"
                                                    variant={result.hasAbnormal ? "destructive" : "default"}
                                                    className="h-6 text-[10px] px-2"
                                                    onClick={() => handleViewResult(result.id)}
                                                >
                                                    <Eye className="h-2.5 w-2.5 mr-1" />
                                                    Ver
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-emerald-500" />
                                        <p className="text-xs">¡Todo revisado!</p>
                                        <p className="text-[10px] mt-1">No hay resultados pendientes</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Ver todos */}
                        {visibleResults.length > 0 && (
                            <Button
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={() => router.push("/dashboard/medico/laboratorio")}
                            >
                                <FlaskConical className="h-3 w-3 mr-1" />
                                Ver laboratorio
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}

// ============================================================================
// HELPERS DE DATOS
// ============================================================================

/**
 * Procesa órdenes de laboratorio de Supabase.
 */
function processLabOrders(orders: any[]): PendingLabResult[] {
    return orders.map(order => {
        const testTypes = order.lab_results?.map((r: any) => r.test_type?.nombre).filter(Boolean) || [];
        const allValues = order.lab_results?.flatMap((r: any) => r.lab_result_values || []) || [];
        const abnormalValues = allValues.filter((v: any) => v.es_anormal);

        return {
            id: order.id,
            patientId: order.paciente_id,
            patientName: order.patient?.nombre_completo || "Paciente",
            patientAvatar: order.patient?.avatar_url,
            testTypes: testTypes.length > 0 ? testTypes : ["Exámenes"],
            resultDate: new Date(order.created_at),
            hasAbnormal: abnormalValues.length > 0,
            abnormalCount: abnormalValues.length,
            status: "new" as const
        };
    }).filter(r => r.testTypes.length > 0);
}

/**
 * Genera datos de demostración.
 */
// generateDemoResults eliminado para evitar datos falsos
