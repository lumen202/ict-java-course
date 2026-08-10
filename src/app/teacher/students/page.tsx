import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddStudentForm } from "../AddStudentForm";
import { EditableName } from "../EditableName";
import { RemoveStudentButton } from "../RemoveStudentButton";

export const metadata: Metadata = { title: "Students" };

// The class list (who may register) and the roster (who actually has an
// account). Both read as the teacher's own user — the "teachers manage the
// class list" and "teachers read all profiles" RLS policies are what make them
// visible at all.

type AllowedRow = {
  email: string;
  first_name: string;
  last_name: string;
  added_at: string;
  registered_at: string | null;
};

type ProfileRow = {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string;
  role: "student" | "teacher";
  onboarded_at: string | null;
};

export default async function StudentsPage() {
  await requireTeacher("/teacher/students");

  const supabase = await createClient();
  const [{ data: allowed, error: allowedError }, { data: profiles }] = await Promise.all([
    supabase
      .from("allowed_students")
      .select("email, first_name, last_name, added_at, registered_at")
      .order("added_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, created_at, email, full_name, role, onboarded_at")
      .order("created_at", { ascending: false }),
  ]);

  const classList = (allowed ?? []) as AllowedRow[];
  const people = (profiles ?? []) as ProfileRow[];

  const accountEmails = new Set(
    people.map((p) => (p.email ?? "").toLowerCase()).filter(Boolean),
  );

  const admin = createAdminClient();
  if (admin) {
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authUsers?.users ?? []) {
      if (u.email) accountEmails.add(u.email.toLowerCase());
    }
  }
  // With a service-role key, Auth is the live authority on whether an account
  // exists — ask it directly rather than trusting `registered_at`, which is
  // stamped once at signup and never cleared, so it would keep saying
  // "Registered" (and hiding Remove) forever after a teacher deletes the
  // account in Supabase. Without a service-role key we can't ask Auth, so fall
  // back to the stamp — it at least covers accounts created before the
  // registered_at/profiles.email triggers existed.
  const hasAccount = admin
    ? (row: AllowedRow) => accountEmails.has(row.email.toLowerCase())
    : (row: AllowedRow) =>
        Boolean(row.registered_at) || accountEmails.has(row.email.toLowerCase());

  const registered = classList.filter(hasAccount).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Students</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {classList.length} on the class list · {registered} have created an account
      </p>


      <section className="card mb-10 p-5">
        <h2 className="text-sm font-semibold mb-1">Add a student</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Only emails on this list can create an account. Add the address, then
          tell the student to go to <span className="font-mono">/register</span> and
          set their own password — no email is sent.
        </p>
        <AddStudentForm />
      </section>

      {allowedError && (
        <p className="mb-6 rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          Couldn&apos;t load the class list: {allowedError.message}
        </p>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold">Class list</h2>
        {classList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
            Nobody yet — add your first student above.
          </p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Name on list</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {classList.map((s) => (
                  <tr key={s.email}>
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <EditableName
                        email={s.email}
                        firstName={s.first_name}
                        lastName={s.last_name}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {hasAccount(s) ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ✓ Registered
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-500">Not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(s.added_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!hasAccount(s) && <RemoveStudentButton email={s.email} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Accounts</h2>
        {people.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
            No accounts yet.
          </p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {people.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      {p.full_name || <span className="text-zinc-400">— not set —</span>}
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
