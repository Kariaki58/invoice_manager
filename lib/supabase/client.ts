/**
 * Supabase Client for Client-Side Components
 * 
 * This client uses the anon key and respects Row Level Security (RLS) policies.
 * Use this in React components, hooks, and client-side code.
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

