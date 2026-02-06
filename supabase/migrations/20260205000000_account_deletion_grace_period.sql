-- Migration: Secure account deletion with 90-day grace period

-- Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deletion_initiated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_deletion_at TIMESTAMPTZ;

-- Function to initiate account deletion
CREATE OR REPLACE FUNCTION initiate_user_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  u_id uuid;
BEGIN
  -- Get current user ID
  u_id := auth.uid();
  
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Set deletion markers (90 days from now)
  UPDATE profiles 
  SET 
    deletion_initiated_at = now(),
    scheduled_deletion_at = now() + interval '90 days',
    updated_at = now()
  WHERE id = u_id;

  RAISE NOTICE 'Eliminación de cuenta iniciada para el usuario: %', u_id;
END;
$$;

-- Function to cancel account deletion
CREATE OR REPLACE FUNCTION cancel_user_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  u_id uuid;
BEGIN
  -- Get current user ID
  u_id := auth.uid();
  
  IF u_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Clear deletion markers
  UPDATE profiles 
  SET 
    deletion_initiated_at = NULL,
    scheduled_deletion_at = NULL,
    updated_at = now()
  WHERE id = u_id;

  RAISE NOTICE 'Eliminación de cuenta cancelada para el usuario: %', u_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initiate_user_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_user_deletion() TO authenticated;
