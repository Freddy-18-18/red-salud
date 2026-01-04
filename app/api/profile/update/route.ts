import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { userId, ...profileData } = data;

    console.log("📥 Datos recibidos en backend:", {
      userId,
      cedula: profileData.cedula,
      cneEstado: profileData.cneEstado,
      cneMunicipio: profileData.cneMunicipio,
      hasCneData: !!(profileData.cneEstado || profileData.cneMunicipio),
    });

    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (userId !== user.id) {
      return NextResponse.json(
        { error: true, message: "No autorizado" },
        { status: 403 }
      );
    }

    // Verificar si la cédula ya está anclada
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("cedula_verificada, cedula, nombre_completo, cedula_photo_verified, cne_estado, fecha_nacimiento")
      .eq("id", user.id)
      .single() as { data: any };

    // Si la cédula ya está anclada, no permitir cambios en cédula, nombre ni fecha de nacimiento
    if (currentProfile?.cedula_verificada) {
      if (profileData.cedula && profileData.cedula !== currentProfile.cedula) {
        return NextResponse.json(
          {
            error: true,
            message: "No puedes cambiar tu cédula porque ya está anclada a tu cuenta.",
          },
          { status: 403 }
        );
      }
      if (profileData.nombre && profileData.nombre !== currentProfile.nombre_completo) {
        return NextResponse.json(
          {
            error: true,
            message: "No puedes cambiar tu nombre porque tu cédula ya está anclada.",
          },
          { status: 403 }
        );
      }
      if (profileData.fechaNacimiento && profileData.fechaNacimiento !== currentProfile.fecha_nacimiento) {
        return NextResponse.json(
          {
            error: true,
            message: "No puedes cambiar tu fecha de nacimiento porque tu cédula ya está anclada.",
          },
          { status: 403 }
        );
      }
    }

    // Validar campos requeridos
    const missingFields = [];
    if (!profileData.nombre) missingFields.push("nombre");
    if (!profileData.telefono) missingFields.push("teléfono");
    if (!profileData.cedula) missingFields.push("cédula");
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: true, 
          message: `Faltan campos requeridos: ${missingFields.join(", ")}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validar formato de cédula
    if (!/^[VE]-\d{6,8}$/.test(profileData.cedula)) {
      return NextResponse.json(
        { error: true, message: "Formato de cédula inválido. Debe ser V-12345678 o E-12345678" },
        { status: 400 }
      );
    }

    // Validar formato de teléfono
    if (profileData.telefono && !/^\+58\s\d{3}\s\d{3}\s\d{4}$/.test(profileData.telefono)) {
      return NextResponse.json(
        { error: true, message: "Formato de teléfono inválido. Debe ser +58 412 123 4567" },
        { status: 400 }
      );
    }

    // Validar teléfono duplicado (solo si no está vacío)
    if (profileData.telefono && profileData.telefono.trim() !== "" && profileData.telefono !== "+58 ") {
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from("profiles")
        .select("id, nombre_completo")
        .eq("telefono", profileData.telefono)
        .neq("id", user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      // Ignorar error 406 (Not Acceptable)
      if (phoneCheckError && phoneCheckError.code !== "PGRST116") {
        console.log("Error checking phone (ignorado):", phoneCheckError);
      }

      if (existingPhone) {
        return NextResponse.json(
          {
            error: true,
            message: "Este número de teléfono ya está registrado en otra cuenta.",
            code: "TELEFONO_DUPLICADO",
          },
          { status: 409 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      nombre_completo: profileData.nombre,
      telefono: profileData.telefono || "",
      cedula: profileData.cedula,
      fecha_nacimiento: profileData.fechaNacimiento || null,
      direccion: profileData.direccion || "",
      ciudad: profileData.ciudad || "",
      estado: profileData.estado || "",
      codigo_postal: profileData.codigoPostal || null,
      updated_at: new Date().toISOString(),
    };

    // Agregar campos CNE si existen
    if (profileData.cneEstado) {
      updateData.cne_estado = profileData.cneEstado;
    }
    if (profileData.cneMunicipio) {
      updateData.cne_municipio = profileData.cneMunicipio;
    }
    if (profileData.cneParroquia) {
      updateData.cne_parroquia = profileData.cneParroquia;
    }
    if (profileData.cneCentroElectoral) {
      updateData.cne_centro_electoral = profileData.cneCentroElectoral;
    }
    if (profileData.rif) {
      updateData.rif = profileData.rif;
    }
    if (profileData.nacionalidad) {
      updateData.nacionalidad = profileData.nacionalidad;
    }
    if (profileData.primerNombre) {
      updateData.primer_nombre = profileData.primerNombre;
    }
    if (profileData.segundoNombre) {
      updateData.segundo_nombre = profileData.segundoNombre;
    }
    if (profileData.primerApellido) {
      updateData.primer_apellido = profileData.primerApellido;
    }
    if (profileData.segundoApellido) {
      updateData.segundo_apellido = profileData.segundoApellido;
    }

    // Si hay datos CNE en el request, guardarlos (opcional)
    if (profileData.cneEstado && profileData.cneMunicipio) {
      console.log("✅ Datos CNE recibidos, se guardarán como información adicional");
    }
    
    // Anclar cédula si se está guardando por primera vez y no estaba anclada antes
    // La cédula se ancla siempre que se guarde, independientemente de si tiene datos CNE
    if (profileData.cedula && !currentProfile?.cedula_verificada) {
      updateData.cedula_verificada = true;
      updateData.cedula_verified_at = new Date().toISOString();
      
      // Calcular fecha límite para subir foto (30 días)
      const photoDeadline = new Date();
      photoDeadline.setDate(photoDeadline.getDate() + 30);
      updateData.photo_upload_deadline = photoDeadline.toISOString();
      
      console.log("✅ Cédula anclada correctamente");
    }

    // Verificación de foto
    if (profileData.photoVerified && !currentProfile?.cedula_photo_verified) {
      updateData.cedula_photo_verified = true;
      updateData.cedula_photo_verified_at = new Date().toISOString();
      updateData.photo_upload_deadline = null; // Ya no hay deadline
    }

    if (profileData.diditRequestId) {
      updateData.didit_request_id = profileData.diditRequestId;
    }

    // Actualizar perfil
    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: true, message: "Error al actualizar el perfil" },
        { status: 500 }
      );
    }

    // Actualizar información médica - siempre intentar actualizar si hay algún campo
    const medicalUpdateData: any = {
      profile_id: user.id,
      updated_at: new Date().toISOString(),
    };

    // Campos básicos
    if (profileData.tipoSangre) medicalUpdateData.grupo_sanguineo = profileData.tipoSangre;
    if (profileData.peso) medicalUpdateData.peso_kg = parseFloat(profileData.peso);
    if (profileData.altura) medicalUpdateData.altura_cm = parseInt(profileData.altura);
    
    // Alergias
    if (profileData.alergias !== undefined && profileData.alergias !== null) {
      if (typeof profileData.alergias === 'string') {
        const trimmed = profileData.alergias.trim();
        medicalUpdateData.alergias = trimmed ? trimmed.split(',').map((a: string) => a.trim()).filter(Boolean) : [];
      } else {
        medicalUpdateData.alergias = profileData.alergias;
      }
    }
    if (profileData.condicionesCronicas !== undefined && profileData.condicionesCronicas !== null) {
      if (typeof profileData.condicionesCronicas === 'string') {
        const trimmed = profileData.condicionesCronicas.trim();
        medicalUpdateData.enfermedades_cronicas = trimmed ? trimmed.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
      } else {
        medicalUpdateData.enfermedades_cronicas = profileData.condicionesCronicas;
      }
    }
    
    if (profileData.medicamentosActuales !== undefined) medicalUpdateData.medicamentos_actuales = profileData.medicamentosActuales;
    if (profileData.cirugiasPrevias !== undefined) medicalUpdateData.cirugias_previas = profileData.cirugiasPrevias;
    
    // Contacto de emergencia - siempre actualizar si están presentes
    if (profileData.contactoEmergencia !== undefined) {
      medicalUpdateData.contacto_emergencia_nombre = profileData.contactoEmergencia || null;
    }
    if (profileData.telefonoEmergencia !== undefined) {
      medicalUpdateData.contacto_emergencia_telefono = profileData.telefonoEmergencia || null;
    }
    if (profileData.relacionEmergencia !== undefined) {
      medicalUpdateData.contacto_emergencia_relacion = profileData.relacionEmergencia || null;
    }
    
    // Campos médicos expandidos
    if (profileData.sexoBiologico) medicalUpdateData.sexo_biologico = profileData.sexoBiologico;
    if (profileData.perimetroCintura) medicalUpdateData.perimetro_cintura_cm = parseInt(profileData.perimetroCintura);
    if (profileData.presionSistolica) medicalUpdateData.presion_arterial_sistolica = parseInt(profileData.presionSistolica);
    if (profileData.presionDiastolica) medicalUpdateData.presion_arterial_diastolica = parseInt(profileData.presionDiastolica);
    if (profileData.frecuenciaCardiaca) medicalUpdateData.frecuencia_cardiaca = parseInt(profileData.frecuenciaCardiaca);
    
    // Campos específicos para mujeres
    if (profileData.embarazada !== undefined) medicalUpdateData.embarazada = profileData.embarazada;
    if (profileData.lactancia !== undefined) medicalUpdateData.lactancia = profileData.lactancia;
    if (profileData.fechaUltimaMenstruacion) medicalUpdateData.fecha_ultima_menstruacion = profileData.fechaUltimaMenstruacion;
    if (profileData.usaAnticonceptivos !== undefined) medicalUpdateData.usa_anticonceptivos = profileData.usaAnticonceptivos;
    if (profileData.tipoAnticonceptivo) medicalUpdateData.tipo_anticonceptivo = profileData.tipoAnticonceptivo;
    if (profileData.embarazosPrevios) medicalUpdateData.embarazos_previos = parseInt(profileData.embarazosPrevios);
    
    // Alergias expandidas
    if (profileData.alergiasAlimentarias) medicalUpdateData.alergias_alimentarias = profileData.alergiasAlimentarias;
    if (profileData.otrasAlergias) medicalUpdateData.otras_alergias = profileData.otrasAlergias;
    
    // Condiciones
    if (profileData.condicionesMentales) medicalUpdateData.condiciones_mentales = profileData.condicionesMentales;
    if (profileData.discapacidades) medicalUpdateData.discapacidades = profileData.discapacidades;
    
    // Medicamentos y tratamientos
    if (profileData.suplementos) medicalUpdateData.suplementos = profileData.suplementos;
    if (profileData.tratamientosActuales) medicalUpdateData.tratamientos_actuales = profileData.tratamientosActuales;
    
    // Hábitos
    if (profileData.fuma) medicalUpdateData.fuma = profileData.fuma;
    if (profileData.cigarrillosPorDia) medicalUpdateData.cigarrillos_por_dia = parseInt(profileData.cigarrillosPorDia);
    if (profileData.exFumadorDesde) medicalUpdateData.ex_fumador_desde = profileData.exFumadorDesde;
    if (profileData.consumeAlcohol) medicalUpdateData.consume_alcohol = profileData.consumeAlcohol;
    if (profileData.frecuenciaAlcohol) medicalUpdateData.frecuencia_alcohol = profileData.frecuenciaAlcohol;
    if (profileData.actividadFisica) medicalUpdateData.actividad_fisica = profileData.actividadFisica;
    if (profileData.horasEjercicioSemanal) medicalUpdateData.horas_ejercicio_semanal = parseFloat(profileData.horasEjercicioSemanal);
    if (profileData.horasSuenoPromedio) medicalUpdateData.horas_sueno_promedio = parseFloat(profileData.horasSuenoPromedio);
    
    // Otros
    if (profileData.dispositivosMedicos) medicalUpdateData.dispositivos_medicos = profileData.dispositivosMedicos;
    if (profileData.donanteOrganos) medicalUpdateData.donante_organos = profileData.donanteOrganos;
    if (profileData.observacionesAdicionales) medicalUpdateData.observaciones_adicionales = profileData.observacionesAdicionales;

    console.log("📋 Datos médicos a guardar:", {
      contacto_emergencia_nombre: medicalUpdateData.contacto_emergencia_nombre,
      contacto_emergencia_telefono: medicalUpdateData.contacto_emergencia_telefono,
      contacto_emergencia_relacion: medicalUpdateData.contacto_emergencia_relacion,
    });

    const { error: medicalError } = await supabase
      .from("patient_details")
      .upsert(medicalUpdateData, {
        onConflict: "profile_id",
      });

    if (medicalError) {
      console.error("❌ Error updating medical data:", medicalError);
      // No retornamos error, solo logueamos
    } else {
      console.log("✅ Datos médicos guardados correctamente");
    }

    // Registrar actividad
    await supabase.from("user_activity_log").insert({
      user_id: user.id,
      activity_type: "profile_update",
      description: "Perfil actualizado",
      status: "success",
    });

    return NextResponse.json({
      error: false,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error("Error in profile update:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
