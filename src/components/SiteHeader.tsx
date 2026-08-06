import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

// Global sticky header. Server component: it reads the session directly, so the
// nav reflects who's signed in without any client-side auth state.
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold text-white"
          >
            ☕
          </span>
          Java Course Hub
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {/* Signed-out visitors only ever see /login, so nav links would 404-ish
              (redirect) — show them nothing but the sign-in button. */}
          {user && (
            <Link
              href="/"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Curriculum
            </Link>
          )}

          {/* The teacher link only exists for teachers — students never see it. */}
          {user?.role === "teacher" && (
            <Link
              href="/teacher"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Reflections
            </Link>
          )}

          {user ? (
            <>
              <span className="hidden sm:inline text-zinc-500">{user.fullName}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
