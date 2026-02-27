-- Add offline_patient_id column to medical_records table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'offline_patient_id') THEN
        ALTER TABLE medical_records ADD COLUMN offline_patient_id UUID REFERENCES offline_patients(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Make paciente_id nullable to support offline patients who don't have a profile yet
ALTER TABLE medical_records ALTER COLUMN paciente_id DROP NOT NULL;

-- Add a check constraint to ensure at least one patient reference exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medical_records_patient_check') THEN
        ALTER TABLE medical_records ADD CONSTRAINT medical_records_patient_check 
        CHECK (paciente_id IS NOT NULL OR offline_patient_id IS NOT NULL);
    END IF;
END $$;
