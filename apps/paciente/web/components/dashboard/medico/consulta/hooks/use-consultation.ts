"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Appointment {
    id: string;
    paciente_id: string | null;
    offline_patient_id: string | null;
    medico_id: string;
    fecha_hora: string;
    motivo: string;
    status: string;
    tipo_cita: string;
    medical_record_id: string | null;
}

interface PatientData {
    id: string;
    nombre_completo: string;
    cedula: string;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
    email: string | null;
    avatar_url?: string | null;
}

export function useConsultation(appointmentId: string | null, pacienteId: string | null, fromPage: string | null) {
    const router = useRouter();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaving, setAutoSaving] = useState(false);

    // Estados del formulario médico
    const [alergias, setAlergias] = useState<string[]>([]);
    const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
    const [medicamentosActuales, setMedicamentosActuales] = useState<string[]>([]);
    const [notasMedicas, setNotasMedicas] = useState("");
    const [diagnosticos, setDiagnosticos] = useState<string[]>([]);
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const loadData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login/medico");
                return;
            }

            // Cargar cita
            const { data: aptData, error: aptError } = await supabase
                .from("appointments")
                .select("*")
                .eq("id", appointmentId)
                .single();

            if (aptError) throw aptError;
            setAppointment(aptData);

            // Cargar datos del paciente
            let patientData: PatientData | null = null;

            if (aptData.paciente_id) {
                // Paciente registrado
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("id, nombre_completo, cedula, fecha_nacimiento, telefono, email, avatar_url")
                    .eq("id", aptData.paciente_id)
                    .single();

                if (profileError) throw profileError;
                patientData = { ...profileData, genero: null };

                // Cargar detalles adicionales del paciente
                const { data: detailsData } = await supabase
                    .from("patient_details")
                    .select("*")
                    .eq("profile_id", aptData.paciente_id)
                    .single();

                if (detailsData) {
                    setAlergias(detailsData.alergias || []);
                    setCondicionesCronicas(detailsData.enfermedades_cronicas || []);
                    setMedicamentosActuales(detailsData.medicamentos_actuales?.split(",").filter(Boolean) || []);
                }
            } else if (aptData.offline_patient_id) {
                // Paciente offline
                const { data: offlineData, error: offlineError } = await supabase
                    .from("offline_patients")
                    .select("*")
                    .eq("id", aptData.offline_patient_id)
                    .single();

                if (offlineError) throw offlineError;
                patientData = {
                    id: offlineData.id,
                    nombre_completo: offlineData.nombre_completo,
                    cedula: offlineData.cedula,
                    fecha_nacimiento: offlineData.fecha_nacimiento,
                    genero: offlineData.genero,
                    telefono: offlineData.telefono,
                    email: offlineData.email,
                };

                setAlergias(offlineData.alergias || []);
                setCondicionesCronicas(offlineData.condiciones_cronicas || []);
                setMedicamentosActuales(offlineData.medicamentos_actuales || []);
                setNotasMedicas(offlineData.notas_medico || "");
            }

            setPatient(patientData);

            // Si ya existe un medical_record, cargarlo
            if (aptData.medical_record_id) {
                const { data: recordData } = await supabase
                    .from("medical_records")
                    .select("*")
                    .eq("id", aptData.medical_record_id)
                    .single();

                if (recordData) {
                    setDiagnosticos(recordData.diagnostico?.split(",").filter(Boolean) || []);
                    setNotasMedicas(recordData.sintomas || "");
                    setTratamiento(recordData.tratamiento || "");
                    setObservaciones(recordData.observaciones || "");
                }
            }
        } catch (err: unknown) {
            console.error("Error loading data:", err);
            setError(err instanceof Error ? err.message : "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    }, [appointmentId, router]);

    useEffect(() => {
        if (!appointmentId || !pacienteId) {
            setError("Faltan parámetros requeridos");
            setLoading(false);
            return;
        }
        loadData();
    }, [appointmentId, pacienteId, loadData]);

    // Iniciar consulta automáticamente al cargar si está en estado inicial
    useEffect(() => {
        if (loading || !appointment || !appointmentId) return;

        const startConsultationStatus = async () => {
            // Solo si la cita está en un estado previo a la consulta
            const initialStatuses = ['pendiente', 'confirmada', 'en_espera', 'confirmed'];
            if (initialStatuses.includes(appointment.status)) {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    await supabase.rpc("change_appointment_status", {
                        p_appointment_id: appointmentId,
                        p_new_status: "en_consulta",
                        p_user_id: user.id,
                        p_reason: "Inicio automático de atención"
                    });

                    // Actualizar el estado local para reflejar el cambio
                    setAppointment(prev => prev ? { ...prev, status: "en_consulta" } : null);

                    // Log de actividad
                    await supabase.from("user_activity_log").insert({
                        user_id: user.id,
                        activity_type: "consultation_started",
                        description: `Consulta iniciada automáticamente para la cita ${appointmentId}`,
                        status: "success",
                    });
                } catch (err) {
                    console.error("Error starting consultation status:", err);
                }
            }
        };

        startConsultationStatus();
    }, [loading, appointment, appointmentId]);

    // Autoguardado con Debounce (3 segundos)
    useEffect(() => {
        if (!appointment || !patient || loading) return;

        const timer = setTimeout(async () => {
            // Solo evitar autoguardado si NO hay contenido Y aún no se ha creado el registro médico
            if (!notasMedicas && diagnosticos.length === 0 && !tratamiento && !appointment.medical_record_id) return;

            setAutoSaving(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const medicalRecordData = {
                    paciente_id: appointment.paciente_id || null,
                    offline_patient_id: appointment.offline_patient_id || null,
                    medico_id: user.id,
                    appointment_id: appointment.id,
                    diagnostico: diagnosticos.join(", "),
                    sintomas: notasMedicas,
                    tratamiento: tratamiento,
                    observaciones: observaciones,
                    medicamentos: medicamentosActuales.join(", "),
                };

                const medicalRecordId = appointment.medical_record_id;

                if (medicalRecordId) {
                    await supabase
                        .from("medical_records")
                        .update(medicalRecordData)
                        .eq("id", medicalRecordId);
                } else {
                    const { data: newRecord } = await supabase
                        .from("medical_records")
                        .insert(medicalRecordData)
                        .select()
                        .single();

                    if (newRecord) {
                        await supabase
                            .from("appointments")
                            .update({ medical_record_id: newRecord.id })
                            .eq("id", appointment.id);

                        setAppointment(prev => prev ? { ...prev, medical_record_id: newRecord.id } : null);
                    }
                }

                setLastSaved(new Date());
            } catch (err) {
                console.error("Error autoguardando:", err);
            } finally {
                setAutoSaving(false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [appointment, patient, notasMedicas, diagnosticos, tratamiento, observaciones, medicamentosActuales, loading]);

    const saveConsultation = async () => {
        if (!appointment || !patient) return;

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login/medico");
                return;
            }

            // 1. Crear o actualizar medical_record
            const medicalRecordData = {
                paciente_id: appointment.paciente_id || null,
                offline_patient_id: appointment.offline_patient_id || null,
                medico_id: user.id,
                appointment_id: appointment.id,
                diagnostico: diagnosticos.join(", "),
                sintomas: notasMedicas,
                tratamiento: tratamiento,
                observaciones: observaciones,
                medicamentos: medicamentosActuales.join(", "),
            };

            let medicalRecordId = appointment.medical_record_id;

            if (medicalRecordId) {
                const { error: updateError } = await supabase
                    .from("medical_records")
                    .update(medicalRecordData)
                    .eq("id", medicalRecordId);

                if (updateError) throw updateError;
            } else {
                const { data: newRecord, error: insertError } = await supabase
                    .from("medical_records")
                    .insert(medicalRecordData)
                    .select()
                    .single();

                if (insertError) {
                    // Si el error es por duplicado (código 23505) o mensaje de duplicado
                    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
                        console.log("Conflicto detectado, recuperando registro existente...");
                        const { data: existingRecord } = await supabase
                            .from("medical_records")
                            .select("id")
                            .eq("appointment_id", appointment.id)
                            .single();

                        if (existingRecord) {
                            medicalRecordId = existingRecord.id;
                            // Actualizar el registro existente
                            const { error: updateError } = await supabase
                                .from("medical_records")
                                .update(medicalRecordData)
                                .eq("id", medicalRecordId);

                            if (updateError) throw updateError;
                        } else {
                            throw insertError;
                        }
                    } else {
                        throw insertError;
                    }
                } else {
                    medicalRecordId = newRecord.id;
                }

                if (medicalRecordId) {
                    await supabase
                        .from("appointments")
                        .update({ medical_record_id: medicalRecordId })
                        .eq("id", appointment.id);
                }
            }

            // 2. Actualizar datos del paciente
            if (appointment.offline_patient_id) {
                await supabase
                    .from("offline_patients")
                    .update({
                        alergias: alergias.length > 0 ? alergias : null,
                        condiciones_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
                        medicamentos_actuales: medicamentosActuales.length > 0 ? medicamentosActuales : null,
                    })
                    .eq("id", appointment.offline_patient_id);
            } else if (appointment.paciente_id) {
                const { data: existingDetails } = await supabase
                    .from("patient_details")
                    .select("id")
                    .eq("profile_id", appointment.paciente_id)
                    .single();

                const detailsData = {
                    alergias: alergias.length > 0 ? alergias : null,
                    enfermedades_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
                    medicamentos_actuales: medicamentosActuales.join(", "),
                };

                if (existingDetails) {
                    await supabase
                        .from("patient_details")
                        .update(detailsData)
                        .eq("profile_id", appointment.paciente_id);
                } else {
                    await supabase
                        .from("patient_details")
                        .insert({
                            profile_id: appointment.paciente_id,
                            ...detailsData,
                        });
                }
            }

            // 3. Cambiar estado de la cita
            const { error: rpcError } = await supabase.rpc("change_appointment_status", {
                p_appointment_id: appointment.id,
                p_new_status: "completada",
                p_user_id: user.id,
                p_reason: null,
            });

            if (rpcError) throw rpcError;

            // 4. Log de actividad
            await supabase.from("user_activity_log").insert({
                user_id: user.id,
                activity_type: "consultation_completed",
                description: `Consulta completada para ${patient.nombre_completo}`,
                status: "success",
            });

            // 5. Redirigir
            if (fromPage === "today") {
                router.push("/dashboard/medico/pacientes");
            } else {
                router.push("/dashboard/medico/citas");
            }
        } catch (err: unknown) {
            console.error("Error saving consultation:", err);
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            alert(errorMessage || "Error al guardar la consulta");
        } finally {
            setSaving(false);
        }
    };

    return {
        appointment,
        patient,
        loading,
        saving,
        error,
        lastSaved,
        autoSaving,
        alergias,
        setAlergias,
        condicionesCronicas,
        setCondicionesCronicas,
        medicamentosActuales,
        setMedicamentosActuales,
        notasMedicas,
        setNotasMedicas,
        diagnosticos,
        setDiagnosticos,
        tratamiento,
        setTratamiento,
        observaciones,
        setObservaciones,
        saveConsultation,
    };
}
