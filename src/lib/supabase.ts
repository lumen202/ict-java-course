import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// All Supabase access happens server-side (API routes only). Keys never reach
// the browser, which is why the env vars are NOT prefixed with NEXT_PUBLIC_.

/** Client for student writes (INSERT only, enforced by RLS). Null if env not configured. */
export function getAnonClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Client for the teacher view (reads all rows, bypasses RLS). Null if env not configured. */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
