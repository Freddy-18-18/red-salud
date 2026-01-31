"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, Save, ArrowLeft, Loader2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { getLabOrderDetails, saveLabResults } from "@/lib/supabase/services/laboratory-service";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface LabOrder {
    id: string;
    numero_orden?: string;
    tests: Array<{
        id: string;
        test_type_id: string;
        test_type: {
            id: string;
            nombre: string;
        };
    }>;
    paciente?: {
        nombre_completo?: string;
    };
}

interface ResultValue {
    parametro: string;
    valor: string;
    unidad: string;
    rango_referencia: string;
    es_anormal: boolean;
}

interface TestResult {
    test_type_id: string;
    test_name: string;
    observaciones: string;
    values: ResultValue[];
}

export default function UploadLabResultsPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [order, setOrder] = useState<LabOrder | null>(null);
    const [results, setResults] = useState<TestResult[]>([]);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setLoading(true);
        const result = await getLabOrderDetails(orderId);
        if (result.success && result.data) {
            setOrder(result.data as LabOrder);
            // Initialize results state based on ordered tests
            const initialResults = (result.data.tests || []).map((test) => ({
                test_type_id: test.test_type_id,
                test_name: test.test_type?.nombre || "Examen",
                observaciones: "",
                values: [{ parametro: "", valor: "", unidad: "", rango_referencia: "", es_anormal: false }]
            }));
            setResults(initialResults);
        } else {
            toast.error("Error al cargar la orden");
            router.push("/dashboard/medico/laboratorio");
        }
        setLoading(false);
    };

    const handleValueChange = (testIndex: number, valueIndex: number, field: keyof ResultValue, value: string | boolean) => {
        const newResults = [...results];
        newResults[testIndex].values[valueIndex] = {
            ...newResults[testIndex].values[valueIndex],
            [field]: value
        };
        setResults(newResults);
    };

    const addValue = (testIndex: number) => {
        const newResults = [...results];
        newResults[testIndex].values.push({
            parametro: "",
            valor: "",
            unidad: "",
            rango_referencia: "",
            es_anormal: false
        });
        setResults(newResults);
    };

    const removeValue = (testIndex: number, valueIndex: number) => {
        const newResults = [...results];
        newResults[testIndex].values = newResults[testIndex].values.filter((_, i) => i !== valueIndex);
        setResults(newResults);
    };

    const handleObservationChange = (testIndex: number, value: string) => {
        const newResults = [...results];
        newResults[testIndex].observaciones = value;
        setResults(newResults);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Sesión expirada");
                return;
            }

            const result = await saveLabResults(orderId, results, user.id);

            if (result.success) {
                toast.success("Resultados guardados exitosamente");
                router.push("/dashboard/medico/laboratorio");
            } else {
                throw new Error((result.error as Error)?.message || "Error al guardar resultados");
            }
        } catch (error) {
            console.error("Error saving results:", error);
            toast.error("Error al guardar los resultados");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                        <h1 className="text-3xl font-bold text-gray-900">Subir Resultados</h1>
                        <p className="text-gray-600 mt-1">
                            Orden #{order?.numero_orden} - {order?.paciente?.nombre_completo}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {results.map((testResult, testIndex) => (
                        <Card key={testResult.test_type_id}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5 text-blue-600" />
                                    {testResult.test_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {testResult.values.map((value, valueIndex) => (
                                        <div key={valueIndex} className="p-4 bg-gray-50 rounded-lg border relative">
                                            {testResult.values.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeValue(testIndex, valueIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                                <div className="space-y-2 lg:col-span-2">
                                                    <Label>Parámetro</Label>
                                                    <Input
                                                        placeholder="Ej: Hemoglobina"
                                                        value={value.parametro}
                                                        onChange={(e) => handleValueChange(testIndex, valueIndex, "parametro", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Valor</Label>
                                                    <Input
                                                        placeholder="Ej: 14.5"
                                                        value={value.valor}
                                                        onChange={(e) => handleValueChange(testIndex, valueIndex, "valor", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Unidad</Label>
                                                    <Input
                                                        placeholder="Ej: g/dL"
                                                        value={value.unidad}
                                                        onChange={(e) => handleValueChange(testIndex, valueIndex, "unidad", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Rango Ref.</Label>
                                                    <Input
                                                        placeholder="Ej: 13.5 - 17.5"
                                                        value={value.rango_referencia}
                                                        onChange={(e) => handleValueChange(testIndex, valueIndex, "rango_referencia", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2">
                                                <Checkbox
                                                    id={`anormal-${testIndex}-${valueIndex}`}
                                                    checked={value.es_anormal}
                                                    onCheckedChange={(checked) => handleValueChange(testIndex, valueIndex, "es_anormal", checked)}
                                                />
                                                <label
                                                    htmlFor={`anormal-${testIndex}-${valueIndex}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2 text-red-600"
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Marcar como valor anormal
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addValue(testIndex)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Parámetro
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>Observaciones Generales del Examen</Label>
                                    <Textarea
                                        placeholder="Comentarios adicionales..."
                                        value={testResult.observaciones}
                                        onChange={(e) => handleObservationChange(testIndex, e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Resultados
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </VerificationGuard>
    );
}
