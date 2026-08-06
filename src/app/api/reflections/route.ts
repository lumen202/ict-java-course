import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/reflections — a signed-in student submits their weekly reflection.
//
// The insert runs as the student's own user via their auth cookie, so the RLS
// policy ("user_id must equal auth.uid()") is what actually enforces ownership.
// The name is read from their profile rather than the request body, so nobody
// can submit under someone else's name.
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

  const { weekSlug, hardestPart, wantExplained } = (body ?? {}) as Record<string, unknown>;

  const slug = typeof weekSlug === "string" ? weekSlug.trim() : "";
  const hardest = typeof hardestPart === "string" ? hardestPart.trim() : "";
  const want = typeof wantExplained === "string" ? wantExplained.trim() : "";

  if (!slug || !hardest) {
    return NextResponse.json({ error: "Please fill in the 'hardest part' box." }, { status: 400 });
  }
  if (hardest.length > 2000 || want.length > 2000) {
    return NextResponse.json(
      { error: "That's a bit too long — keep it under a few sentences." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("reflections").insert({
    user_id: user.id,
    week_slug: slug,
    student_name: profile?.full_name || user.email || "Unknown",
    hardest_part: hardest,
    want_explained: want || null,
  });

  if (error) {
    console.error("reflection insert failed:", error.message);
    return NextResponse.json(
      { error: "Couldn't save right now — try again in a minute." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
