import { supabase } from "../client";
import type {
  Appointment,
  DoctorProfile,
  MedicalSpecialty,
  CreateAppointmentData,
  TimeSlot,
  DoctorSchedule,
} from "../types/appointments";

// Obtener todas las especialidades (con opción de filtrar solo las que tienen médicos)
export async function getMedicalSpecialties(onlyWithDoctors: boolean = false) {
  console.log('🚀 getMedicalSpecialties called with onlyWithDoctors:', onlyWithDoctors);
  
  try {
    if (onlyWithDoctors) {
      console.log('📡 Fetching doctors from Supabase...');
      
      // Obtener médicos verificados en SACS
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          sacs_especialidad,
          doctor_details:doctor_details!doctor_details_profile_id_fkey(
            especialidad_id,
            specialty:specialties!doctor_details_especialidad_id_fkey(
              id,
              name,
              description,
              icon,
              created_at
            )
          )
        `)
        .eq("role", "medico")
        .eq("sacs_verificado", true);

      console.log('📊 Supabase response:', { 
        profiles: profiles?.length, 
        error: profilesError,
        data: profiles 
      });

      if (profilesError) {
        console.error('❌ Supabase error:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.warn('⚠️ No profiles found');
        return { success: true, data: [] };
      }

      // Recopilar especialidades únicas de médicos verificados
      const specialtyMap = new Map<string, MedicalSpecialty>();

      console.log('👥 Processing', profiles.length, 'profiles');

      profiles.forEach((profile: any) => {
        const doctorDetail = profile.doctor_details?.[0];
        
        console.log('🔍 Profile:', {
          id: profile.id,
          sacs_especialidad: profile.sacs_especialidad,
          has_doctor_details: !!doctorDetail,
          specialty: doctorDetail?.specialty
        });
        
        if (doctorDetail?.specialty) {
          // Si tiene doctor_details con especialidad asignada
          const spec = doctorDetail.specialty;
          if (!specialtyMap.has(spec.id)) {
            console.log('➕ Adding specialty from doctor_details:', spec.name);
            specialtyMap.set(spec.id, {
              id: spec.id,
              name: spec.name,
              description: spec.description || '',
              icon: spec.icon || 'stethoscope',
              created_at: spec.created_at,
            });
          }
        } else if (profile.sacs_especialidad) {
          // Si solo tiene sacs_especialidad (sin doctor_details)
          const tempId = `sacs-${profile.sacs_especialidad.toLowerCase().replace(/\s+/g, '-')}`;
          if (!specialtyMap.has(tempId)) {
            console.log('➕ Adding specialty from SACS:', profile.sacs_especialidad);
            specialtyMap.set(tempId, {
              id: tempId,
              name: profile.sacs_especialidad,
              description: 'Especialidad verificada en SACS',
              icon: 'stethoscope',
              created_at: new Date().toISOString(),
            });
          }
        }
      });

      const specialtiesWithDoctors = Array.from(specialtyMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      console.log('✅ Final specialties:', specialtiesWithDoctors.length, specialtiesWithDoctors);

      return { success: true, data: specialtiesWithDoctors };
    } else {
      // Obtener todas las especialidades activas
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return { success: true, data: data as MedicalSpecialty[] };
    }
  } catch (error) {
    console.error("❌ Error fetching specialties:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener doctores disponibles (con filtros opcionales)
// Busca médicos verificados en SACS (profiles.sacs_verificado = true)
export async function getAvailableDoctors(specialtyId?: string) {
  try {
    console.log('🔍 getAvailableDoctors called with specialtyId:', specialtyId);
    
    // Buscar directamente en profiles con sacs_verificado = true
    let query = supabase
      .from("profiles")
      .select(`
        id,
        nombre_completo,
        email,
        avatar_url,
        telefono,
        direccion,
        ciudad,
        estado,
        sacs_verificado,
        sacs_especialidad,
        sacs_matricula,
        doctor_details:doctor_details!doctor_details_profile_id_fkey(
          id,
          especialidad_id,
          licencia_medica,
          anos_experiencia,
          biografia,
          tarifa_consulta,
          horario_atencion,
          direccion_consultorio,
          telefono_consultorio,
          acepta_seguro,
          verified,
          sacs_verified,
          is_active,
          professional_phone,
          professional_email,
          clinic_address,
          consultation_duration,
          consultation_price,
          schedule,
          created_at,
          updated_at,
          specialty:specialties!doctor_details_especialidad_id_fkey(id, name, description, icon)
        )
      `)
      .eq("role", "medico")
      .eq("sacs_verificado", true);

    const { data, error } = await query.order("created_at");

    console.log('📊 Query result:', { data, error, count: data?.length });

    if (error) throw error;

    // Transformar y filtrar datos
    let doctors = data?.map((profile: any) => {
      const doctorDetail = profile.doctor_details?.[0]; // Puede ser null si no tiene doctor_details
      
      return {
        id: profile.id,
        specialty_id: doctorDetail?.especialidad_id || null,
        license_number: profile.sacs_matricula || doctorDetail?.licencia_medica,
        anos_experiencia: doctorDetail?.anos_experiencia || 0,
        biografia: doctorDetail?.biografia || null,
        tarifa_consulta: doctorDetail?.tarifa_consulta 
          ? parseFloat(doctorDetail.tarifa_consulta) 
          : (doctorDetail?.consultation_price ? parseFloat(doctorDetail.consultation_price) : undefined),
        consultation_duration: doctorDetail?.consultation_duration || 30,
        verified: true, // Ya está verificado en SACS
        is_active: doctorDetail?.is_active !== false,
        // Información de contacto y ubicación
        telefono: profile.telefono || doctorDetail?.professional_phone,
        direccion: profile.direccion || doctorDetail?.clinic_address,
        ciudad: profile.ciudad,
        estado: profile.estado,
        horario: doctorDetail?.schedule || doctorDetail?.horario_atencion,
        acepta_seguro: doctorDetail?.acepta_seguro || doctorDetail?.accepts_insurance || false,
        created_at: doctorDetail?.created_at || profile.created_at || new Date().toISOString(),
        updated_at: doctorDetail?.updated_at || profile.updated_at || new Date().toISOString(),
        profile: {
          id: profile.id,
          nombre_completo: profile.nombre_completo,
          email: profile.email,
          avatar_url: profile.avatar_url,
        },
        specialty: doctorDetail?.specialty || {
          id: '',
          name: profile.sacs_especialidad || 'Medicina General',
          description: '',
          icon: 'stethoscope',
          created_at: new Date().toISOString(),
        },
      };
    }) || [];

    // Filtrar por especialidad si se especifica
    if (specialtyId) {
      console.log('🔍 Filtering by specialty:', specialtyId);
      doctors = doctors.filter(doc => {
        // Si tiene specialty_id en doctor_details, comparar con ese
        if (doc.specialty_id) {
          return doc.specialty_id === specialtyId;
        }
        // Si no, comparar con el ID temporal generado desde sacs_especialidad
        const tempId = `sacs-${doc.specialty.name.toLowerCase().replace(/\s+/g, '-')}`;
        return tempId === specialtyId;
      });
    }

    console.log('✅ Transformed doctors:', doctors.length, doctors);

    return { success: true, data: doctors as DoctorProfile[] };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener perfil de un doctor específico
export async function getDoctorProfile(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_details")
      .select(`
        *,
        specialty:specialties!doctor_details_especialidad_id_fkey(id, name, description, icon),
        profile:profiles!doctor_details_profile_id_fkey(id, nombre_completo, email, avatar_url)
      `)
      .eq("profile_id", doctorId)
      .single();

    if (error) throw error;

    const doctor = {
      id: data.profile_id,
      specialty_id: data.especialidad_id,
      license_number: data.licencia_medica,
      anos_experiencia: data.anos_experiencia,
      biografia: data.biografia,
      tarifa_consulta: data.tarifa_consulta ? parseFloat(data.tarifa_consulta) : undefined,
      consultation_duration: 30,
      verified: data.verified && data.sacs_verified,
      created_at: data.created_at,
      updated_at: data.updated_at,
      profile: {
        id: data.profile?.id,
        nombre_completo: data.profile?.nombre_completo,
        email: data.profile?.email,
        avatar_url: data.profile?.avatar_url,
      },
      specialty: data.specialty,
    };

    return { success: true, data: doctor as DoctorProfile };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return { success: false, error, data: null };
  }
}

// Obtener horarios de un doctor (desde doctor_details.horario_atencion)
export async function getDoctorSchedules(doctorId: string) {
  try {
    const { data, error} = await supabase
      .from("doctor_details")
      .select("horario_atencion")
      .eq("profile_id", doctorId)
      .single();

    if (error) throw error;
    
    // Convertir horario_atencion JSON a formato DoctorSchedule
    const schedules: DoctorSchedule[] = [];
    const horario = data?.horario_atencion as any;
    
    if (horario) {
      const dayMap: Record<string, number> = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6
      };
      
      Object.entries(horario).forEach(([day, time]) => {
        if (typeof time === 'string' && time.includes('-')) {
          const [start, end] = time.split('-');
          schedules.push({
            id: `${doctorId}-${day}`,
            doctor_id: doctorId,
            day_of_week: dayMap[day.toLowerCase()] || 0,
            start_time: start + ':00',
            end_time: end + ':00',
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      });
    }
    
    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener slots disponibles para un doctor en una fecha específica
export async function getAvailableTimeSlots(
  doctorId: string,
  date: string
): Promise<{ success: boolean; data: TimeSlot[]; error?: any }> {
  try {
    // Obtener el día de la semana (0-6)
    const dayOfWeek = new Date(date).getDay();

    // Obtener horarios del doctor para ese día
    const { data: schedules, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    if (scheduleError) throw scheduleError;

    if (!schedules || schedules.length === 0) {
      return { success: true, data: [] };
    }

    // Obtener citas existentes para ese día
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("appointment_time, duration, id")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (appointmentsError) throw appointmentsError;

    // Generar slots de tiempo
    const timeSlots: TimeSlot[] = [];
    const bookedTimes = new Set(
      appointments?.map((apt) => apt.appointment_time) || []
    );

    schedules.forEach((schedule) => {
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      const duration = 30; // minutos por slot

      let currentTime = startTime;
      while (currentTime < endTime) {
        const isBooked = bookedTimes.has(currentTime);
        timeSlots.push({
          time: currentTime,
          available: !isBooked,
          appointment_id: isBooked
            ? appointments?.find((apt) => apt.appointment_time === currentTime)?.id
            : undefined,
        });

        // Incrementar tiempo
        const [hours, minutes] = currentTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:00`;
      }
    });

    return { success: true, data: timeSlots };
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return { success: false, error, data: [] };
  }
}

