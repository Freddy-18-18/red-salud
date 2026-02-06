-- Database Performance Optimization - Phase 2
-- Created: 2026-02-06
-- Description: Create indexes for 66 foreign keys identified in the second linter batch.

-- 1. Academy & Progress
CREATE INDEX IF NOT EXISTS academy_modules_created_by_idx ON public.academy_modules (created_by);
CREATE INDEX IF NOT EXISTS academy_progress_module_id_idx ON public.academy_progress (module_id);

-- 2. Agora Sessions
CREATE INDEX IF NOT EXISTS agora_sessions_initiator_id_idx ON public.agora_sessions (initiator_id);
CREATE INDEX IF NOT EXISTS agora_sessions_recipient_id_idx ON public.agora_sessions (recipient_id);
CREATE INDEX IF NOT EXISTS agora_sessions_related_appointment_id_idx ON public.agora_sessions (related_appointment_id);
CREATE INDEX IF NOT EXISTS agora_sessions_related_conversation_id_idx ON public.agora_sessions (related_conversation_id);

-- 3. Appointments & History
CREATE INDEX IF NOT EXISTS appointment_status_history_changed_by_idx ON public.appointment_status_history (changed_by);
CREATE INDEX IF NOT EXISTS appointments_cancelled_by_idx ON public.appointments (cancelled_by);
CREATE INDEX IF NOT EXISTS appointments_location_id_idx ON public.appointments (location_id);
CREATE INDEX IF NOT EXISTS appointments_medical_record_id_idx ON public.appointments (medical_record_id);

-- 4. Chat
CREATE INDEX IF NOT EXISTS chat_messages_deleted_by_idx ON public.chat_messages (deleted_by);
CREATE INDEX IF NOT EXISTS chat_participants_user_id_idx ON public.chat_participants (user_id);
CREATE INDEX IF NOT EXISTS chat_typing_indicators_user_id_idx ON public.chat_typing_indicators (user_id);
CREATE INDEX IF NOT EXISTS chat_user_presence_current_channel_id_idx ON public.chat_user_presence (current_channel_id);

-- 5. Community & Notifications
CREATE INDEX IF NOT EXISTS community_notifications_actor_id_idx ON public.community_notifications (actor_id);
CREATE INDEX IF NOT EXISTS conversations_appointment_id_idx ON public.conversations (appointment_id);
CREATE INDEX IF NOT EXISTS deletion_requests_user_id_idx ON public.deletion_requests (user_id);

