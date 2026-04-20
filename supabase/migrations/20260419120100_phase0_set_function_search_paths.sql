-- Phase 0 hardening: pin search_path on every user-defined function flagged
-- by the Supabase security advisor (lint 0011_function_search_path_mutable).
-- A mutable search_path can be exploited by a malicious role that creates
-- same-named objects in a schema earlier in the path.
--
-- `unaccent*` functions belong to the unaccent extension and are skipped here
-- (they are hardened by moving the extension out of public, done separately).

ALTER FUNCTION public.admin_update_payment_status(uuid, payment_status)                                                    SET search_path = public, pg_catalog;
ALTER FUNCTION public.approve_verification(uuid, uuid, text, text, timestamp with time zone, jsonb)                        SET search_path = public, pg_catalog;
ALTER FUNCTION public.auto_resolve_sacs_specialty()                                                                         SET search_path = public, pg_catalog;
ALTER FUNCTION public.blog_posts_before_insert()                                                                            SET search_path = public, pg_catalog;
ALTER FUNCTION public.calculate_reading_time(text)                                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_slot_available(uuid, uuid, timestamp with time zone, integer, integer, integer, uuid)           SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_time_block_conflict(uuid, timestamp with time zone, timestamp with time zone, uuid)             SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_user_permission(uuid, text[])                                                                   SET search_path = public, pg_catalog;
ALTER FUNCTION public.create_default_reminder_rules(uuid)                                                                   SET search_path = public, pg_catalog;
ALTER FUNCTION public.create_default_schedule_template(uuid, uuid)                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.generate_checkin_token(uuid)                                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.generate_slug(text)                                                                                   SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_admin_payments(text)                                                                              SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_expiring_verifications(integer)                                                                   SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_supervised_professionals(uuid)                                                                    SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_user_verification(uuid)                                                                           SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_verification_statistics()                                                                         SET search_path = public, pg_catalog;
ALTER FUNCTION public.handle_new_user()                                                                                     SET search_path = public, pg_catalog;
ALTER FUNCTION public.log_verification_change()                                                                             SET search_path = public, pg_catalog;
ALTER FUNCTION public.notify_waitlist_on_cancel()                                                                           SET search_path = public, pg_catalog;
ALTER FUNCTION public.pharmacy_set_updated_at()                                                                             SET search_path = public, pg_catalog;
ALTER FUNCTION public.qa_questions_before_insert()                                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.refresh_statistics_views()                                                                            SET search_path = public, pg_catalog;
ALTER FUNCTION public.reject_verification(uuid, uuid, text, text, text)                                                     SET search_path = public, pg_catalog;
ALTER FUNCTION public.renew_verification(uuid, uuid, timestamp with time zone, text)                                        SET search_path = public, pg_catalog;
ALTER FUNCTION public.resolve_sacs_to_slug(text)                                                                            SET search_path = public, pg_catalog;
ALTER FUNCTION public.schedule_appointment_reminders(uuid)                                                                  SET search_path = public, pg_catalog;
ALTER FUNCTION public.set_module_pref_updated_at()                                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.trigger_schedule_reminders()                                                                          SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_answer_count()                                                                                 SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_checklist_updated_at()                                                                         SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_comment_count()                                                                                SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_dental_appointment_details_updated_at()                                                        SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_documents_count()                                                                              SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_like_counts()                                                                                  SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_professional_verifications_updated_at()                                                        SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_tag_usage()                                                                                    SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_updated_at()                                                                                   SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_vote_counts()                                                                                  SET search_path = public, pg_catalog;
