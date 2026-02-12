"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input, Textarea } from "@red-salud/ui";
import { Pill, Save, ArrowLeft, Loader2, Plus, Building2 } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { RecipePatientSearch, type PatientOption } from "@/components/dashboard/recetas/recipe-patient-search";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import { useOffices } from "@/hooks/dashboard/use-offices"; // Added this
import { createPrescription } from "@/lib/supabase/services/medications-service";
import { MedicationInput, RecipePreview, type MedicationItemData } from "@/components/dashboard/recetas";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";
import { useCurrentOffice } from "@/hooks/use-current-office";
import type { CreatePrescriptionData } from "@/lib/supabase/types/medications";

// Use the enhanced MedicationItemData type from components

export default function NewPrescriptionPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const { state: patientsState } = usePatientsList(userId);

    // Office selection for multi-office doctors
    const { currentOffice, updateCurrentOffice } = useCurrentOffice();
    const { offices: allOffices } = useOffices(); // Fix undefined allOffices bug

    const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [medications, setMedications] = useState<MedicationItemData[]>([
        {
            medicamento: "",
            presentacion: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            viaAdministracion: "Oral",
            instrucciones: ""
        }
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

    const handleAddMedication = useCallback(() => {
        setMedications(prev => [...prev, {
            medicamento: "",
            presentacion: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            viaAdministracion: "Oral",
            instrucciones: ""
        }]);
    }, []);

    const handleRemoveMedication = useCallback((index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleMedicationChange = useCallback((index: number, field: keyof MedicationItemData, value: string) => {
        setMedications(prev => {
            const newMedications = [...prev];
            const item = { ...newMedications[index] };
            if (field in item) {
                (item as Record<string, string | number | undefined>)[field] = value || "";
            }
            newMedications[index] = item as MedicationItemData;
            return newMedications;
        });
    }, []);

    const handlePatientFound = useCallback((patient: PatientOption) => {
        setSelectedPatient(patient);
        toast.success(`Paciente seleccionado: ${patient.nombre_completo}`);
    }, []);

    const handleCnePatientFound = useCallback(async (cedula: string, nombre: string) => {
        if (!userId) return;

        // Check if already in offline list (client-side check first)
        const existing = patientsState.offlinePatients.find(p => p.cedula === cedula);
        if (existing) {
            setSelectedPatient({
                id: existing.id,
                nombre_completo: existing.nombre_completo,
                cedula: existing.cedula,
                type: "offline",
                email: existing.email
            });
            return;
        }

        // Auto-create offline patient
        try {
            const { data, error } = await supabase
                .from("offline_patients")
                .insert({
                    doctor_id: userId,
                    nombre_completo: nombre, // Name from CNE
                    cedula: cedula,
                    status: "offline",
                    // Optional fields
                    email: null,
                    telefono: null
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Paciente registrado temporalmente");
            const newPatient: PatientOption = {
                id: data.id,
                nombre_completo: data.nombre_completo,
                cedula: data.cedula,
                type: "offline",
                email: data.email
            };

            setSelectedPatient(newPatient);

        } catch (err) {
            console.error("Error creating offline patient:", err);
            toast.error("Error al registrar paciente temporal");
        }
    }, [userId, patientsState.offlinePatients]);

    const handleSubmit = useCallback(async () => {
        if (!userId || !selectedPatient || !diagnosis || medications.some(m => !m.medicamento)) {
            toast.error("Por favor complete los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            const prescriptionData: CreatePrescriptionData = {
                paciente_id: selectedPatient.type === 'registered' ? selectedPatient.id : undefined,
                offline_patient_id: selectedPatient.type === 'offline' ? selectedPatient.id : undefined,
                medico_id: userId,
                diagnostico: diagnosis,
                notas: notes,
                medications: medications.map(m => ({
                    medication_id: m.medicamentoId,
                    nombre_medicamento: m.medicamento,
                    dosis: m.dosis,
                    frecuencia: m.frecuencia,
                    via_administracion: m.viaAdministracion,
                    duracion_dias: m.duracion ? parseInt(m.duracion) || undefined : undefined,
                    instrucciones_especiales: m.instrucciones || undefined,
                }))
            };

            const result = await createPrescription(prescriptionData);

            if (result.success) {
                toast.success("Receta creada exitosamente");
                router.push("/dashboard/medico/recetas");
            } else {
                throw new Error((result.error as Error)?.message || "Error al crear la receta");
            }
        } catch (error: unknown) {
            console.error("Error creating prescription:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al crear la recipe";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [userId, selectedPatient, diagnosis, notes, medications, router]);

    // Prepare options for ConsultationPatientSearch
    const patientOptions: PatientOption[] = [
        ...patientsState.patients.map(p => ({
            id: p.patient.id,
            nombre_completo: p.patient.nombre_completo,
            cedula: p.patient.cedula || null,
            type: "registered" as const,
            email: p.patient.email || null,
            fecha_nacimiento: p.patient.fecha_nacimiento || undefined,
            genero: p.patient.genero || undefined
        })),
        ...patientsState.offlinePatients.map(p => ({
            id: p.id,
            nombre_completo: p.nombre_completo,
            cedula: p.cedula,
            type: "offline" as const,
            email: p.email || null,
            fecha_nacimiento: p.fecha_nacimiento || undefined,
            genero: p.genero || undefined
        }))
    ];

    return (
        <VerificationGuard>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Nueva Receta Médica
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Emite una nueva receta para tus pacientes
                            </p>
                        </div>
                    </div>

                    {/* Office selector for multi-office doctors */}
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <select
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={currentOffice?.id || ""}
                            onChange={(e) => updateCurrentOffice(e.target.value)}
                        >
                            {allOffices.map((office) => (
                                <option key={office.id} value={office.id}>
                                    {office.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Formulario de Receta */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Patient Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Paciente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!selectedPatient ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <Label>Buscar Paciente</Label>
                                            <RecipePatientSearch
                                                patients={patientOptions}
                                                onPatientFound={handlePatientFound}
                                                onCnePatientFound={handleCnePatientFound}
                                            />

                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                                        <div>
                                            <p className="font-semibold text-lg">{selectedPatient.nombre_completo}</p>
                                            <div className="flex gap-2 text-sm text-muted-foreground mt-1 items-center">
                                                <span className="font-medium text-foreground/80">{selectedPatient.cedula ? `V-${selectedPatient.cedula}` : 'Sin cédula'}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-background border">
                                                    {selectedPatient.type === 'registered' ? 'Registrado' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="text-muted-foreground hover:text-foreground">
                                            Cambiar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
                            <CardContent className="space-y-4">
                                {medications.map((medication, index) => (
                                    <MedicationInput
                                        key={index}
                                        index={index}
                                        data={medication}
                                        onChange={handleMedicationChange}
                                        onRemove={handleRemoveMedication}
                                        canRemove={medications.length > 1}
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        {/* Diagnosis and Notes Card */}
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
                                    disabled={submitting || !selectedPatient || !diagnosis || medications.some(m => !m.medicamento)}
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

                    {/* Preview Column */}
                    <div className="space-y-6">
                        <RecipePreview
                            patient={selectedPatient ? {
                                nombre: selectedPatient.nombre_completo,
                                cedula: selectedPatient.cedula || undefined,
                                edad: selectedPatient.edad || (selectedPatient.fecha_nacimiento ? differenceInYears(new Date(), new Date(selectedPatient.fecha_nacimiento)) : undefined),
                                sexo: selectedPatient.genero || undefined,
                                peso: selectedPatient.peso
                            } : null}
                            medications={medications}
                            diagnosis={diagnosis}
                            notes={notes}
                            officeId={currentOffice?.id}
                        />
                    </div>
                </div>
            </div>
        </VerificationGuard>
    );
}
