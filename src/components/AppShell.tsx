import { getCurrentUser } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/Sidebar";

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
          { href: "/teacher", label: "Reflections", icon: "💬" },
        ]
      : [{ href: "/", label: "Today", icon: "🏠" }];

  return (
    <div className="md:flex md:min-h-screen">
      <Sidebar items={items} name={user.fullName} role={user.role} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
