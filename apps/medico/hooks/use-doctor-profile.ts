"use client";

import { useDoctorProfile as useProfileSdk } from '@red-salud/sdk-medico';
import { supabase } from '@/lib/supabase/client';

export function useDoctorProfile(userId?: string) {
  return useProfileSdk(supabase, userId);
}

