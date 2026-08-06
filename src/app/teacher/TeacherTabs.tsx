import Link from "next/link";

// Shared sub-nav for the teacher area. Server component — the active tab is
// passed in by each page rather than read from the router.
export function TeacherTabs({ active }: { active: "reflections" | "students" }) {
  const tabs = [
    { key: "reflections", href: "/teacher", label: "Reflections" },
    { key: "students", href: "/teacher/students", label: "Students" },
  ] as const;

  return (
    <nav className="my-6 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            active === t.key
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
