"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { signOut } from "@/app/login/actions";
import { PendingButton } from "@/components/PendingButton";

// App shell navigation. Client-side only because it needs the current path for
// active state and a toggle for the mobile drawer — the *contents* are decided
// on the server (see AppShell) so a student never receives teacher links.
//
// The rail is deliberately dark in both themes: it carries the app's brand
// identity (same treatment as the login panel) and makes the content column
// read as the "paper" next to it.

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Rendered indented under the item — used for the released days of a week. */
  children?: { href: string; label: string; hint?: string }[];
};

// ---------------------------------------------------------------------------
// Collapsed groups, persisted in localStorage.
//
// This started as ordinary useState and appeared not to work at all: the shell
// re-renders on every navigation, so the collapsed group sprang open again as
// soon as you clicked a day. Persisting it outside React fixes that, and it
// survives reloads too. Read via useSyncExternalStore rather than an effect —
// the react-hooks rules reject setState-in-effect (see WeekProgress.tsx).
// ---------------------------------------------------------------------------

const COLLAPSE_KEY = "jch-nav-collapsed";
const collapseListeners = new Set<() => void>();

function subscribeCollapse(onChange: () => void) {
  collapseListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    collapseListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function collapseSnapshot(): string {
  try {
    return localStorage.getItem(COLLAPSE_KEY) ?? "";
  } catch {
    return "";
  }
}

function setCollapsed(href: string, collapsed: boolean) {
  const next = new Set<string>(parseCollapsed(collapseSnapshot()));
  if (collapsed) next.add(href);
  else next.delete(href);
  try {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next]));
  } catch {
    // Storage blocked — the toggle still works for this page view.
  }
  for (const l of collapseListeners) l();
}

