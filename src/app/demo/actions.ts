"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import {
  DEMO_PEOPLE,
  DEMO_TTL_HOURS,
  cohortFromEmail,
  demoEmail,
  demoEnabled,
  demoPassword,
  destroyCohort,
  seedCohort,
  sweepExpiredCohorts,
} from "@/lib/demo";

// Starting, switching and ending a demo session.
//
// This is the fourth (and last) place the service-role key is used, and it's
// used for one thing only: creating and deleting the throwaway accounts, which
// is an auth-admin operation no ordinary user can perform — plus the class-list
// rows that let those accounts through the signup trigger, which RLS makes
// service-role-only by design. Course data is never touched with it: the seeded
// turn-ins are written by the demo students themselves (see lib/demo.ts).

export type DemoState = { error?: string };

/** httpOnly — it holds the cohort's password, and nothing in the browser needs it. */
const COOKIE = "jch-demo";

type DemoCookie = { cohort: string; password: string };

async function readDemoCookie(): Promise<DemoCookie | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoCookie;
    return parsed.cohort && parsed.password ? parsed : null;
  } catch {
    return null;
  }
}

// Takes the previous state (and ignores it) because it's driven by
// useActionState — there's no form data, just a button.
export async function startDemo(previous: DemoState): Promise<DemoState> {
  void previous;

  if (!demoEnabled()) {
    return { error: "The demo isn't available on this deployment." };
  }

  const admin = createAdminClient();
  if (!admin) return { error: "The demo isn't available on this deployment." };

  // Expired cohorts are cleared here rather than on a schedule — starting a
  // demo is the only thing that ever creates one.
  try {
    await sweepExpiredCohorts(admin);
  } catch (error) {
    console.error("demo sweep failed:", error);
  }

  const cohort = crypto.randomUUID();
  const password = demoPassword();

  try {
    // The class list is the signup gate, so the demo accounts have to be on it
    // first. demo_cohort is what makes these rows invisible to the real teacher.
    const { error: listError } = await admin.from("allowed_students").insert(
      DEMO_PEOPLE.map((p) => ({
        email: demoEmail(cohort, p.slot),
        first_name: p.first,
        last_name: p.last,
        demo_cohort: cohort,
        demo_role: p.role,
      })),
    );
    if (listError) throw new Error(`class list seed failed: ${listError.message}`);

    for (const person of DEMO_PEOPLE) {
      const { error: createError } = await admin.auth.admin.createUser({
        email: demoEmail(cohort, person.slot),
        password,
        email_confirm: true,
        user_metadata: { first_name: person.first, last_name: person.last },
      });
      if (createError) throw new Error(`account creation failed: ${createError.message}`);
    }

    await seedCohort(cohort, password);

    // Sign the visitor in as the student — the demo starts where a student
    // starts, and the teacher view is one click away from there.
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail(cohort, "student"),
      password,
    });
    if (signInError) throw new Error(`demo sign-in failed: ${signInError.message}`);

    (await cookies()).set(COOKIE, JSON.stringify({ cohort, password }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DEMO_TTL_HOURS * 60 * 60,
    });
  } catch (error) {
    console.error("demo start failed:", error);
    // A half-built cohort would show up as a broken classroom, so remove it.
    try {
      await destroyCohort(admin, cohort);
    } catch (cleanupError) {
      console.error("demo rollback failed:", cleanupError);
    }
    return { error: "Couldn't start the demo just now. Try again in a moment." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Hop between the demo student and the demo teacher. Both accounts belong to
 * the cohort in the cookie, so this can only ever sign you into your own demo.
 */
export async function switchDemoRole() {
  const demo = await readDemoCookie();
  if (!demo) return;

  const user = await getCurrentUser();
  if (!user || cohortFromEmail(user.email) !== demo.cohort) return;

  const target = user.role === "teacher" ? "student" : "teacher";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail(demo.cohort, target),
    password: demo.password,
  });
  if (error) {
    console.error("demo role switch failed:", error.message);
    return;
  }

  revalidatePath("/", "layout");
  redirect(target === "teacher" ? "/teacher/lessons" : "/");
}

/** Ends the demo and deletes the cohort straight away rather than waiting for
 *  the sweep — the visitor said they were done. */
export async function exitDemo() {
  const demo = await readDemoCookie();
  const supabase = await createClient();
  await supabase.auth.signOut();

  const jar = await cookies();
  jar.delete(COOKIE);

  if (demo) {
    const admin = createAdminClient();
    if (admin) {
      try {
        await destroyCohort(admin, demo.cohort);
      } catch (error) {
        console.error("demo teardown failed:", error);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
