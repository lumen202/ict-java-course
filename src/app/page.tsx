import { requireUser } from "@/lib/auth";
import { StudentDashboard } from "./StudentDashboard";
import { TeacherDashboard } from "./TeacherDashboard";

// The dashboard. What you see depends on your role — students get their
// coursework, teachers get the class at a glance. Signed-out visitors never
// reach here: requireUser() sends them to /login, the only public page.
export default async function Home() {
  const user = await requireUser("/");

  return user.role === "teacher" ? (
    <TeacherDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
}
