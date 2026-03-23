-- Migration: Create delete_user_account function
-- Description: Adds a function to safely delete user accounts and all associated data

-- Create function to delete user account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Delete in order to respect foreign key constraints
  
  -- Delete messaging data
  DELETE FROM messages WHERE sender_id = user_id OR recipient_id = user_id;
  DELETE FROM conversations WHERE user1_id = user_id OR user2_id = user_id;
  
  -- Delete appointments
  DELETE FROM appointment_participants WHERE user_id = user_id;
  DELETE FROM appointments WHERE created_by = user_id;
  
  -- Delete medical records
  DELETE FROM medical_records WHERE patient_id = user_id OR doctor_id = user_id;
  
  -- Delete telemedicine data
  DELETE FROM telemedicine_participants WHERE user_id = user_id;
  DELETE FROM telemedicine_sessions WHERE doctor_id = user_id OR patient_id = user_id;
  
  -- Delete laboratory results
  DELETE FROM laboratory_results WHERE patient_id = user_id;
  
  -- Delete medications
  DELETE FROM prescriptions WHERE patient_id = user_id OR doctor_id = user_id;
  
  -- Delete doctor details
  DELETE FROM doctor_details WHERE profile_id = user_id;
  
  -- Delete patient details
  DELETE FROM patient_details WHERE profile_id = user_id;
  
  -- Delete user preferences
  DELETE FROM user_preferences WHERE user_id = user_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE id = user_id;
  
  -- Note: The auth.users record will be handled by Supabase auth
  -- We just need to signal completion
  
  RAISE NOTICE 'Account deleted successfully for user: %', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
