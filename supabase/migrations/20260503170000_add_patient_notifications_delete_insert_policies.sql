-- patient_notifications had RLS enabled with policies only for SELECT and
-- UPDATE. The DELETE handler in /api/notifications/[id] silently no-op'd:
-- PostgREST does not raise an error when zero rows are matched after the
-- RLS filter, so the BFF returned 200 OK while the row was never removed.
-- Result: the trash button on each notification card "worked" from the
-- network's perspective but the notification stayed on screen.
--
-- Add an explicit DELETE policy scoped to the row's owner. Also add an
-- INSERT policy so server-side flows (other Edge Functions, future
-- triggers) can create notifications under the user's own context — the
-- existing seed inserts went through the SQL editor with bypass-RLS, so
-- this gap was invisible until now.

CREATE POLICY "Patients can delete own notifications"
  ON public.patient_notifications
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = patient_id);

CREATE POLICY "Patients can insert own notifications"
  ON public.patient_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = patient_id);
