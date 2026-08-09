import { switchDemoRole, exitDemo } from "@/app/demo/actions";
import { DEMO_TTL_HOURS } from "@/lib/demo";

// Shown on every page of a demo session. Two jobs: make it unmistakable that
// this is a sandbox (so nobody mistakes the seeded classmates for real
// students), and carry the one control the demo exists for — hopping between
// the student's view and the teacher's, which is where half the app lives.
//
// Plain forms wrapping Server Actions: the switch works without hydration, and
// signing in as the other account is a server-side operation anyway.
export function DemoBanner({ role }: { role: "student" | "teacher" }) {
  const other = role === "teacher" ? "student" : "teacher";

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-emerald-500/30 bg-emerald-950 px-4 py-2 text-xs text-emerald-100 md:px-6">
      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-300">
        Demo
      </span>
      <span className="text-emerald-200/80">
        You&apos;re signed in as the <strong className="font-semibold text-emerald-100">{role}</strong> of a
        private sandbox classroom. Nothing here touches real students; it&apos;s
        deleted after {DEMO_TTL_HOURS} hours.
      </span>

      <span className="ml-auto flex items-center gap-2">
        <form action={switchDemoRole}>
          <button
            type="submit"
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/30"
          >
            {other === "teacher" ? "👩‍🏫 Switch to teacher view" : "🎓 Switch to student view"}
          </button>
        </form>
        <form action={exitDemo}>
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-3 py-1 text-emerald-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            Exit
          </button>
        </form>
      </span>
    </div>
  );
}
