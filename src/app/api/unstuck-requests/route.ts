import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWeek } from "@/lib/content";
import { daySteps } from "@/lib/lesson-steps";

// POST /api/unstuck-requests — a signed-in student flags that they're stuck on
// a step and can't get past it on their own. This used to be a self-serve
// "skip it" button; now it only raises a flag for the teacher's "Someone
// stuck?" panel, which is the one thing that actually unlocks a step
// (day_unlocks). Upserted, so re-clicking on a different step replaces the
// flag rather than duplicating it.
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in again — your session expired." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { weekSlug, dayNumber, step } = (body ?? {}) as Record<string, unknown>;

  const slug = typeof weekSlug === "string" ? weekSlug.trim() : "";
  const day = typeof dayNumber === "number" && Number.isInteger(dayNumber) ? dayNumber : 0;
  const stepKey = typeof step === "string" ? step.trim() : "";

  const week = getWeek(slug);
  if (!week || day < 1 || day > week.video.days.length) {
    return NextResponse.json({ error: "That lesson doesn't exist." }, { status: 400 });
  }
  if (stepKey && !daySteps(week.video.days[day - 1]).some((s) => s.key === stepKey)) {
    return NextResponse.json({ error: "That step doesn't exist." }, { status: 400 });
  }

  const { error } = await supabase.from("unstuck_requests").upsert(
    {
      user_id: user.id,
      week_slug: slug,
      day_number: day,
      step: stepKey || null,
      requested_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_slug,day_number" },
  );

  if (error) {
    console.error("unstuck request upsert failed:", error.message);
    return NextResponse.json(
      { error: "Couldn't send that right now — try again in a minute." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
