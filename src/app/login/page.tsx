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
    "That link has expired or was already used. Sign in below, or create your account if you haven't yet.",
  "invalid-link":
    "That link didn't carry a valid code. You don't need it — create your account below with the email your teacher added.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/";
  const linkError = typeof error === "string" ? LINK_ERRORS[error] : undefined;

  const user = await getCurrentUser();
  if (user) redirect(target);

  return (
    <main className="flex flex-1 flex-col lg:grid lg:grid-cols-2">
      {/* Brand panel — always dark, with the emerald glow the app is built on. */}
      <section className="relative overflow-hidden bg-zinc-950 px-8 py-12 text-white lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(40rem 28rem at 80% 0%, rgb(16 185 129 / 0.25), transparent 60%), radial-gradient(32rem 24rem at 0% 100%, rgb(20 184 166 / 0.18), transparent 55%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_8px_20px_-6px_rgb(16_185_129/0.8)]"
            >
              ☕
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
              ICT · Java track
            </p>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Java Course Hub
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
            Our Java lessons, one day at a time — watch, build, break things on
            purpose, and turn in work you made yourself.
          </p>

          <ul className="mt-10 space-y-3 text-sm">
            {[
              ["🗄️", "Databases & SQL, then JDBC from Java"],
              ["🖥️", "JavaFX desktop apps"],
              ["🌐", "REST APIs with Spring Boot"],
              ["🚀", "Capstone: your app talking to your own API"],
            ].map(([icon, text], i) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  {icon}
                </span>
                <span className="text-zinc-300">
                  <span className="mr-2 text-xs font-bold text-emerald-400">
                    Unit {i + 1}
                  </span>
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sign-in panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Open the current lesson — right where the class left off.
          </p>
          <LoginForm next={target} linkError={linkError} />
          <p className="mt-8 text-xs text-zinc-500 leading-relaxed">
            Give your teacher your email address, then create your account here
            once they&apos;ve added you to the class list.
          </p>
        </div>
      </section>
    </main>
  );
}
