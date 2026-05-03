-- The policy `anon_read_doctor_profiles` applied only to the `anon` role,
-- so logged-in patients could not see the embedded `profile` of doctors
-- when /api/doctors/search joined `profiles!doctor_details_profile_id_fkey`.
-- Result: PostgREST returned doctor.profile = null and the DoctorCard
-- crashed with "Cannot read properties of null (reading 'full_name')".
--
-- Extend the policy to authenticated as well — verified doctor profiles
-- are public-by-design (they're discoverable in search) so there is no
-- privacy gain from hiding them from logged-in users.

DROP POLICY IF EXISTS "anon_read_doctor_profiles" ON public.profiles;

CREATE POLICY "public_read_verified_doctor_profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    role = 'medico'::user_role
    AND id IN (
      SELECT profile_id
      FROM public.doctor_profiles
      WHERE verified = true
    )
  );
