"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Plays a short chime whenever a student raises a new "I'm stuck" flag, so a
// teacher notices without keeping /teacher/lessons open and refreshed. Mounted
// once in the teacher layout (not per-page) so it keeps listening no matter
// which /teacher/* page is open — the visible badge lives only on the
// "Someone stuck?" panel, but the sound isn't tied to that page.
//
// Realtime, not polling: a postgres_changes subscription on unstuck_requests,
// scoped by the table's own "teachers read cohort unstuck requests" RLS
// policy — a demo teacher only ever hears their own cohort's flags. See the
// publication grant in supabase/schema.sql, required for the table to
// broadcast at all.
export function UnstuckNotifier() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("unstuck-requests-notify")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "unstuck_requests" },
        () => playChime(audioCtxRef),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}

// No audio file: two quick oscillator notes via the Web Audio API, so there's
// nothing to fetch and no asset to keep in sync. Browsers won't play audio
// before the page has had a user gesture, so the very first flag of a session
// can arrive silently if the teacher hasn't clicked or typed on the page
// yet — there's no fix for that from a server-pushed event, only a visible
// badge to fall back on (UnstuckPanel already has one).
function playChime(ctxRef: React.RefObject<AudioContext | null>) {
  try {
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();

    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  } catch {
    // Web Audio unavailable or blocked — the panel's badge still shows it.
  }
}
