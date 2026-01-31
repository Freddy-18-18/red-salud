"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, ArrowLeft, FileText, AlertTriangle, Loader2, User } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { getLabOrderDetails } from "@/lib/supabase/services/laboratory-service";

interface LabTest {
    id: string;
    test_type: {
        nombre: string;
        categoria: string;
    };
    status: string;
}

interface LabResult {
    id: string;
    test_type: {
        nombre: string;
    };
    fecha_resultado: string;
    observaciones?: string;
    values?: Array<{
        parametro: string;
        valor: string;
        unidad: string;
        rango_referencia: string;
        es_anormal?: boolean;
    }>;
}

interface LabOrder {
    id: string;
    patient_id: string;
    doctor_id: string;
    status: string;
    created_at: string;
    numero_orden?: string;
    prioridad?: string;
    fecha_orden?: string;
    instrucciones_paciente?: string;
    paciente?: {
        email?: string;
        nombre_completo?: string;
    };
    tests: LabTest[];
    results?: LabResult[];
}

export default function LabOrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<LabOrder | null>(null);

    const loadOrder = useCallback(async () => {
        setLoading(true);
        const result = await getLabOrderDetails(orderId);
        if (result.success && result.data) {
            setOrder(result.data as unknown as LabOrder);
        }
        setLoading(false);
    }, [orderId]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Orden no encontrada</h2>
                    <Button className="mt-4" onClick={() => router.push("/dashboard/medico/laboratorio")}>
                        Volver al listado
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <VerificationGuard>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detalles de la Orden</h1>
                        <p className="text-gray-600 mt-1">
                            Orden #{order.numero_orden}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información del Paciente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5" />
                                    Información del Paciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                                    <p className="text-base font-medium">{order.paciente?.nombre_completo}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-base">{order.paciente?.email || "No registrado"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exámenes Solicitados */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FlaskConical className="h-5 w-5" />
                                    Exámenes Solicitados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.tests.map((test) => (
                                        <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{test.test_type.nombre}</p>
                                                <p className="text-sm text-gray-500">{test.test_type.categoria}</p>
                                            </div>
                                            <Badge variant={test.status === 'completado' ? 'default' : 'secondary'}>
                                                {test.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resultados (si existen) */}
                        {order.results && order.results.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5" />
                                        Resultados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {order.results.map((result) => (
                                        <div key={result.id} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg">{result.test_type.nombre}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(result.fecha_resultado).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {result.values && result.values.length > 0 && (
                                                <div className="grid gap-2">
                                                    {result.values.map((val, idx: number) => (
                                                        <div key={idx} className={`flex justify-between items-center p-2 rounded ${val.es_anormal ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                            <span className="font-medium">{val.parametro}</span>
                                                            <div className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className={val.es_anormal ? 'text-red-600 font-bold' : ''}>
                                                                        {val.valor} {val.unidad}
                                                                    </span>
                                                                    {val.es_anormal && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                                                </div>
                                                                <span className="text-xs text-gray-500">Ref: {val.rango_referencia}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {result.observaciones && (
                                                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                                    <span className="font-medium">Observaciones:</span> {result.observaciones}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Estado de la Orden</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Estado Actual</span>
                                    <Badge className="text-base px-3 py-1" variant={order.status === 'completada' ? 'default' : 'secondary'}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Prioridad</span>
                                    <Badge variant="outline" className={
                                        order.prioridad === 'urgente' ? 'text-orange-600 border-orange-600' :
                                            order.prioridad === 'stat' ? 'text-red-600 border-red-600' : ''
                                    }>
                                        {order.prioridad?.toUpperCase() || 'NORMAL'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Fecha</span>
                                    <span className="font-medium">
                                        {order.fecha_orden ? new Date(order.fecha_orden).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>

                                {order.status !== 'completada' && (
                                    <Button className="w-full mt-4" onClick={() => router.push(`/dashboard/medico/laboratorio/${order.id}/resultados`)}>
                                        Subir Resultados
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {order.instrucciones_paciente && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Instrucciones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 italic">
                                        "{order.instrucciones_paciente}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </VerificationGuard>
    );
}