-- 6. Doctor Details & Docs
CREATE INDEX IF NOT EXISTS doctor_details_verified_by_idx ON public.doctor_details (verified_by);
CREATE INDEX IF NOT EXISTS doctor_details_especialidad_id_idx ON public.doctor_details (especialidad_id);
CREATE INDEX IF NOT EXISTS doctor_documents_verified_by_idx ON public.doctor_documents (verified_by);
CREATE INDEX IF NOT EXISTS doctor_notifications_doctor_id_idx ON public.doctor_notifications (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_patients_patient_id_idx ON public.doctor_patients (patient_id);
CREATE INDEX IF NOT EXISTS doctor_preferences_current_office_id_idx ON public.doctor_preferences (current_office_id);
CREATE INDEX IF NOT EXISTS doctor_quick_actions_doctor_id_idx ON public.doctor_quick_actions (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_recipe_settings_office_id_idx ON public.doctor_recipe_settings (office_id);
CREATE INDEX IF NOT EXISTS doctor_reviews_appointment_id_idx ON public.doctor_reviews (appointment_id);
CREATE INDEX IF NOT EXISTS doctor_secretaries_invited_by_idx ON public.doctor_secretaries (invited_by);
CREATE INDEX IF NOT EXISTS doctor_settings_active_frame_id_idx ON public.doctor_settings (active_frame_id);
CREATE INDEX IF NOT EXISTS doctor_settings_active_watermark_id_idx ON public.doctor_settings (active_watermark_id);
CREATE INDEX IF NOT EXISTS doctor_tasks_doctor_id_idx ON public.doctor_tasks (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_themes_doctor_id_idx ON public.doctor_themes (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_verifications_cache_verified_by_idx ON public.doctor_verifications_cache (verified_by);

-- 7. Health Metrics & Lab Orders
CREATE INDEX IF NOT EXISTS health_metrics_appointment_id_idx ON public.health_metrics (appointment_id);
CREATE INDEX IF NOT EXISTS health_metrics_medical_record_id_idx ON public.health_metrics (medical_record_id);
CREATE INDEX IF NOT EXISTS lab_order_status_history_cambiado_por_idx ON public.lab_order_status_history (cambiado_por);
CREATE INDEX IF NOT EXISTS lab_order_status_history_order_id_idx ON public.lab_order_status_history (order_id);
CREATE INDEX IF NOT EXISTS lab_order_tests_order_id_idx ON public.lab_order_tests (order_id);
CREATE INDEX IF NOT EXISTS lab_order_tests_test_type_id_idx ON public.lab_order_tests (test_type_id);
CREATE INDEX IF NOT EXISTS lab_orders_appointment_id_idx ON public.lab_orders (appointment_id);
CREATE INDEX IF NOT EXISTS lab_orders_laboratorio_id_idx ON public.lab_orders (laboratorio_id);
CREATE INDEX IF NOT EXISTS lab_orders_medical_record_id_idx ON public.lab_orders (medical_record_id);
CREATE INDEX IF NOT EXISTS lab_orders_medico_id_idx ON public.lab_orders (medico_id);
CREATE INDEX IF NOT EXISTS lab_result_values_result_id_idx ON public.lab_result_values (result_id);
CREATE INDEX IF NOT EXISTS lab_results_order_id_idx ON public.lab_results (order_id);
CREATE INDEX IF NOT EXISTS lab_results_test_type_id_idx ON public.lab_results (test_type_id);
CREATE INDEX IF NOT EXISTS lab_results_validado_por_idx ON public.lab_results (validado_por);

-- 8. Medical Notes & Records
CREATE INDEX IF NOT EXISTS medical_notes_appointment_id_idx ON public.medical_notes (appointment_id);
CREATE INDEX IF NOT EXISTS medical_notes_doctor_id_idx ON public.medical_notes (doctor_id);
CREATE INDEX IF NOT EXISTS medical_notes_patient_id_idx ON public.medical_notes (patient_id);
CREATE INDEX IF NOT EXISTS medical_records_appointment_id_idx ON public.medical_records (appointment_id);
CREATE INDEX IF NOT EXISTS medical_records_offline_patient_id_idx ON public.medical_records (offline_patient_id);
CREATE INDEX IF NOT EXISTS medication_intake_log_paciente_id_idx ON public.medication_intake_log (paciente_id);
CREATE INDEX IF NOT EXISTS medication_reminders_prescription_medication_id_idx ON public.medication_reminders (prescription_medication_id);

-- 9. Other Tables
CREATE INDEX IF NOT EXISTS office_photos_office_id_idx ON public.office_photos (office_id);
CREATE INDEX IF NOT EXISTS patient_documents_verified_by_idx ON public.patient_documents (verified_by);
CREATE INDEX IF NOT EXISTS prescription_medications_medication_id_idx ON public.prescription_medications (medication_id);
CREATE INDEX IF NOT EXISTS prescriptions_appointment_id_idx ON public.prescriptions (appointment_id);
CREATE INDEX IF NOT EXISTS prescriptions_farmacia_id_idx ON public.prescriptions (farmacia_id);
CREATE INDEX IF NOT EXISTS prescriptions_medical_record_id_idx ON public.prescriptions (medical_record_id);
CREATE INDEX IF NOT EXISTS qa_answer_comments_author_id_idx ON public.qa_answer_comments (author_id);
CREATE INDEX IF NOT EXISTS support_messages_sender_id_idx ON public.support_messages (sender_id);
CREATE INDEX IF NOT EXISTS support_messages_ticket_id_idx ON public.support_messages (ticket_id);
CREATE INDEX IF NOT EXISTS support_tickets_assigned_to_idx ON public.support_tickets (assigned_to);
CREATE INDEX IF NOT EXISTS support_tickets_created_by_idx ON public.support_tickets (created_by);
CREATE INDEX IF NOT EXISTS support_tickets_created_by_profiles_idx ON public.support_tickets (created_by);
CREATE INDEX IF NOT EXISTS transactions_payment_method_id_idx ON public.transactions (payment_method_id);
