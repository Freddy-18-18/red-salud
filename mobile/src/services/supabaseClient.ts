import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const SUPABASE_URL = expoExtra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = expoExtra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Variables no configuradas. Actualiza app.json extra.supabaseUrl y extra.supabaseAnonKey');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const prefix = Linking.createURL('/');
