import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "../InviteForm";
import { TeacherTabs } from "../TeacherTabs";

export const metadata: Metadata = { title: "Students" };

// Roster + invites. Reads profiles as the teacher's own user: the
// "teachers read all profiles" RLS policy is what makes the full list visible.

type ProfileRow = {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  role: "student" | "teacher";
  onboarded_at: string | null;
};

export default async function StudentsPage() {
  await requireTeacher("/teacher/students");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, created_at, email, full_name, first_name, middle_name, last_name, role, onboarded_at",
    )
    .order("created_at", { ascending: false });

  const people = (data ?? []) as ProfileRow[];
  const students = people.filter((p) => p.role === "student");
  const pending = students.filter((p) => !p.onboarded_at).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Students</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {students.length} invited · {students.length - pending} set up · {pending} waiting
      </p>

      <TeacherTabs active="students" />

      <section className="mb-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold mb-1">Invite a student</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Students can&apos;t sign themselves up. Send their email an invite here;
          the link lets them set their own password.
        </p>
        <InviteForm />
      </section>

      {error && (
        <p className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          Couldn&apos;t load the roster: {error.message}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold">Registered users</h2>
        {people.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
            Nobody yet — send your first invite above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Invited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {people.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      {p.full_name || (
                        <span className="text-zinc-400">— not set yet —</span>
                      )}
                      {p.middle_name && (
                        <span className="block text-xs text-zinc-500">
                          {p.first_name} {p.middle_name} {p.last_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.role === "teacher"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.onboarded_at ? (
                        <span className="text-emerald-700 dark:text-emerald-400">✓ Active</span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-500">Invite pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
