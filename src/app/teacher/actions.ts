"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getWeek } from "@/lib/content";

export type ClassListState = {
  error?: string;
  notice?: string;
  /** Set when the student must register themselves — the form shows it to copy. */
  registerUrl?: string;
};

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

  const origin = (await headers()).get("origin") ?? "";
  // Carry the email in the link so the student doesn't retype the exact address
  // the class list is keyed on — mistyping it is the main way registration fails.
  const registerUrl = `${origin}/register?email=${encodeURIComponent(email)}`;

  if (!sendEmail) {
    return { notice: `${email} is on the class list.`, registerUrl };
  }

  // Emailing is a convenience on top of the class list, never a requirement:
  // if it fails (no service-role key, SMTP limits) the student can still
  // register themselves, so we hand back the link rather than erroring.
  const admin = createAdminClient();
  if (!admin) {
    return {
      notice: `${email} is on the class list, but no invite email was sent — the server has no service-role key.`,
      registerUrl,
    };
  }

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/welcome`,
    data: { first_name: firstName, last_name: lastName },
  });

  if (inviteError) {
    console.error("invite email failed:", inviteError.message);
    const rateLimited = inviteError.message.toLowerCase().includes("rate");
    return {
      notice: rateLimited
        ? `${email} is on the class list, but the email wasn't sent — Supabase's built-in mail is rate-limited.`
        : `${email} is on the class list, but the invite email failed to send.`,
      registerUrl,
    };
  }

  return { notice: `${email} is on the class list and an invite email is on its way.` };
}

// Release a specific day straight from the lesson list — no form state, just a
// button per row. Selecting an earlier day is a rollback; the dedicated undo
// (below) is the same thing for the common "one step back" case.
export async function releaseDay(formData: FormData) {
  await requireTeacher("/teacher/lessons");

  const weekSlug = String(formData.get("weekSlug") ?? "").trim();
  const day = Number(formData.get("day"));

  const week = getWeek(weekSlug);
  if (!week) return;
  if (!Number.isInteger(day) || day < 1 || day > week.video.days.length) return;

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

  if (error) console.error("release failed:", error.message);

  revalidatePath("/", "layout");
}

// Step the class back one day. Releasing is reversible on purpose: opening the
// wrong day by mistake shouldn't need a database edit to fix. Walking it down
// to 0 closes the week entirely, so students see "hasn't started yet" again.
export async function undoRelease() {
  await requireTeacher("/teacher/lessons");

  const supabase = await createClient();
  const { data: state } = await supabase
    .from("course_state")
    .select("current_day")
    .single();

  const nextDay = Math.max(0, (state?.current_day ?? 1) - 1);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("course_state")
    .update({
      current_day: nextDay,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq("id", true);

  if (error) console.error("undo release failed:", error.message);

  revalidatePath("/", "layout");
}

// Fix or fill in a student's name. Updates the class list, and — when the
// service-role key is available — the account itself, so the corrected name is
// what the app actually shows. RLS lets a teacher read every profile but only
// update their own, which is why the profile write needs the admin client.
export async function updateStudentName(formData: FormData) {
  await requireTeacher("/teacher/students");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 60);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 60);
  if (!email) return;

  const supabase = await createClient();
  await supabase
    .from("allowed_students")
    .update({ first_name: firstName, last_name: lastName })
    .eq("email", email);

  const admin = createAdminClient();
  if (admin) {
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const account = authUsers?.users.find((u) => u.email?.toLowerCase() === email);

    if (account) {
      await admin
        .from("profiles")
        .update({ first_name: firstName, last_name: lastName, full_name: fullName })
        .eq("id", account.id);
      // Keep auth metadata in step — it's the app's last-resort name source.
      await admin.auth.admin.updateUserById(account.id, {
        user_metadata: { ...account.user_metadata, first_name: firstName, last_name: lastName },
      });
    }
  }

  revalidatePath("/teacher/students");
  revalidatePath("/", "layout");
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
