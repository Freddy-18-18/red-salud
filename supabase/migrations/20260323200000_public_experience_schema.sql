-- =============================================================================
-- Migration: Public Experience Schema
-- Date: 2026-03-23
-- Description: Database changes for the public-experience feature.
--   1. Create platform_stats table (global stats for landing page)
--   2. Add slug columns to specialties and doctor tables (for SEO-friendly URLs)
--   3. Add RLS policies for anonymous (anon) read access to public data
--   4. Create refresh_platform_stats() utility function
--
-- IMPORTANT:
--   - The codebase has two naming conventions for the same tables:
--       doctor_details / doctor_profiles
--       specialties / medical_specialties
--   - This migration detects which table names exist and operates on the
--     actual tables found in the schema.
--   - All operations are idempotent (safe to re-run).
-- =============================================================================

-- Ensure unaccent extension is available (needed for slug generation)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =============================================================================
-- 1. PLATFORM_STATS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  doctor_count INT DEFAULT 0,
  specialty_count INT DEFAULT 0,
  patient_count INT DEFAULT 0,
  appointment_count INT DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.platform_stats IS 'Aggregated platform statistics for the public landing page';

-- Seed the global row
INSERT INTO public.platform_stats (id) VALUES ('global') ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- RLS: anon can read stats
DROP POLICY IF EXISTS "anon_read_stats" ON public.platform_stats;
CREATE POLICY "anon_read_stats"
  ON public.platform_stats
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can also read stats
DROP POLICY IF EXISTS "authenticated_read_stats" ON public.platform_stats;
CREATE POLICY "authenticated_read_stats"
  ON public.platform_stats
  FOR SELECT
  TO authenticated
  USING (true);


-- =============================================================================
-- 2. SLUG COLUMNS + 3. RLS POLICIES FOR ANONYMOUS ACCESS
-- =============================================================================
-- Uses DO blocks to detect actual table names and add slug columns + policies.

-- -------------------------------------------------------
-- 2a + 2b. Specialty table: slug column + anon RLS
-- -------------------------------------------------------
DO $$
DECLARE
  v_specialty_table TEXT;
BEGIN
  -- Detect specialty table name
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'medical_specialties'
  ) THEN
    v_specialty_table := 'medical_specialties';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'specialties'
  ) THEN
    v_specialty_table := 'specialties';
  ELSE
    RAISE NOTICE 'No specialties table found. Skipping.';
    RETURN;
  END IF;

  -- Add slug column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_specialty_table AND column_name = 'slug'
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN slug TEXT', v_specialty_table);
    RAISE NOTICE 'Added slug column to %.', v_specialty_table;
  END IF;

  -- Backfill slugs where null
  EXECUTE format(
    $sql$
      UPDATE public.%I
      SET slug = lower(
        regexp_replace(
          regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      )
      WHERE slug IS NULL
    $sql$,
    v_specialty_table
  );

  -- Create unique index
  EXECUTE format(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_slug ON public.%I(slug)',
    v_specialty_table, v_specialty_table
  );

  -- Enable RLS + anon policy
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_specialty_table);
  EXECUTE format('DROP POLICY IF EXISTS "anon_read_specialties" ON public.%I', v_specialty_table);
  EXECUTE format(
    'CREATE POLICY "anon_read_specialties" ON public.%I FOR SELECT TO anon USING (true)',
    v_specialty_table
  );

  RAISE NOTICE 'Specialty table % configured: slug + anon RLS.', v_specialty_table;
END $$;


-- -------------------------------------------------------
-- 2c-2e + 3b-3d. Doctor table: slug + anon RLS policies
-- -------------------------------------------------------
DO $$
DECLARE
  v_doctor_table TEXT;
  v_doctor_fk TEXT;         -- 'id' or 'profile_id'
  v_verified_col TEXT;      -- 'verified' or 'is_verified'
  v_active_col TEXT;        -- 'is_active' or NULL
  v_using_clause TEXT;      -- for doctor anon policy
  v_subquery TEXT;          -- for profiles/reviews anon policies
