import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { demoEnabled, demoKeyAccepted, DEMO_TTL_HOURS } from "@/lib/demo";
import { StartDemoForm } from "./StartDemoForm";

// The demo's front door — public, but deliberately **unlinked**. Nothing the
// class sees points here: the sign-in page must not offer students a sandbox
// they could mistake for their own course, or a way to leave their real work
// behind mid-lesson. The URL is the handout, meant for a CV, a portfolio page,
// or a message to someone who asked to see the project.
//
// `noindex` for the same reason — a demo that turns up in a search for the
// school's course is exactly what this route is avoiding.
export const metadata: Metadata = {
  title: "Demo",
  robots: { index: false, follow: false },
};

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const { key } = await searchParams;

  // A 404 rather than "wrong key": the page shouldn't confirm it exists to
  // someone guessing at the URL.
  if (!demoEnabled()) notFound();
  if (!demoKeyAccepted(typeof key === "string" ? key : undefined)) notFound();

  // Starting a demo signs you into a throwaway account. Someone already signed
  // in would silently lose their session — and if that's a student mid-lesson,
  // their unsaved work with it. Ask instead.
  const user = await getCurrentUser();
  const signedInForReal = user && !user.demoCohort;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_8px_20px_-6px_rgb(16_185_129/0.8)]"
          >
            ☕
          </span>
          <p className="section-label">Java Course Hub · demo</p>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Take the whole thing for a spin
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          No sign-up. You get a private classroom of your own, already part-way
          through week 1 — with three classmates who&apos;ve turned work in.
        </p>

        <ul className="mt-6 space-y-2.5 text-sm">
          {[
            ["🎓", "Start as a student: released lessons, playable SQL games, turn-ins"],
            ["👩‍🏫", "Switch to the teacher: release a day, read the work, manage the roster"],
            ["🔒", "Entirely separate from the real class — enforced in the database, not by routing"],
            ["🧹", `Deletes itself when you leave (${DEMO_TTL_HOURS} hours at the outside)`],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-px grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {icon}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          {signedInForReal ? (
            <div className="card p-5">
              <p className="text-sm font-semibold">
                You&apos;re signed in as {user.fullName}.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Starting the demo would sign you out of that account. Go back to
                your own course, or sign out first if you really meant to.
              </p>
              <Link href="/" className="btn-primary mt-4 text-sm">
                Back to my course
              </Link>
            </div>
          ) : (
            <StartDemoForm />
          )}
        </div>

        <p className="mt-8 border-t border-zinc-200 pt-5 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800">
          In the class?{" "}
          <Link
            href="/login"
            className="text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Sign in to the real course
          </Link>{" "}
          instead — your lessons and turned-in work aren&apos;t here.
        </p>
      </div>
    </main>
  );
}
