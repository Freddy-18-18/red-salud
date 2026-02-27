-- Migration to fix missing tables used in the application
-- messages_new and telemedicine_sessions

-- 1. Create messages_new table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for messages_new
ALTER TABLE public.messages_new ENABLE ROW LEVEL SECURITY;

-- Policies for messages_new
CREATE POLICY "Users can view their own messages" ON public.messages_new
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = messages_new.conversation_id 
            AND (participant_id = auth.uid() OR participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages" ON public.messages_new
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 2. Create telemedicine_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id UUID NOT NULL REFERENCES auth.users(id),
    channel_name TEXT NOT NULL,
    token TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for telemedicine_sessions
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for telemedicine_sessions
CREATE POLICY "Users can view their own sessions" ON public.telemedicine_sessions
    FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Doctors can create and update sessions" ON public.telemedicine_sessions
    FOR ALL USING (auth.uid() = doctor_id);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_new_conversation ON public.messages_new(conversation_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_appointment ON public.telemedicine_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_doctor ON public.telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_patient ON public.telemedicine_sessions(patient_id);
