"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pill, Save, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { PatientSelector } from "@/components/citas/nueva/patient-selector";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import { createPrescription } from "@/lib/supabase/services/medications-service";
import { toast } from "sonner";

interface MedicationItem {
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    instrucciones: string;
}

export default function NewPrescriptionPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const { state: patientsState } = usePatientsList(userId);

    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [medications, setMedications] = useState<MedicationItem[]>([
        { medicamento: "", dosis: "", frecuencia: "", duracion: "", instrucciones: "" }
    ]);
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

    const handleAddMedication = () => {
        setMedications([...medications, { medicamento: "", dosis: "", frecuencia: "", duracion: "", instrucciones: "" }]);
    };

    const handleRemoveMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleMedicationChange = (index: number, field: keyof MedicationItem, value: string) => {
        const newMedications = [...medications];
        newMedications[index][field] = value;
        setMedications(newMedications);
    };

    const handleSubmit = async () => {
        if (!userId || !selectedPatientId || !diagnosis || medications.some(m => !m.medicamento)) {
            toast.error("Por favor complete los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createPrescription({
                paciente_id: selectedPatientId,
                medico_id: userId,
                diagnostico: diagnosis,
                notas: notes,
                medications: medications.map(m => ({
                    nombre_medicamento: m.medicamento,
                    dosis: m.dosis,
                    frecuencia: m.frecuencia,
                    duracion_dias: m.duracion ? parseInt(m.duracion) || undefined : undefined,
                    instrucciones_especiales: m.instrucciones || undefined,
                }))
            });

            if (result.success) {
                toast.success("Receta creada exitosamente");
                router.push("/dashboard/medico/recetas");
            } else {
                throw new Error((result.error as Error)?.message || "Error al crear la receta");
            }
        } catch (error: any) {
            console.error("Error creating prescription:", error);
            toast.error("Error al crear la receta");
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
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Receta Médica</h1>
                        <p className="text-gray-600 mt-1">Emite una nueva receta para tus pacientes</p>
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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Pill className="h-5 w-5" />
                                    Medicamentos
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={handleAddMedication}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Medicamento
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {medications.map((medication, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
                                        {medications.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveMedication(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Medicamento <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="Nombre del medicamento"
                                                    value={medication.medicamento}
                                                    onChange={(e) => handleMedicationChange(index, "medicamento", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dosis</Label>
                                                <Input
                                                    placeholder="Ej: 500mg"
                                                    value={medication.dosis}
                                                    onChange={(e) => handleMedicationChange(index, "dosis", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Frecuencia</Label>
                                                <Input
                                                    placeholder="Ej: Cada 8 horas"
                                                    value={medication.frecuencia}
                                                    onChange={(e) => handleMedicationChange(index, "frecuencia", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Duración</Label>
                                                <Input
                                                    placeholder="Ej: 7 días"
                                                    value={medication.duracion}
                                                    onChange={(e) => handleMedicationChange(index, "duracion", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <Label>Instrucciones Adicionales</Label>
                                                <Input
                                                    placeholder="Ej: Tomar con alimentos"
                                                    value={medication.instrucciones}
                                                    onChange={(e) => handleMedicationChange(index, "instrucciones", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Detalles de la Receta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Diagnóstico <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Diagnóstico principal"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notas Adicionales</Label>
                                    <Textarea
                                        placeholder="Observaciones o recomendaciones..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={submitting || !selectedPatientId || !diagnosis || medications.some(m => !m.medicamento)}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creando Receta...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Emitir Receta
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
