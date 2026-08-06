"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Last-resort handler for Supabase's DEFAULT email links.
//
// Those links route through Supabase's own /auth/v1/verify, which hands the
// session back in the URL *fragment* (#access_token=…&refresh_token=…). A
// fragment is never sent to the server, so the page above sees no query params
// and renders this instead. Here — in the browser — we can read it, install the
// session, and move on. Without this, every default invite email dead-ends.
export function HashSession({ next }: { next: string }) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      window.location.replace("/login?error=invalid-link");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        // Full reload rather than router.push: the server components need to
        // re-render with the new auth cookies.
        window.location.replace(error ? "/login?error=expired-link" : next);
      })
      .catch(() => window.location.replace("/login?error=expired-link"));
  }, [next]);

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">Signing you in…</p>
  );
}
