"use client";

import { Card, CardContent } from "@/components/ui/card";

interface MetricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export function MetricsModal({ isOpen, onClose, data }: MetricsModalProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Métricas de Tiempo de Consulta</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Resumen General */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Tiempo Promedio General</p>
                            <p className="text-4xl font-bold text-purple-600">
                                {data.avg_minutes || 0} minutos
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Basado en {data.total_consultations || 0} consultas completadas
                            </p>
                        </div>

                        {/* Desglose por Motivo */}
                        <div>
                            <h4 className="font-semibold mb-3">Tiempo por Motivo de Consulta</h4>
                            {data.by_motivo && Object.keys(data.by_motivo).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(data.by_motivo).map(([motivo, data]: [string, any]) => (
                                        <div key={motivo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{motivo}</p>
                                                <p className="text-xs text-gray-500">{data.count} consultas</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-purple-600">{data.avg_minutes}min</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No hay suficientes datos para mostrar desglose por motivo
                                </p>
                            )}
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 text-center">
                                Datos de los últimos 30 días • Actualizado en tiempo real
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
