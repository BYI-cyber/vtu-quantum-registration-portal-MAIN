import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://xnrcuwxacrmeweikcgoz.supabase.co') {
  console.warn(
    '⚠️ Supabase URL not configured. Please update VITE_SUPABASE_URL in your .env file.\nSee SUPABASE_SETUP.md for instructions.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://xnrcuwxacrmeweikcgoz.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucmN1d3hhY3JtZXdlaWtjZ296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDcxOTYsImV4cCI6MjA4ODkyMzE5Nn0.4-W7eiH26PCQMVxLZCl8-YXBT9Jbn8w6hMNNTpr2x54'
);
