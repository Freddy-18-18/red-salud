-- Migration: Fix appointments schema by ensuring location_id and other fields exist
-- Date: 2026-01-31
-- Description: Consolidated fix for missing columns in appointments table

-- 1. Ensure doctor_locations table exists
CREATE TABLE IF NOT EXISTS doctor_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, 
  type TEXT NOT NULL CHECK (type IN ('consultorio', 'clinica', 'hospital')),
  address TEXT,
  phone TEXT,
  working_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for doctor_locations
ALTER TABLE doctor_locations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'doctor_locations' AND policyname = 'Doctors can manage their locations'
  ) THEN
    CREATE POLICY "Doctors can manage their locations" ON doctor_locations FOR ALL USING (auth.uid() = doctor_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'doctor_locations' AND policyname = 'Patients can view doctor locations'
  ) THEN
    CREATE POLICY "Patients can view doctor locations" ON doctor_locations FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 2. Add location_id to appointments if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN location_id UUID REFERENCES doctor_locations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Add other potentially missing columns from recent updates
DO $$ 
BEGIN
  -- Payment method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_method TEXT DEFAULT 'efectivo';
  END IF;
  
  -- Payment status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pendiente';
  END IF;
END $$;
