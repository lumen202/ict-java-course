import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, used by client components for auth actions.
// The URL and anon key are NEXT_PUBLIC_ on purpose: Supabase Auth runs in the
// browser, so both must ship to the client. That is safe — the anon key grants
// no data access by itself; Row Level Security decides what each logged-in user
// can read or write. The service-role key must NEVER appear here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
