-- Migration: Fix Security and Performance Issues
-- Date: 2025-11-05
-- Description: Fixes RLS, search_path, auth.uid() performance, and duplicate indexes

-- ============================================================================
-- 1. CRITICAL: Enable RLS on lab_order_status_history
-- ============================================================================
ALTER TABLE public.lab_order_status_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for lab_order_status_history
CREATE POLICY "Users can view status history from their orders"
  ON public.lab_order_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders
      WHERE lab_orders.id = lab_order_status_history.order_id
      AND lab_orders.paciente_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "System can insert status history"
  ON public.lab_order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 2. Fix search_path for all functions (SECURITY)
-- ============================================================================

-- Fix update_medications_updated_at
ALTER FUNCTION public.update_medications_updated_at() SET search_path = '';

-- Fix update_health_metrics_updated_at
ALTER FUNCTION public.update_health_metrics_updated_at() SET search_path = '';

-- Fix update_telemedicine_updated_at
ALTER FUNCTION public.update_telemedicine_updated_at() SET search_path = '';

-- Fix calculate_session_duration
ALTER FUNCTION public.calculate_session_duration() SET search_path = '';

-- Fix calculate_wait_time
ALTER FUNCTION public.calculate_wait_time() SET search_path = '';

-- Fix update_verifications_updated_at
ALTER FUNCTION public.update_verifications_updated_at() SET search_path = '';

-- Fix update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- ============================================================================
-- 3. Fix auth.uid() performance in RLS policies (PERFORMANCE)
-- ============================================================================

-- Drop and recreate profiles policies with optimized auth.uid()
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "system_can_insert_profiles" ON public.profiles;

CREATE POLICY "users_can_view_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_can_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "system_can_insert_profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- Fix patient_documents policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.patient_documents;

CREATE POLICY "Users can view their own documents"
  ON public.patient_documents FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own documents"
  ON public.patient_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own documents"
  ON public.patient_documents FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own documents"
  ON public.patient_documents FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix user_activity_log policies
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity_log FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix user_sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix payment_methods policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own payment methods"
  ON public.payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix user_preferences policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

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
  USING (user_id = (SELECT auth.uid()));

-- Fix privacy_settings policies
DROP POLICY IF EXISTS "Users can view their own privacy settings" ON public.privacy_settings;
DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON public.privacy_settings;
DROP POLICY IF EXISTS "Users can update their own privacy settings" ON public.privacy_settings;

CREATE POLICY "Users can view their own privacy settings"
  ON public.privacy_settings FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own privacy settings"
  ON public.privacy_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own privacy settings"
  ON public.privacy_settings FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix notification_settings policies
DROP POLICY IF EXISTS "Users can view their own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON public.notification_settings;

CREATE POLICY "Users can view their own notification settings"
  ON public.notification_settings FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own notification settings"
  ON public.notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notification settings"
  ON public.notification_settings FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix prescriptions policies
DROP POLICY IF EXISTS "Pacientes ven sus prescripciones" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctores ven prescripciones que crearon" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctores crean prescripciones" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctores actualizan sus prescripciones" ON public.prescriptions;

-- Combine SELECT policies into one for better performance
CREATE POLICY "Ver prescripciones propias"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (
    paciente_id = (SELECT auth.uid()) OR 
    medico_id = (SELECT auth.uid())
  );

CREATE POLICY "Doctores crean prescripciones"
  ON public.prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    medico_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'doctor')
  );

CREATE POLICY "Doctores actualizan sus prescripciones"
  ON public.prescriptions FOR UPDATE
  TO authenticated
  USING (medico_id = (SELECT auth.uid()));

-- Fix prescription_medications policies
DROP POLICY IF EXISTS "Ver medicamentos de prescripciones accesibles" ON public.prescription_medications;
DROP POLICY IF EXISTS "Doctores agregan medicamentos a prescripciones" ON public.prescription_medications;

CREATE POLICY "Ver medicamentos de prescripciones accesibles"
  ON public.prescription_medications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions
      WHERE prescriptions.id = prescription_medications.prescription_id
      AND (prescriptions.paciente_id = (SELECT auth.uid()) OR prescriptions.medico_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Doctores agregan medicamentos a prescripciones"
  ON public.prescription_medications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prescriptions
      WHERE prescriptions.id = prescription_medications.prescription_id
      AND prescriptions.medico_id = (SELECT auth.uid())
    )
  );

-- Fix medication_reminders policies - combine duplicates
DROP POLICY IF EXISTS "Pacientes ven sus recordatorios" ON public.medication_reminders;
DROP POLICY IF EXISTS "Pacientes gestionan sus recordatorios" ON public.medication_reminders;

