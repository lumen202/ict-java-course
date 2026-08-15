import { getCurrentUser } from "@/lib/auth";
import { getCourseState, currentLesson, releasedDayCount } from "@/lib/release";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { DemoBanner } from "@/components/DemoBanner";

// Decides the app frame on the server: signed-in users get the sidebar, and
// which links it contains depends on their role — a student's browser never
// receives the teacher routes at all.
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Signed out (login, register): no chrome, the page carries its own branding.
  if (!user) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  const items: NavItem[] =
    user.role === "teacher"
      ? [
          { href: "/", label: "Dashboard", icon: "🏠" },
          { href: "/teacher/lessons", label: "Lessons", icon: "📅" },
          { href: "/teacher/students", label: "Students", icon: "👥" },
          { href: "/teacher/submissions", label: "Submissions", icon: "📤" },
          { href: "/teacher/errors", label: "Error Logs", icon: "⚠️" },
          { href: "/teacher", label: "Reflections", icon: "💬" },
        ]
      : await studentNav();

  return (
    <div className="md:flex md:min-h-screen">
      <Sidebar items={items} name={user.fullName} role={user.role} />
      <div className="min-w-0 flex-1">
        {user.demoCohort && <DemoBanner role={user.role} />}
        {children}
      </div>
    </div>
  );
}

/**
 * Students get "Lessons" with one entry per released day, so the sidebar grows
 * as the teacher opens the week — Day 1, then Day 2, and so on. Unreleased days
 * never appear.
 */
async function studentNav(): Promise<NavItem[]> {
  const state = await getCourseState();
  const lesson = currentLesson(state);

  if (!lesson) return [{ href: "/lessons", label: "Lessons", icon: "📚" }];

  const released = releasedDayCount(lesson.week, state);
  const days = lesson.week.video.days.slice(0, released).map((d, i) => ({
    href: `/week/${lesson.week.slug}?day=${i + 1}`,
    label: d.day,
    hint: d.focus,
  }));

  // One entry: Lessons, pointing at the *list* (so there's always a way back
  // out of a day), with the released days under it. No "Today" row and no
  // week-title row — both were redundant once the days are the navigation.
  return [
    {
      href: "/lessons",
      label: "Lessons",
      icon: "📚",
      children: days,
    },
  ];
}
