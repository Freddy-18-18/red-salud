"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, Save, ArrowLeft, Loader2 } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { PatientSelector } from "@/components/citas/nueva/patient-selector";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import { useLabTestTypes } from "@/hooks/use-laboratory";
import { createLabOrder } from "@/lib/supabase/services/laboratory-service";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function NewLabOrderPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const { state: patientsState } = usePatientsList(userId);
    const { testTypes, categories, loading: loadingTests } = useLabTestTypes();

    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [priority, setPriority] = useState<"normal" | "urgente" | "stat">("normal");
    const [instructions, setInstructions] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login/medico");
                return;
            }
            setUserId(user.id);
        };
        init();
    }, [router]);

    const handleTestToggle = (testId: string) => {
        setSelectedTests(prev =>
            prev.includes(testId)
                ? prev.filter(id => id !== testId)
                : [...prev, testId]
        );
    };

    const handleSubmit = async () => {
        if (!userId || !selectedPatientId || selectedTests.length === 0) {
            toast.error("Por favor complete los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createLabOrder({
                paciente_id: selectedPatientId,
                medico_id: userId,
                prioridad: priority,
                instrucciones_paciente: instructions,
                tests: selectedTests,
            });

            if (result.success) {
                toast.success("Orden de laboratorio creada exitosamente");
                router.push("/dashboard/medico/laboratorio");
            } else {
                throw new Error((result.error as Error)?.message || "Error al crear la orden");
            }
        } catch (error: any) {
            console.error("Error creating order:", error);
            toast.error("Error al crear la orden");
        } finally {
            setSubmitting(false);
        }
    };

    // Combine registered and offline patients for the selector
    const allPatients = [
        ...patientsState.patients.map(p => ({
            id: p.patient_id,
            nombre_completo: p.patient.nombre_completo,
            email: p.patient.email,
            type: 'registered'
        })),
        ...patientsState.offlinePatients.map(p => ({
            id: p.id,
            nombre_completo: p.nombre_completo,
            cedula: p.cedula,
            type: 'offline'
        }))
    ];

    return (
        <VerificationGuard>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Laboratorio</h1>
                        <p className="text-gray-600 mt-1">Crea una nueva orden para tus pacientes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <PatientSelector
                            patients={allPatients}
                            loadingPatients={patientsState.loading}
                            selectedPatientId={selectedPatientId}
                            onPatientSelect={setSelectedPatientId}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FlaskConical className="h-5 w-5" />
                                    Exámenes Solicitados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingTests ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {categories.map(category => {
                                            const categoryTests = testTypes.filter(t => t.categoria === category);
                                            if (categoryTests.length === 0) return null;

                                            return (
                                                <div key={category}>
                                                    <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {categoryTests.map(test => (
                                                            <div key={test.id} className="flex items-start space-x-2">
                                                                <Checkbox
                                                                    id={test.id}
                                                                    checked={selectedTests.includes(test.id)}
                                                                    onCheckedChange={() => handleTestToggle(test.id)}
                                                                />
                                                                <div className="grid gap-1.5 leading-none">
                                                                    <label
                                                                        htmlFor={test.id}
                                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                                    >
                                                                        {test.nombre}
                                                                    </label>
                                                                    {test.descripcion && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {test.descripcion}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Detalles de la Orden</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Prioridad</Label>
                                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgente">Urgente</SelectItem>
                                            <SelectItem value="stat">STAT (Inmediato)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Instrucciones para el Paciente</Label>
                                    <Textarea
                                        placeholder="Ej: Ayuno de 8 horas..."
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={submitting || !selectedPatientId || selectedTests.length === 0}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creando Orden...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Crear Orden
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </VerificationGuard>
    );
}