CREATE POLICY "Pacientes gestionan sus recordatorios"
  ON public.medication_reminders FOR ALL
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()))
  WITH CHECK (paciente_id = (SELECT auth.uid()));

-- Fix medication_intake_log policies - combine duplicates
DROP POLICY IF EXISTS "Pacientes ven su registro de tomas" ON public.medication_intake_log;
DROP POLICY IF EXISTS "Pacientes registran sus tomas" ON public.medication_intake_log;

CREATE POLICY "Pacientes gestionan su registro de tomas"
  ON public.medication_intake_log FOR ALL
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()))
  WITH CHECK (paciente_id = (SELECT auth.uid()));

-- Fix health_metrics policies
DROP POLICY IF EXISTS "Pacientes ven sus métricas" ON public.health_metrics;
DROP POLICY IF EXISTS "Pacientes registran sus métricas" ON public.health_metrics;
DROP POLICY IF EXISTS "Pacientes actualizan sus métricas" ON public.health_metrics;
DROP POLICY IF EXISTS "Pacientes eliminan sus métricas" ON public.health_metrics;

CREATE POLICY "Pacientes gestionan sus métricas"
  ON public.health_metrics FOR ALL
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()))
  WITH CHECK (paciente_id = (SELECT auth.uid()));

-- Fix health_goals policies
DROP POLICY IF EXISTS "Pacientes gestionan sus metas" ON public.health_goals;

CREATE POLICY "Pacientes gestionan sus metas"
  ON public.health_goals FOR ALL
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()))
  WITH CHECK (paciente_id = (SELECT auth.uid()));

-- Fix measurement_reminders policies
DROP POLICY IF EXISTS "Pacientes gestionan sus recordatorios de medición" ON public.measurement_reminders;

CREATE POLICY "Pacientes gestionan sus recordatorios de medición"
  ON public.measurement_reminders FOR ALL
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()))
  WITH CHECK (paciente_id = (SELECT auth.uid()));

-- Fix conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Patients can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR doctor_id = (SELECT auth.uid()));

CREATE POLICY "Patients can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR doctor_id = (SELECT auth.uid()));

-- Fix messages_new policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages_new;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages_new;
DROP POLICY IF EXISTS "Users can update messages" ON public.messages_new;

CREATE POLICY "Users can view their messages"
  ON public.messages_new FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages_new.conversation_id
      AND (conversations.patient_id = (SELECT auth.uid()) OR conversations.doctor_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can create messages"
  ON public.messages_new FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages_new.conversation_id
      AND (conversations.patient_id = (SELECT auth.uid()) OR conversations.doctor_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update messages"
  ON public.messages_new FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT auth.uid()));

-- Fix lab_orders policies
DROP POLICY IF EXISTS "Patients can view their orders" ON public.lab_orders;

CREATE POLICY "Patients can view their orders"
  ON public.lab_orders FOR SELECT
  TO authenticated
  USING (paciente_id = (SELECT auth.uid()));

-- Fix lab_order_tests policies
DROP POLICY IF EXISTS "Users can view tests from their orders" ON public.lab_order_tests;

CREATE POLICY "Users can view tests from their orders"
  ON public.lab_order_tests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders
      WHERE lab_orders.id = lab_order_tests.order_id
      AND lab_orders.paciente_id = (SELECT auth.uid())
    )
  );

-- Fix lab_results policies
DROP POLICY IF EXISTS "Users can view results from their orders" ON public.lab_results;

CREATE POLICY "Users can view results from their orders"
  ON public.lab_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders
      WHERE lab_orders.id = lab_results.order_id
      AND lab_orders.paciente_id = (SELECT auth.uid())
    )
  );

-- Fix lab_result_values policies
DROP POLICY IF EXISTS "Users can view result values" ON public.lab_result_values;

CREATE POLICY "Users can view result values"
  ON public.lab_result_values FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_results
      JOIN public.lab_orders ON lab_orders.id = lab_results.order_id
      WHERE lab_results.id = lab_result_values.result_id
      AND lab_orders.paciente_id = (SELECT auth.uid())
    )
  );

-- Fix telemedicine_sessions policies
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias sesiones" ON public.telemedicine_sessions;
DROP POLICY IF EXISTS "Doctores pueden crear sesiones" ON public.telemedicine_sessions;
DROP POLICY IF EXISTS "Participantes pueden actualizar sesiones" ON public.telemedicine_sessions;

CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON public.telemedicine_sessions FOR SELECT
  TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR doctor_id = (SELECT auth.uid()));

