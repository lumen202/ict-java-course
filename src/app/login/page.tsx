import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

// The only public page. Everything else requires an account, so this doubles
// as the front door: a short, factual description of the course — not a sales
// pitch, since the only people here are already in the class.
const LINK_ERRORS: Record<string, string> = {
  "expired-link":
    "That invite link has expired or was already used. Ask your teacher to send a new one.",
  "invalid-link": "That link wasn't valid. Ask your teacher to send a new invite.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/";
  const linkError = typeof error === "string" ? LINK_ERRORS[error] : undefined;

  const user = await getCurrentUser();
  if (user) redirect(target);

  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 items-center gap-12 px-6 py-16 md:grid-cols-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          ICT · Java track
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Java Course Hub</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Our Java lessons, week by week. Sign in to open the current one.
        </p>

        <ul className="mt-6 space-y-3 text-sm">
          {[
            ["🗄️", "Unit 1 — Databases & SQL, then JDBC from Java"],
            ["🖥️", "Unit 2 — JavaFX desktop apps"],
            ["🌐", "Unit 3 — REST APIs with Spring Boot"],
            ["🚀", "Unit 4 — Capstone: your app talking to your own API"],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-start gap-2.5">
              <span aria-hidden="true">{icon}</span>
              <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
          Accounts are created by your teacher. If you don&apos;t have one yet,
          send them your email address.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
        <LoginForm next={target} linkError={linkError} />
      </div>
    </main>
  );
}
