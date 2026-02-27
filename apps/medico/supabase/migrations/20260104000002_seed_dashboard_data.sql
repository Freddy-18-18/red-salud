-- ============================================================================
-- Seed Data: Datos de prueba para el Dashboard Médico
-- Instrucciones: Ejecutar en el SQL Editor de Supabase
-- ============================================================================

DO $$
DECLARE
    v_doctor_id UUID;
    v_patient_id UUID;
    v_consultation_id UUID;
BEGIN
    -- 1. Obtener un ID de doctor (el usuario actual o el primero que encuentre)
    v_doctor_id := auth.uid();
    
    -- Fallback: Si no hay auth.uid(), tomar el primer perfil
    IF v_doctor_id IS NULL THEN
        SELECT id FROM profiles LIMIT 1 INTO v_doctor_id;
    END IF;

    -- 2. Obtener un ID de paciente
    SELECT id FROM profiles WHERE id != v_doctor_id LIMIT 1 INTO v_patient_id;

    -- Si no hay otros pacientes, usar el mismo doctor para demo
    IF v_patient_id IS NULL THEN
        v_patient_id := v_doctor_id;
    END IF;

    -- ========================================================================
    -- A. METAS MENSUALES (doctor_goals)
    -- ========================================================================
    INSERT INTO doctor_goals (doctor_id, year, month, target_appointments, target_new_patients, target_revenue, target_rating, current_appointments, current_new_patients, current_revenue, current_rating)
    VALUES (
        v_doctor_id,
        EXTRACT(YEAR FROM CURRENT_DATE),
        EXTRACT(MONTH FROM CURRENT_DATE),
        80, 15, 4000, 4.8, -- Targets
        32, 5, 1600, 4.9   -- Current
    )
    ON CONFLICT (doctor_id, year, month) DO UPDATE SET
        target_appointments = EXCLUDED.target_appointments,
        current_appointments = EXCLUDED.current_appointments;

    -- ========================================================================
    -- B. CUMPLEAÑOS (profiles)
    -- ========================================================================
    UPDATE profiles 
    SET fecha_nacimiento = (CURRENT_DATE + interval '2 days' - interval '30 years')::DATE
    WHERE id = v_patient_id;

    -- ========================================================================
    -- C. FEEDBACK DE PACIENTES (ratings + consultations)
    -- ========================================================================
    -- Crear una consulta para asociar la review
    INSERT INTO consultations (doctor_id, patient_id, status, consultation_date)
    VALUES (v_doctor_id, v_patient_id, 'completed', NOW() - interval '1 day')
    RETURNING id INTO v_consultation_id;

    INSERT INTO ratings (consultation_id, patient_id, rating, comment, created_at)
    VALUES
        (v_consultation_id, v_patient_id, 5, 'Excelente atención del doctor, muy claro en sus explicaciones.', NOW() - interval '1 day')
    ON CONFLICT DO NOTHING;

    -- ========================================================================
    -- D. RESULTADOS DE LABORATORIO (lab_orders)
    -- ========================================================================
    INSERT INTO lab_orders (medico_id, paciente_id, status, created_at)
    VALUES (v_doctor_id, v_patient_id, 'completed', NOW())
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Datos de prueba insertados correctamente para Doctor ID: %', v_doctor_id;

END $$;