CREATE POLICY "Doctores pueden crear sesiones"
  ON public.telemedicine_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'doctor')
  );

CREATE POLICY "Participantes pueden actualizar sesiones"
  ON public.telemedicine_sessions FOR UPDATE
  TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR doctor_id = (SELECT auth.uid()));

-- Fix telemedicine_participants policies
DROP POLICY IF EXISTS "Usuarios pueden ver participantes de sus sesiones" ON public.telemedicine_participants;
DROP POLICY IF EXISTS "Participantes pueden actualizar su estado" ON public.telemedicine_participants;

CREATE POLICY "Usuarios pueden ver participantes de sus sesiones"
  ON public.telemedicine_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telemedicine_sessions
      WHERE telemedicine_sessions.id = telemedicine_participants.session_id
      AND (telemedicine_sessions.patient_id = (SELECT auth.uid()) OR telemedicine_sessions.doctor_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Participantes pueden actualizar su estado"
  ON public.telemedicine_participants FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Fix telemedicine_chat_messages policies
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus sesiones" ON public.telemedicine_chat_messages;
DROP POLICY IF EXISTS "Participantes pueden enviar mensajes" ON public.telemedicine_chat_messages;

CREATE POLICY "Usuarios pueden ver mensajes de sus sesiones"
  ON public.telemedicine_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telemedicine_sessions
      WHERE telemedicine_sessions.id = telemedicine_chat_messages.session_id
      AND (telemedicine_sessions.patient_id = (SELECT auth.uid()) OR telemedicine_sessions.doctor_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Participantes pueden enviar mensajes"
  ON public.telemedicine_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.telemedicine_sessions
      WHERE telemedicine_sessions.id = telemedicine_chat_messages.session_id
      AND (telemedicine_sessions.patient_id = (SELECT auth.uid()) OR telemedicine_sessions.doctor_id = (SELECT auth.uid()))
    )
  );

-- Fix telemedicine_recordings policies
DROP POLICY IF EXISTS "Usuarios pueden ver grabaciones de sus sesiones" ON public.telemedicine_recordings;

CREATE POLICY "Usuarios pueden ver grabaciones de sus sesiones"
  ON public.telemedicine_recordings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telemedicine_sessions
      WHERE telemedicine_sessions.id = telemedicine_recordings.session_id
      AND (telemedicine_sessions.patient_id = (SELECT auth.uid()) OR telemedicine_sessions.doctor_id = (SELECT auth.uid()))
    )
  );

-- Fix telemedicine_prescriptions policies
DROP POLICY IF EXISTS "Usuarios pueden ver sus recetas" ON public.telemedicine_prescriptions;
DROP POLICY IF EXISTS "Doctores pueden crear recetas" ON public.telemedicine_prescriptions;
DROP POLICY IF EXISTS "Doctores pueden actualizar sus recetas" ON public.telemedicine_prescriptions;

CREATE POLICY "Usuarios pueden ver sus recetas"
  ON public.telemedicine_prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.telemedicine_sessions
      WHERE telemedicine_sessions.id = telemedicine_prescriptions.session_id
      AND (telemedicine_sessions.patient_id = (SELECT auth.uid()) OR telemedicine_sessions.doctor_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Doctores pueden crear recetas"
  ON public.telemedicine_prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = (SELECT auth.uid()) AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'doctor')
  );

CREATE POLICY "Doctores pueden actualizar sus recetas"
  ON public.telemedicine_prescriptions FOR UPDATE
  TO authenticated
  USING (doctor_id = (SELECT auth.uid()));

-- Fix telemedicine_waiting_room policies
DROP POLICY IF EXISTS "Usuarios pueden ver su sala de espera" ON public.telemedicine_waiting_room;
DROP POLICY IF EXISTS "Pacientes pueden entrar a sala de espera" ON public.telemedicine_waiting_room;

CREATE POLICY "Usuarios pueden ver su sala de espera"
  ON public.telemedicine_waiting_room FOR SELECT
  TO authenticated
  USING (patient_id = (SELECT auth.uid()) OR doctor_id = (SELECT auth.uid()));

CREATE POLICY "Pacientes pueden entrar a sala de espera"
  ON public.telemedicine_waiting_room FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = (SELECT auth.uid()));

-- ============================================================================
-- 4. Fix duplicate indexes (PERFORMANCE)
-- ============================================================================

-- Drop duplicate index on profiles.email (keep the unique constraint one)
DROP INDEX IF EXISTS public.idx_profiles_email_unique;

-- ============================================================================
-- 5. Remove duplicate policies on profiles table
-- ============================================================================

-- Keep only the optimized versions created above
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Migration completed successfully
