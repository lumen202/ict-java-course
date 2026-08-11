import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWeek } from "@/lib/content";

// POST /api/submissions — a signed-in student turns in (or revises) a day's
// work. One row per student/week/day, upserted, so pressing the button twice
// updates rather than duplicates. Ownership is enforced by RLS, same model as
// reflections; the name comes from the profile, not the request body.
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

  const { weekSlug, dayNumber, content, item, pasted, startedAt, filePath, fileName } = (body ??
    {}) as Record<string, unknown>;

  const slug = typeof weekSlug === "string" ? weekSlug.trim() : "";
  const day = typeof dayNumber === "number" && Number.isInteger(dayNumber) ? dayNumber : 0;
  const text = typeof content === "string" ? content.trim() : "";
  // Which box: 'day' (the closing turn-in) or an activity id from the content.
  const box = typeof item === "string" && /^[a-z0-9-]{1,40}$/.test(item) ? item : "day";
  // Advisory-only integrity signals — see src/lib/submission-integrity.ts.
  // Neither is validated beyond shape: a client can lie about them, and that's
  // fine, they're context for a teacher's judgment, not a security control.
  const wasPasted = pasted === true;
  const shownAt =
    typeof startedAt === "string" && !Number.isNaN(Date.parse(startedAt)) ? startedAt : null;

  // An UploadTask step records where its file landed in the `turn-ins` bucket.
  // The path must start with this user's own id: storage's RLS already refuses
  // a write anywhere else, so a forged path here could only ever point at an
  // object this user was allowed to write — but it could still name *another*
  // of their own files, so pin it to the shape the uploader actually uses.
  const claimedPath = typeof filePath === "string" ? filePath.trim() : "";
  const storedPath = claimedPath.startsWith(`${user.id}/`) ? claimedPath : null;
  const storedName =
    storedPath && typeof fileName === "string" ? fileName.trim().slice(0, 200) : null;

  const week = getWeek(slug);
  if (!week || day < 1 || day > week.video.days.length) {
    return NextResponse.json({ error: "That lesson doesn't exist." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json(
      { error: "Write or paste your work first — the box is empty." },
      { status: 400 },
    );
  }
  if (text.length > 20000) {
    return NextResponse.json(
      { error: "That's too long — trim it to the queries and answers that matter." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("submissions").upsert(
    {
      user_id: user.id,
      week_slug: slug,
      day_number: day,
      item: box,
      student_name: profile?.full_name || user.email || "Unknown",
      content: text,
      pasted: wasPasted,
      started_at: shownAt,
      file_path: storedPath,
      file_name: storedName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,week_slug,day_number,item" },
  );

  if (error) {
    console.error("submission upsert failed:", error.message);
    return NextResponse.json(
      { error: "Couldn't save right now — try again in a minute." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
