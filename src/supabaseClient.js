import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
  console.warn(
    '⚠️ Supabase URL not configured. Please update VITE_SUPABASE_URL in your .env file.\nSee SUPABASE_SETUP.md for instructions.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