BEGIN
  -- Detect doctor table name
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'doctor_profiles'
  ) THEN
    v_doctor_table := 'doctor_profiles';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'doctor_details'
  ) THEN
    v_doctor_table := 'doctor_details';
  ELSE
    RAISE NOTICE 'No doctor table found. Skipping.';
    RETURN;
  END IF;

  -- Detect FK column to profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'profile_id'
  ) THEN
    v_doctor_fk := 'profile_id';
  ELSE
    v_doctor_fk := 'id';
  END IF;

  -- Detect verified column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'is_verified'
  ) THEN
    v_verified_col := 'is_verified';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'verified'
  ) THEN
    v_verified_col := 'verified';
  ELSE
    v_verified_col := NULL;
    RAISE NOTICE 'No verified column found on %. Will use permissive policy.', v_doctor_table;
  END IF;

  -- Detect active column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'is_active'
  ) THEN
    v_active_col := 'is_active';
  ELSE
    v_active_col := NULL;
    RAISE NOTICE 'No is_active column found on %.', v_doctor_table;
  END IF;

  -- -------------------------------------------------------
  -- 2e. Add slug to doctor table
  -- -------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'slug'
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN slug TEXT', v_doctor_table);
    RAISE NOTICE 'Added slug column to %.', v_doctor_table;
  END IF;

  -- Backfill slugs: slugified(nombre_completo) + first 8 chars of FK id for uniqueness
  EXECUTE format(
    $sql$
      UPDATE public.%I dp
      SET slug = lower(
        regexp_replace(
          regexp_replace(unaccent(p.nombre_completo), '[^a-zA-Z0-9]+', '-', 'g'),
          '(^-|-$)', '', 'g'
        )
      ) || '-' || substr(dp.%I::text, 1, 8)
      FROM public.profiles p
      WHERE p.id = dp.%I AND dp.slug IS NULL
    $sql$,
    v_doctor_table, v_doctor_fk, v_doctor_fk
  );

  -- Create unique index
  EXECUTE format(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_slug ON public.%I(slug)',
    v_doctor_table, v_doctor_table
  );

  RAISE NOTICE 'Slug column on % is ready.', v_doctor_table;

  -- -------------------------------------------------------
  -- Build reusable USING clause and subquery for policies
  -- -------------------------------------------------------
  IF v_verified_col IS NOT NULL AND v_active_col IS NOT NULL THEN
    v_using_clause := format('%I = true AND %I = true', v_verified_col, v_active_col);
    v_subquery := format(
      'SELECT %I FROM public.%I WHERE %I = true AND %I = true',
      v_doctor_fk, v_doctor_table, v_verified_col, v_active_col
    );
  ELSIF v_verified_col IS NOT NULL THEN
    v_using_clause := format('%I = true', v_verified_col);
    v_subquery := format(
      'SELECT %I FROM public.%I WHERE %I = true',
      v_doctor_fk, v_doctor_table, v_verified_col
    );
  ELSIF v_active_col IS NOT NULL THEN
    v_using_clause := format('%I = true', v_active_col);
    v_subquery := format(
      'SELECT %I FROM public.%I WHERE %I = true',
      v_doctor_fk, v_doctor_table, v_active_col
    );
  ELSE
    v_using_clause := 'true';
    v_subquery := format(
      'SELECT %I FROM public.%I',
      v_doctor_fk, v_doctor_table
    );
  END IF;

  -- -------------------------------------------------------
  -- 3b. Doctor table: anon can read verified+active doctors
  -- -------------------------------------------------------
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_doctor_table);
  EXECUTE format('DROP POLICY IF EXISTS "anon_read_active_doctors" ON public.%I', v_doctor_table);
  EXECUTE format(
    'CREATE POLICY "anon_read_active_doctors" ON public.%I FOR SELECT TO anon USING (%s)',
    v_doctor_table, v_using_clause
  );
  RAISE NOTICE 'RLS policy anon_read_active_doctors created on %.', v_doctor_table;

  -- -------------------------------------------------------
  -- 3c. Profiles: anon can read medico profiles linked to verified+active doctors
  -- -------------------------------------------------------
  EXECUTE 'DROP POLICY IF EXISTS "anon_read_doctor_profiles" ON public.profiles';
  EXECUTE format(
    $sql$
      CREATE POLICY "anon_read_doctor_profiles"
        ON public.profiles
        FOR SELECT
        TO anon
        USING (role = 'medico' AND id IN (%s))
    $sql$,
    v_subquery
  );
  RAISE NOTICE 'RLS policy anon_read_doctor_profiles created on profiles.';

  -- -------------------------------------------------------
  -- 3d. Doctor reviews: anon can read reviews for verified+active doctors
  -- -------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'doctor_reviews'
  ) THEN
    EXECUTE 'ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "anon_read_reviews" ON public.doctor_reviews';
    EXECUTE format(
      'CREATE POLICY "anon_read_reviews" ON public.doctor_reviews FOR SELECT TO anon USING (doctor_id IN (%s))',
      v_subquery
    );
    RAISE NOTICE 'RLS policy anon_read_reviews created on doctor_reviews.';
  ELSE
    RAISE NOTICE 'doctor_reviews table not found. Skipping anon_read_reviews policy.';
  END IF;

