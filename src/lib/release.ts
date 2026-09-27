import { weeks } from "@/lib/content";
import { currentDemoCohort } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CourseState } from "@/lib/release-rules";

// What the class is working on right now. The teacher moves this forward a day
// at a time; students only see what has been released, so the week page shows
// today's lesson rather than the whole week.

export * from "@/lib/release-rules";

const FALLBACK: CourseState = {
  currentWeekSlug: weeks[0]?.slug ?? "",
  currentDay: 1,
};

export async function getCourseState(): Promise<CourseState> {
  const supabase = await createClient();

  // Demo sessions run their own classroom: same shape, separate table, so a
  // visitor pressing "Release day 4" moves their demo and nothing else. RLS
  // scopes the row to their cohort, so the query needs no cohort filter — but
  // it reads as one either way.
  const cohort = await currentDemoCohort();
  const { data } = cohort
    ? await supabase
        .from("demo_course_state")
        .select("current_week_slug, current_day")
        .eq("cohort", cohort)
        .maybeSingle()
    : await supabase.from("course_state").select("current_week_slug, current_day").single();

  if (!data) return FALLBACK;
  return {
    currentWeekSlug: data.current_week_slug ?? FALLBACK.currentWeekSlug,
    currentDay: data.current_day ?? 1,
  };
}