// Crear una cita
export async function createAppointment(
  patientId: string,
  appointmentData: CreateAppointmentData
) {
  try {
    // Obtener precio del doctor
    const { data: doctor } = await getDoctorProfile(appointmentData.doctor_id);

    // Combinar fecha y hora para la tabla existente
    const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        paciente_id: patientId,
        medico_id: appointmentData.doctor_id,
        fecha_hora: fechaHora,
        duracion_minutos: doctor?.consultation_duration || 30,
        motivo: appointmentData.reason || '',
        status: "pendiente",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "appointment_created",
      description: `Cita creada con doctor para ${appointmentData.appointment_date}`,
      status: "success",
    });

    // Transformar respuesta al formato esperado
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      duration: data.duracion_minutos,
      status: data.status === 'pendiente' ? 'pending' : data.status === 'confirmada' ? 'confirmed' : data.status === 'completada' ? 'completed' : 'cancelled',
      consultation_type: appointmentData.consultation_type,
      reason: data.motivo,
      price: doctor?.tarifa_consulta,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error, data: null };
  }
}

// Obtener citas de un paciente
export async function getPatientAppointments(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq("paciente_id", patientId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;

    // Transformar datos al formato esperado
    const appointments = data?.map((apt: any) => {
      const fechaHora = new Date(apt.fecha_hora);
      return {
        id: apt.id,
        patient_id: apt.paciente_id,
        doctor_id: apt.medico_id,
        appointment_date: fechaHora.toISOString().split('T')[0],
        appointment_time: fechaHora.toTimeString().split(' ')[0],
        duration: apt.duracion_minutos,
        status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
        consultation_type: 'video' as const,
        reason: apt.motivo,
        notes: apt.notas,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        doctor: {
          id: apt.doctor?.id,
          verified: true,
          created_at: apt.created_at,
          updated_at: apt.updated_at,
          profile: {
            id: apt.doctor?.id,
            nombre_completo: apt.doctor?.nombre_completo,
            avatar_url: apt.doctor?.avatar_url,
          },
          specialty: { 
            id: '',
            name: 'Medicina General',
            created_at: apt.created_at,
          },
        },
      };
    }) || [];

    return { success: true, data: appointments as Appointment[] };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener citas de un doctor
export async function getDoctorAppointments(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_paciente_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        )
      `)
      .eq("medico_id", doctorId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;
    
    // Transformar datos
    const appointments = data?.map((apt: any) => {
      const fechaHora = new Date(apt.fecha_hora);
      return {
        id: apt.id,
        patient_id: apt.paciente_id,
        doctor_id: apt.medico_id,
        appointment_date: fechaHora.toISOString().split('T')[0],
        appointment_time: fechaHora.toTimeString().split(' ')[0],
        duration: apt.duracion_minutos,
        status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
        consultation_type: 'video' as const,
        reason: apt.motivo,
        notes: apt.notas,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        patient: apt.patient,
      };
    }) || [];
    
    return { success: true, data: appointments as Appointment[] };
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return { success: false, error, data: [] };
  }
}

// Cancelar una cita
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelada",
        notas: reason ? `Cancelada: ${reason}` : 'Cancelada',
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "appointment_cancelled",
      description: `Cita cancelada: ${appointmentId}`,
      status: "success",
    });

    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'cancelled',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error, data: null };
  }
}

// Confirmar una cita (doctor)
export async function confirmAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "confirmada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'confirmed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, error, data: null };
  }
}

// Completar una cita (doctor)
export async function completeAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "completada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'completed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return { success: false, error, data: null };
  }
}
