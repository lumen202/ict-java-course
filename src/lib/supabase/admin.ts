import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client — uses the service-role key, which bypasses Row Level Security
// completely. It exists for exactly one job: sending invite emails, which is an
// Auth admin operation no ordinary user can perform.
//
// Rules:
//   • never import this from a client component (the `server-only` import above
//     turns that into a build error rather than a leaked key),
//   • never use it to read or write course data — that's what the per-user
//     client in ./server.ts is for, so RLS stays the boundary,
//   • every caller must check requireTeacher() first.
//
// Returns null when the key isn't configured, so emailing can degrade to
// "student registers themselves at /register" instead of crashing.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
