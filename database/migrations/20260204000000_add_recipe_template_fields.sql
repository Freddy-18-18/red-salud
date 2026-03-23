-- Comprehensive migration for recipe settings
-- Run this in the Supabase SQL Editor if you have permission issues

CREATE TABLE IF NOT EXISTS doctor_recipe_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    clinic_name TEXT,
    clinic_address TEXT,
    clinic_phone TEXT,
    clinic_email TEXT,
    use_digital_signature BOOLEAN DEFAULT FALSE,
    digital_signature_url TEXT,
    use_logo BOOLEAN DEFAULT FALSE,
    logo_url TEXT,
    template_id TEXT DEFAULT 'plantilla-3',
    frame_color TEXT DEFAULT '#0da9f7',
    selected_watermark_url TEXT,
    watermark_config JSONB DEFAULT '{"enabled": false, "opacity": 10, "text": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already there
ALTER TABLE doctor_recipe_settings ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'plantilla-3';
ALTER TABLE doctor_recipe_settings ADD COLUMN IF NOT EXISTS frame_color TEXT DEFAULT '#0da9f7';
ALTER TABLE doctor_recipe_settings ADD COLUMN IF NOT EXISTS selected_watermark_url TEXT;
ALTER TABLE doctor_recipe_settings ADD COLUMN IF NOT EXISTS watermark_config JSONB DEFAULT '{"enabled": false, "opacity": 10, "text": ""}'::jsonb;

-- Typical RLS Setup
ALTER TABLE doctor_recipe_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipe settings" 
ON doctor_recipe_settings FOR SELECT 
USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can update their own recipe settings" 
ON doctor_recipe_settings FOR UPDATE 
USING ((select auth.uid()) = doctor_id);

CREATE POLICY "Users can insert their own recipe settings" 
ON doctor_recipe_settings FOR INSERT 
WITH CHECK ((select auth.uid()) = doctor_id);
