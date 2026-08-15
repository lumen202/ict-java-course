import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/client-errors — a signed-in student's browser mirrors a failure
// here (see src/lib/report-client-error.ts) so a teacher can read what
// actually went wrong on /teacher/submissions, instead of relying on the
// student to notice, understand, and relay a console error themselves.
//
// Best-effort by design: the caller never awaits this meaningfully and
// swallows its own failures, so there's nothing more useful to do here than
// insert-or-give-up. A student can never read these back — see
// supabase/schema.sql's client_error_logs policies.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { context, message, weekSlug, dayNumber } = (body ?? {}) as Record<string, unknown>;

  const ctx = typeof context === "string" ? context.trim().slice(0, 200) : "";
  const msg = typeof message === "string" ? message.trim().slice(0, 4000) : "";
  if (!ctx || !msg) {
    return NextResponse.json({ error: "Missing context or message." }, { status: 400 });
  }

  const slug = typeof weekSlug === "string" ? weekSlug.trim().slice(0, 100) || null : null;
  const day = typeof dayNumber === "number" && Number.isInteger(dayNumber) ? dayNumber : null;

  const { error } = await supabase.from("client_error_logs").insert({
    user_id: user.id,
    context: ctx,
    message: msg,
    week_slug: slug,
    day_number: day,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (error) {
    console.error("client error log insert failed:", error.message);
    return NextResponse.json({ error: "Couldn't record it." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
