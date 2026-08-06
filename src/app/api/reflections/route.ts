import { NextResponse } from "next/server";
import { getAnonClient } from "@/lib/supabase";

// POST /api/reflections — a student submits their weekly reflection.
export async function POST(request: Request) {
  const supabase = getAnonClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Reflections aren't set up yet — tell your teacher the site is missing its Supabase keys." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { weekSlug, studentName, hardestPart, wantExplained } = (body ?? {}) as Record<string, unknown>;

  const name = typeof studentName === "string" ? studentName.trim() : "";
  const hardest = typeof hardestPart === "string" ? hardestPart.trim() : "";
  const want = typeof wantExplained === "string" ? wantExplained.trim() : "";
  const slug = typeof weekSlug === "string" ? weekSlug.trim() : "";

  if (!slug || !name || !hardest) {
    return NextResponse.json({ error: "Please fill in your name and the 'hardest part' box." }, { status: 400 });
  }
  if (name.length > 100 || hardest.length > 2000 || want.length > 2000) {
    return NextResponse.json({ error: "That's a bit too long — keep it under a few sentences." }, { status: 400 });
  }

  const { error } = await supabase.from("reflections").insert({
    week_slug: slug,
    student_name: name,
    hardest_part: hardest,
    want_explained: want || null,
  });

  if (error) {
    console.error("reflection insert failed:", error.message);
    return NextResponse.json({ error: "Couldn't save right now — try again in a minute." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
