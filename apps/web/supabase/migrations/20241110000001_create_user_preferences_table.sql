-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Apariencia
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en', 'pt', 'fr', 'it')),
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  
  -- Regional
  timezone TEXT NOT NULL DEFAULT 'America/Caracas',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  time_format TEXT NOT NULL DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  measurement_system TEXT NOT NULL DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial')),
  
  -- Comunicación
  preferred_contact_method TEXT NOT NULL DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'sms', 'whatsapp', 'phone')),
  contact_phone TEXT,
  contact_whatsapp TEXT,
  preferred_contact_hours JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "18:00"}'::jsonb,
  
  -- Notificaciones
  desktop_notifications BOOLEAN NOT NULL DEFAULT true,
  sound_notifications BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  appointment_reminders BOOLEAN NOT NULL DEFAULT true,
  reminder_advance_time INTEGER NOT NULL DEFAULT 60,
  
  -- Suscripciones
  newsletter_subscribed BOOLEAN NOT NULL DEFAULT true,
  promotions_subscribed BOOLEAN NOT NULL DEFAULT false,
  surveys_subscribed BOOLEAN NOT NULL DEFAULT true,
  health_tips_subscribed BOOLEAN NOT NULL DEFAULT true,
  
  -- Privacidad
  profile_public BOOLEAN NOT NULL DEFAULT false,
  share_medical_history BOOLEAN NOT NULL DEFAULT true,
  show_profile_photo BOOLEAN NOT NULL DEFAULT true,
  share_location BOOLEAN NOT NULL DEFAULT false,
  anonymous_data_research BOOLEAN NOT NULL DEFAULT false,
  analytics_cookies BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at_trigger
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Create function to initialize preferences for new users
CREATE OR REPLACE FUNCTION initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-initialize preferences when user signs up
CREATE TRIGGER on_auth_user_created_initialize_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_preferences();