END $$;


-- =============================================================================
-- 4. FUNCTION: Refresh platform_stats
-- =============================================================================
-- Utility function to recalculate platform_stats from live data.
-- Can be called by a cron job or admin action.

CREATE OR REPLACE FUNCTION public.refresh_platform_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_doctor_table TEXT;
  v_verified_col TEXT;
  v_active_col TEXT;
  v_doctor_fk TEXT;
  v_specialty_table TEXT;
  v_doctor_count INT := 0;
  v_specialty_count INT := 0;
  v_patient_count INT := 0;
  v_appointment_count INT := 0;
  v_avg_rating NUMERIC(3,2) := 0;
BEGIN
  -- Detect doctor table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_profiles') THEN
    v_doctor_table := 'doctor_profiles';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_details') THEN
    v_doctor_table := 'doctor_details';
  END IF;

  -- Detect specialty table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_specialties') THEN
    v_specialty_table := 'medical_specialties';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'specialties') THEN
    v_specialty_table := 'specialties';
  END IF;

  -- Detect doctor table columns
  IF v_doctor_table IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'is_verified') THEN
      v_verified_col := 'is_verified';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'verified') THEN
      v_verified_col := 'verified';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'is_active') THEN
      v_active_col := 'is_active';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = v_doctor_table AND column_name = 'profile_id') THEN
      v_doctor_fk := 'profile_id';
    ELSE
      v_doctor_fk := 'id';
    END IF;
  END IF;

  -- Count verified active doctors
  IF v_doctor_table IS NOT NULL THEN
    IF v_verified_col IS NOT NULL AND v_active_col IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = true AND %I = true', v_doctor_table, v_verified_col, v_active_col) INTO v_doctor_count;
    ELSIF v_verified_col IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = true', v_doctor_table, v_verified_col) INTO v_doctor_count;
    ELSE
      EXECUTE format('SELECT count(*) FROM public.%I', v_doctor_table) INTO v_doctor_count;
    END IF;
  END IF;

  -- Count specialties
  IF v_specialty_table IS NOT NULL THEN
    EXECUTE format('SELECT count(*) FROM public.%I', v_specialty_table) INTO v_specialty_count;
  END IF;

  -- Count patients
  SELECT count(*) INTO v_patient_count FROM public.profiles WHERE role = 'paciente';

  -- Count appointments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
    SELECT count(*) INTO v_appointment_count FROM public.appointments;
  END IF;

  -- Avg rating from doctor_reviews
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctor_reviews') THEN
    SELECT COALESCE(round(avg(rating)::numeric, 2), 0) INTO v_avg_rating FROM public.doctor_reviews;
  END IF;

  -- Upsert the stats row
  INSERT INTO public.platform_stats (id, doctor_count, specialty_count, patient_count, appointment_count, avg_rating, updated_at)
  VALUES ('global', v_doctor_count, v_specialty_count, v_patient_count, v_appointment_count, v_avg_rating, now())
  ON CONFLICT (id) DO UPDATE SET
    doctor_count = EXCLUDED.doctor_count,
    specialty_count = EXCLUDED.specialty_count,
    patient_count = EXCLUDED.patient_count,
    appointment_count = EXCLUDED.appointment_count,
    avg_rating = EXCLUDED.avg_rating,
    updated_at = EXCLUDED.updated_at;
END;
$$;

COMMENT ON FUNCTION public.refresh_platform_stats IS 'Recalculates platform_stats from live data. Call periodically via cron or admin.';

-- Populate initial stats from live data
SELECT public.refresh_platform_stats();