function parseCollapsed(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Whole-rail collapse (desktop): shrink to an icon-only strip. The content
// column is flex-1, so it widens on its own. Persisted like the groups above.
// ---------------------------------------------------------------------------

const RAIL_KEY = "jch-rail-collapsed";
const railListeners = new Set<() => void>();

function subscribeRail(onChange: () => void) {
  railListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    railListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function railSnapshot(): boolean {
  try {
    return localStorage.getItem(RAIL_KEY) === "1";
  } catch {
    return false;
  }
}

function setRailCollapsed(collapsed: boolean) {
  try {
    if (collapsed) localStorage.setItem(RAIL_KEY, "1");
    else localStorage.removeItem(RAIL_KEY);
  } catch {
    // Storage blocked — the toggle still works for this page view.
  }
  for (const l of railListeners) l();
}

/**
 * Which nav item the current path belongs to. Longest match wins, so
 * `/teacher/lessons` highlights "Lessons" and not "Reflections" (`/teacher`),
 * which a plain startsWith() would light up as well.
 */
function activeHref(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null;
  for (const { href } of items) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}

/**
 * A dot that appears on the link you just clicked while its page is still
 * coming. Must be rendered *inside* a <Link> — that's how useLinkStatus finds
 * which navigation to report on.
 *
 * Every route here is server-rendered on demand, so a click can outlast the
 * frame it happens in; the route-level loading.tsx skeletons answer the click
 * in the content column, and this answers it in the rail. The `.link-hint`
 * class (globals.css) reserves the space always and only fades the dot in
 * after 150ms, so a fast navigation shows nothing rather than a flicker.
 */
function LinkHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={`link-hint h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 ${
        pending ? "is-pending" : ""
      }`}
    />
  );
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = activeHref(pathname, items);
  // Day links differ only by ?day=, so the query string decides which is active.
  const currentDay = searchParams.get("day");

  // Groups collapse, because the day list grows with every lesson released and
  // would otherwise push everything else off the rail. Default open; the
  // collapsed set is persisted, so it survives navigation and reloads.
  const raw = useSyncExternalStore(subscribeCollapse, collapseSnapshot, () => "");
  const collapsed = useMemo(() => new Set(parseCollapsed(raw)), [raw]);
  const isExpanded = (href: string) => !collapsed.has(href);
  const toggle = (href: string) => setCollapsed(href, isExpanded(href));

  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = item.href === current;
        const children = item.children ?? [];
        const hasChildren = children.length > 0;
        const expanded = hasChildren && isExpanded(item.href);

        return (
          <div key={item.href}>
            <div
              className={`group flex items-center rounded-xl transition-colors ${
                active ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 items-center gap-3 px-2 py-1.5 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base transition-colors ${
                    active
                      ? "bg-linear-to-br from-emerald-500 to-teal-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_10px_-4px_rgb(16_185_129/0.8)]"
                      : "border border-white/10 bg-white/5 group-hover:border-white/20"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`font-medium ${
                    active ? "text-white" : "text-zinc-400 group-hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </span>
                <LinkHint />
              </Link>

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggle(item.href)}
                  aria-expanded={expanded}
                  aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                  title={expanded ? "Collapse" : "Expand"}
                  className="mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-xs text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block leading-none transition-transform duration-150 ${
                      expanded ? "rotate-90" : ""
                    }`}
                  >
                    ❯
                  </span>
                  <span className="sr-only">
                    {expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                  </span>
                </button>
              )}
            </div>

            {hasChildren && expanded && (
              <ul className="mt-1.5 ml-[15px] max-h-72 space-y-0.5 overflow-y-auto border-l border-white/10 pl-4 pr-1">
                {children.map((child, i) => {
                  const dayOfChild = new URL(child.href, "http://x").searchParams.get("day");
                  const latest = i === children.length - 1;
                  const childActive =
                    pathname.startsWith(item.href) &&
                    (currentDay ? currentDay === dayOfChild : latest);
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          childActive ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                            childActive
                              ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white"
                              : latest
                                ? "border border-emerald-500/60 text-emerald-400"
                                : "border border-white/15 text-zinc-500"
                          }`}
                        >
                          {dayOfChild ?? i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-xs leading-tight ${
                              childActive ? "font-medium text-white" : "text-zinc-400"
                            }`}
                          >
                            {child.hint ?? child.label}
                          </span>
                        </span>
                        {latest && (
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-400">
                            Today
                          </span>
                        )}
                        <LinkHint />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      title={compact ? "Java Course Hub" : undefined}
      className="flex items-center gap-2.5 font-semibold tracking-tight text-white"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-base shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_4px_12px_-4px_rgb(16_185_129/0.8)]"
      >
        ☕
      </span>
      {!compact && (
        <span className="leading-tight">
          Java Course Hub
          <span className="block text-[10px] font-medium uppercase tracking-widest text-emerald-400/80">
            ICT · Java track
          </span>
        </span>
      )}
    </Link>
  );
}

/** Icon-only nav for the collapsed rail — no groups, no labels, just tiles. */
function CompactNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const current = activeHref(pathname, items);

  return (
    <nav className="flex flex-col items-center gap-2">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`grid h-10 w-10 place-items-center rounded-xl text-lg transition-colors ${
              active
                ? "bg-linear-to-br from-emerald-500 to-teal-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_10px_-4px_rgb(16_185_129/0.8)]"
                : "border border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white"
        >
          {initials || "☺"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{name}</span>
          <span className="block text-[11px] capitalize text-zinc-500">{role}</span>
        </span>
      </div>
      <form action={signOut} className="mt-3">
        <PendingButton
          pendingLabel="Signing out…"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
        >
          Sign out
        </PendingButton>
      </form>
    </div>
  );
}

/** The emerald glow shared with the login brand panel. */
const railGlow = {
  backgroundImage:
    "radial-gradient(24rem 16rem at 100% 0%, rgb(16 185 129 / 0.14), transparent 60%), radial-gradient(20rem 14rem at 0% 100%, rgb(20 184 166 / 0.1), transparent 55%)",
};

export function Sidebar({
  items,
  name,
  role,
}: {
  items: NavItem[];
  name: string;
  role: string;
}) {
  // The drawer closes from the link's own onClick (see NavLinks) rather than an
  // effect watching the pathname — setState inside an effect is rejected by the
  // react-hooks lint rules, and closing on click is more direct anyway.
  const [open, setOpen] = useState(false);

  // Desktop rail collapse. Server snapshot renders expanded; the stored value
  // takes over right after hydration.
  const railCollapsed = useSyncExternalStore(subscribeRail, railSnapshot, () => false);

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-zinc-950 px-4 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-zinc-200"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-30 flex flex-col justify-between overflow-y-auto bg-zinc-950 p-4 md:hidden" style={railGlow}>
          <NavLinks items={items} onNavigate={() => setOpen(false)} />
          <div className="mt-6">
            <UserBlock name={name} role={role} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:shrink-0 md:flex-col md:justify-between md:gap-6 md:overflow-y-auto md:bg-zinc-950 md:sticky md:top-0 md:h-screen md:transition-[width] md:duration-200 ${
          railCollapsed ? "md:w-[76px] md:p-3" : "md:w-64 md:p-4"
        }`}
        style={railGlow}
      >
        {railCollapsed ? (
          <>
            <div className="flex flex-col items-center gap-6 pt-2">
              <Brand compact />
              <CompactNavLinks items={items} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setRailCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10 text-base font-bold text-zinc-200 transition-colors hover:bg-white/20 hover:text-white"
              >
                <span aria-hidden="true">»</span>
              </button>
              {/* Expands rather than signing out — sign-out lives in the
                  expanded rail, where it can't be hit by accident. */}
              <button
                type="button"
                onClick={() => setRailCollapsed(false)}
                aria-label={`Open sidebar for ${name}`}
                title={name}
                className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white transition-opacity hover:opacity-80"
              >
                {name
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "☺"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="mb-8 flex items-center justify-between gap-2 px-2 pt-2">
                <Brand />
                <button
                  type="button"
                  onClick={() => setRailCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-base font-bold text-zinc-200 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <span aria-hidden="true">«</span>
                </button>
              </div>
              <NavLinks items={items} />
            </div>
            <UserBlock name={name} role={role} />
          </>
        )}
      </aside>
    </>
  );
}
