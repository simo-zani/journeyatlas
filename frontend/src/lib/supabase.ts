import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL / anon key mancanti. Compila frontend/.env.local (vedi frontend/.env.example).'
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'anon-key-missing'
);