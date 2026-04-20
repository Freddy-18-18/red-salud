-- Phase 0 hardening: tighten private_assets bucket.
--
-- Current state:
--   * bucket public = true (so any object URL is world-readable)
--   * SELECT policy on storage.objects allows any authenticated user to list
--     every file (bucket_id = 'private_assets') — flagged by advisor lint 0025
--   * UPDATE policy allows any authenticated user to mutate any object in the bucket
--
-- Fix: flip bucket to private and scope SELECT/UPDATE/DELETE to the owner.
-- Upload (INSERT) stays as-is since ownership is assigned on insert.
--
-- NOTE: this bucket has no references in the codebase today, so these changes
-- are non-breaking. If future features need shared access, add a dedicated
-- per-feature policy rather than relaxing the bucket-wide one.

UPDATE storage.buckets
   SET public = false
 WHERE id = 'private_assets';

DROP POLICY IF EXISTS "Allow authenticated select from private_assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to private_assets"   ON storage.objects;

CREATE POLICY "private_assets: owner can select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'private_assets' AND owner = auth.uid());

CREATE POLICY "private_assets: owner can update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'private_assets' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'private_assets' AND owner = auth.uid());

CREATE POLICY "private_assets: owner can delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'private_assets' AND owner = auth.uid());
