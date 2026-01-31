-- =====================================================
-- SCRIPT: Datos de Demo para Dashboard Clínica
-- Descripción: Crea clínica, sedes, áreas, recursos y datos de ejemplo
-- Fecha: 2026-01-12
-- INSTRUCCIONES: Ejecutar manualmente en Supabase SQL Editor
-- =====================================================

-- IMPORTANTE: Reemplazar 'YOUR_USER_ID' con tu UUID de usuario real
-- Puedes obtenerlo ejecutando: SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com';

DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID'; -- ⚠️ CAMBIAR ESTO
    v_clinic_id UUID;
    v_location_main_id UUID;
    v_location_branch_id UUID;
    v_area_emergency_id UUID;
    v_area_icu_id UUID;
    v_area_surgery_id UUID;
    v_area_general_id UUID;
BEGIN
    -- Crear clínica de demo
    INSERT INTO public.clinics (
        name, legal_name, tax_id, country, timezone, tier, 
        phone, email, website, created_by, metadata
    ) VALUES (
        'Hospital Demo Red Salud',
        'Hospital Demo Red Salud S.A. de C.V.',
        'DEMO-123456-ABC',
        'MEX',
        'America/Mexico_City',
        'professional',
        '+52 55 1234 5678',
        'contacto@hospitaldemo.mx',
        'https://hospitaldemo.mx',
        v_user_id,
        '{"demo": true, "currency": "MXN"}'::jsonb
    ) RETURNING id INTO v_clinic_id;

    -- Asignar rol de owner al usuario
    INSERT INTO public.clinic_roles (
        clinic_id, user_id, role, granted_by, status
    ) VALUES (
        v_clinic_id, v_user_id, 'owner', v_user_id, 'active'
    );

    -- Crear sede principal
    INSERT INTO public.clinic_locations (
        clinic_id, name, code, address, city, state, postal_code, country,
        latitude, longitude, phone, email, is_main, status,
        opening_hours, specialties
    ) VALUES (
        v_clinic_id,
        'Sede Centro',
        'DEMO-001',
        'Av. Reforma 123, Col. Centro',
        'Ciudad de México',
        'CDMX',
        '06600',
        'MEX',
        19.4326, -99.1332,
        '+52 55 1234 5678',
        'centro@hospitaldemo.mx',
        true,
        'active',
        '{
            "monday": [{"open": "08:00", "close": "20:00"}],
            "tuesday": [{"open": "08:00", "close": "20:00"}],
            "wednesday": [{"open": "08:00", "close": "20:00"}],
            "thursday": [{"open": "08:00", "close": "20:00"}],
            "friday": [{"open": "08:00", "close": "20:00"}],
            "saturday": [{"open": "09:00", "close": "14:00"}]
        }'::jsonb,
        ARRAY['Medicina General', 'Pediatría', 'Cirugía', 'Emergencias']
    ) RETURNING id INTO v_location_main_id;

    -- Crear sede sucursal
    INSERT INTO public.clinic_locations (
        clinic_id, name, code, address, city, state, postal_code, country,
        latitude, longitude, phone, email, is_main, status,
        specialties
    ) VALUES (
        v_clinic_id,
        'Sede Norte',
        'DEMO-002',
        'Av. Insurgentes Norte 456',
        'Ciudad de México',
        'CDMX',
        '07300',
        'MEX',
        19.4926, -99.1432,
        '+52 55 8765 4321',
        'norte@hospitaldemo.mx',
        false,
        'active',
        ARRAY['Medicina General', 'Cardiología']
    ) RETURNING id INTO v_location_branch_id;

    -- Crear planos de piso para Sede Centro
    INSERT INTO public.clinic_floor_plans (
        location_id, floor, plan_name, scale_meters_per_pixel, width_pixels, height_pixels
    ) VALUES 
        (v_location_main_id, 1, 'Planta Baja - Emergencias y Consultas', 0.05, 1200, 800),
        (v_location_main_id, 2, 'Primer Piso - Hospitalización', 0.05, 1200, 800),
        (v_location_main_id, 3, 'Segundo Piso - Quirófanos y UCI', 0.05, 1200, 800);

    -- Crear áreas para Sede Centro
    -- Área de Emergencias (Planta Baja)
    INSERT INTO public.clinic_areas (
        location_id, name, code, floor, department, color,
        map_x, map_y, map_width, map_height, capacity, status
    ) VALUES (
        v_location_main_id, 'Emergencias', 'EMRG-01', 1, 'Emergency',
        '#EF4444', 10, 10, 300, 200, 10, 'active'
    ) RETURNING id INTO v_area_emergency_id;

    -- Área de Consultas Externas (Planta Baja)
    INSERT INTO public.clinic_areas (
        location_id, name, code, floor, department, color,
        map_x, map_y, map_width, map_height, capacity, status
    ) VALUES (
        v_location_main_id, 'Consultas Externas', 'CONS-01', 1, 'Outpatient',
        '#3B82F6', 320, 10, 300, 200, 8, 'active'
    );

    -- Área de Hospitalización General (Piso 2)
    INSERT INTO public.clinic_areas (
        location_id, name, code, floor, department, color,
        map_x, map_y, map_width, map_height, capacity, status
    ) VALUES (
        v_location_main_id, 'Hospitalización General', 'HOSP-01', 2, 'Inpatient',
        '#10B981', 10, 10, 500, 300, 20, 'active'
    ) RETURNING id INTO v_area_general_id;

    -- Área de UCI (Piso 3)
    INSERT INTO public.clinic_areas (
        location_id, name, code, floor, department, color,
        map_x, map_y, map_width, map_height, capacity, status
    ) VALUES (
        v_location_main_id, 'Unidad de Cuidados Intensivos', 'UCI-01', 3, 'ICU',
        '#F59E0B', 10, 10, 300, 250, 12, 'active'
    ) RETURNING id INTO v_area_icu_id;

    -- Área de Quirófanos (Piso 3)
    INSERT INTO public.clinic_areas (
        location_id, name, code, floor, department, color,
        map_x, map_y, map_width, map_height, capacity, status
    ) VALUES (
        v_location_main_id, 'Quirófanos', 'QRFN-01', 3, 'Surgery',
        '#8B5CF6', 320, 10, 280, 250, 4, 'active'
    ) RETURNING id INTO v_area_surgery_id;

    -- Crear recursos: Camas de Emergencias
    FOR i IN 1..6 LOOP
        INSERT INTO public.clinic_resources (
            location_id, type, name, code, department, area_id,
            capacity, status, cost_per_hour,
            floor, position_x, position_y, width, height
        ) VALUES (
            v_location_main_id,
            'bed',
            'Cama Emergencias ' || i,
            'EMR-BED-' || LPAD(i::TEXT, 3, '0'),
            'Emergency',
            v_area_emergency_id,
            1,
            CASE WHEN i <= 3 THEN 'occupied' ELSE 'available' END,
            50.00,
            1,
            20 + ((i-1) % 3) * 90,
            30 + ((i-1) / 3) * 80,
            2.0,
            1.0
        );
    END LOOP;

    -- Crear recursos: Camas UCI
    FOR i IN 1..8 LOOP
        INSERT INTO public.clinic_resources (
            location_id, type, name, code, department, area_id,
            capacity, status, cost_per_hour,
            floor, position_x, position_y, width, height
        ) VALUES (
            v_location_main_id,
            'bed',
            'Cama UCI ' || i,
            'UCI-BED-' || LPAD(i::TEXT, 3, '0'),
            'ICU',
            v_area_icu_id,
            1,
            CASE WHEN i <= 5 THEN 'occupied' ELSE 'available' END,
            150.00,
            3,
            20 + ((i-1) % 4) * 70,
            30 + ((i-1) / 4) * 100,
            2.5,
            1.2
        );
    END LOOP;

    -- Crear recursos: Camas Hospitalización General
    FOR i IN 1..15 LOOP
        INSERT INTO public.clinic_resources (
            location_id, type, name, code, department, area_id,
            capacity, status, cost_per_hour,
            floor, position_x, position_y, width, height
        ) VALUES (
            v_location_main_id,
            'bed',
            'Cama General ' || i,
            'GNR-BED-' || LPAD(i::TEXT, 3, '0'),
            'Inpatient',
            v_area_general_id,
            1,
            CASE WHEN i <= 8 THEN 'occupied' ELSE 'available' END,
            75.00,
            2,
            20 + ((i-1) % 5) * 95,
            30 + ((i-1) / 5) * 95,
            2.0,
            1.0
        );
    END LOOP;

    -- Crear recursos: Quirófanos
    FOR i IN 1..4 LOOP
        INSERT INTO public.clinic_resources (
            location_id, type, name, code, department, area_id,
            capacity, status, cost_per_hour,
            floor, position_x, position_y, width, height
        ) VALUES (
            v_location_main_id,
            'operating_room',
            'Quirófano ' || i,
            'OPR-' || LPAD(i::TEXT, 3, '0'),
            'Surgery',
            v_area_surgery_id,
            1,
            CASE WHEN i = 1 THEN 'occupied' WHEN i = 2 THEN 'reserved' ELSE 'available' END,
            500.00,
            3,
            330 + ((i-1) % 2) * 130,
            30 + ((i-1) / 2) * 110,
            5.0,
            4.0
        );
    END LOOP;

    -- Crear recursos: Consultorios
    FOR i IN 1..6 LOOP
        INSERT INTO public.clinic_resources (
            location_id, type, name, code, department,
            capacity, status, cost_per_hour,
            floor, position_x, position_y
        ) VALUES (
            v_location_main_id,
            'consultation_room',
            'Consultorio ' || i,
            'CONS-' || LPAD(i::TEXT, 3, '0'),
            'Outpatient',
            1,
            CASE WHEN i <= 4 THEN 'occupied' ELSE 'available' END,
            30.00,
            1,
            330 + ((i-1) % 3) * 95,
            30 + ((i-1) / 3) * 85
        );
    END LOOP;

    -- Crear inventario de ejemplo
    INSERT INTO public.clinic_inventory (
        location_id, product_code, product_name, category,
        unit_of_measure, current_stock, minimum_stock, maximum_stock,
        unit_cost, currency, is_shared, status
    ) VALUES 
        (v_location_main_id, 'MED-001', 'Paracetamol 500mg', 'medication', 'tablet', 5000, 1000, 10000, 0.50, 'MXN', false, 'active'),
        (v_location_main_id, 'MED-002', 'Amoxicilina 500mg', 'medication', 'capsule', 3000, 800, 8000, 2.50, 'MXN', false, 'active'),
        (v_location_main_id, 'MED-003', 'Ibuprofeno 400mg', 'medication', 'tablet', 4500, 1000, 10000, 0.75, 'MXN', false, 'active'),
        (v_location_main_id, 'SUP-001', 'Guantes Nitrilo M', 'supplies', 'box', 250, 50, 500, 15.00, 'MXN', true, 'active'),
        (v_location_main_id, 'SUP-002', 'Jeringas 10ml', 'supplies', 'unit', 1200, 300, 3000, 1.20, 'MXN', true, 'active'),
        (v_location_main_id, 'SUP-003', 'Gasas Estériles', 'supplies', 'pack', 800, 200, 2000, 3.50, 'MXN', false, 'active'),
        (v_location_main_id, 'EQP-001', 'Mascarilla N95', 'equipment', 'unit', 500, 100, 1000, 8.00, 'MXN', false, 'active');

    -- Crear algunos turnos de personal de ejemplo (últimos 7 días)
    FOR i IN 0..6 LOOP
        -- Turno de enfermería matutino
        INSERT INTO public.clinic_staff_shifts (
            location_id, staff_id, staff_role, shift_date, start_time, end_time, status
        ) VALUES (
            v_location_main_id, v_user_id, 'nurse', 
            CURRENT_DATE - i, '08:00', '16:00',
            CASE WHEN i = 0 THEN 'active' WHEN i = 1 THEN 'scheduled' ELSE 'completed' END
        );
        
        -- Turno de enfermería vespertino
        INSERT INTO public.clinic_staff_shifts (
            location_id, staff_id, staff_role, shift_date, start_time, end_time, status
        ) VALUES (
            v_location_main_id, v_user_id, 'nurse', 
            CURRENT_DATE - i, '16:00', '00:00',
            CASE WHEN i <= 1 THEN 'scheduled' ELSE 'completed' END
        );
    END LOOP;

    -- Crear métricas operacionales de los últimos 30 días
    FOR i IN 0..29 LOOP
        INSERT INTO public.clinic_operational_metrics (
            location_id, metric_date,
            total_appointments, completed_appointments, cancelled_appointments, no_show_appointments,
            average_wait_time_minutes, occupancy_rate, revenue_amount, patient_count, emergency_count
        ) VALUES (
            v_location_main_id,
            CURRENT_DATE - i,
            FLOOR(RANDOM() * 50 + 30)::INT,
            FLOOR(RANDOM() * 40 + 25)::INT,
            FLOOR(RANDOM() * 5)::INT,
            FLOOR(RANDOM() * 3)::INT,
            FLOOR(RANDOM() * 30 + 15)::INT,
            ROUND((RANDOM() * 30 + 60)::NUMERIC, 2),
            ROUND((RANDOM() * 50000 + 30000)::NUMERIC, 2),
            FLOOR(RANDOM() * 45 + 25)::INT,
            FLOOR(RANDOM() * 8 + 2)::INT
        );
    END LOOP;

    RAISE NOTICE 'Datos de demo creados exitosamente!';
    RAISE NOTICE 'Clinic ID: %', v_clinic_id;
    RAISE NOTICE 'Main Location ID: %', v_location_main_id;
    RAISE NOTICE 'Branch Location ID: %', v_location_branch_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Navega a: /dashboard/clinica/%', v_clinic_id;

END $$;
