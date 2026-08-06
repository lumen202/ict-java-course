"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getWeek } from "@/lib/content";

export type ClassListState = { error?: string; notice?: string };

// Managing the class list — the emails allowed to register. Teacher-only:
// requireTeacher() redirects rather than returning, and the table's RLS policy
// enforces the same thing in the database.

export async function addStudent(
  _prev: ClassListState,
  formData: FormData,
): Promise<ClassListState> {
  await requireTeacher("/teacher/students");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const sendEmail = formData.get("sendEmail") === "on";

  if (!email.includes("@")) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_students")
    .insert({ email, first_name: firstName, last_name: lastName });

  if (error) {
    if (error.code === "23505") return { error: `${email} is already on the class list.` };
    console.error("add student failed:", error.message);
    return { error: "Couldn't add that student. Try again." };
  }

  revalidatePath("/teacher/students");

  if (!sendEmail) {
    return { notice: `${email} is on the class list and can now register.` };
  }

  // Emailing is a convenience on top of the class list, never a requirement:
  // if it fails (no service-role key, SMTP limits) the student can still
  // register themselves, so we report it as a warning rather than an error.
  const admin = createAdminClient();
  if (!admin) {
    return {
      notice: `${email} is on the class list, but no invite email was sent — the server has no service-role key. They can register at /register.`,
    };
  }

  const origin = (await headers()).get("origin") ?? "";
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/welcome`,
    data: { first_name: firstName, last_name: lastName },
  });

  if (inviteError) {
    console.error("invite email failed:", inviteError.message);
    const rateLimited = inviteError.message.toLowerCase().includes("rate");
    return {
      notice: rateLimited
        ? `${email} is on the class list, but the email wasn't sent — Supabase's built-in mail is rate-limited. They can register at /register instead.`
        : `${email} is on the class list, but the invite email failed to send. They can register at /register instead.`,
    };
  }

  return { notice: `${email} is on the class list and an invite email is on its way.` };
}

export type ReleaseState = { error?: string; notice?: string };

// Move the class forward. Students see days up to and including this one.
export async function setCurrentLesson(
  _prev: ReleaseState,
  formData: FormData,
): Promise<ReleaseState> {
  await requireTeacher("/teacher/lessons");

  const weekSlug = String(formData.get("weekSlug") ?? "").trim();
  const day = Number(formData.get("day"));

  const week = getWeek(weekSlug);
  if (!week) return { error: "That week doesn't exist." };
  if (!Number.isInteger(day) || day < 1 || day > week.video.days.length) {
    return { error: "Pick a day that exists in this week." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("course_state")
    .update({
      current_week_slug: weekSlug,
      current_day: day,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq("id", true);

  if (error) {
    console.error("release failed:", error.message);
    return { error: "Couldn't update what students can see. Try again." };
  }

  revalidatePath("/", "layout");
  return {
    notice: `Students can now open ${week.title} up to ${week.video.days[day - 1].day}.`,
  };
}

export async function removeStudent(formData: FormData) {
  await requireTeacher("/teacher/students");

  const email = String(formData.get("email") ?? "");
  if (!email) return;

  const supabase = await createClient();
  // Only removes them from the list of who *may* register. An account they
  // already created keeps working — delete that in the Supabase dashboard.
  await supabase.from("allowed_students").delete().eq("email", email);

  revalidatePath("/teacher/students");
}
