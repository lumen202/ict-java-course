import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// POST /api/teacher/reflections — teacher fetches all reflections.
// Guarded by TEACHER_PASSCODE (env var), checked server-side. The passcode is
// sent in the body rather than stored in a cookie: v1 keeps auth deliberately
// minimal. If this ever needs real accounts, switch to Supabase Auth.
export async function POST(request: Request) {
  const expected = process.env.TEACHER_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "TEACHER_PASSCODE is not set on the server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { passcode } = (body ?? {}) as Record<string, unknown>;
  if (typeof passcode !== "string" || passcode !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase keys are not configured on the server." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("reflections")
    .select("id, created_at, week_slug, student_name, hardest_part, want_explained")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("reflection fetch failed:", error.message);
    return NextResponse.json({ error: "Couldn't load reflections." }, { status: 500 });
  }

  return NextResponse.json({ reflections: data });
}
