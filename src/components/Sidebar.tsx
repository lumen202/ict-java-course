"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { signOut } from "@/app/login/actions";

// App shell navigation. Client-side only because it needs the current path for
// active state and a toggle for the mobile drawer — the *contents* are decided
// on the server (see AppShell) so a student never receives teacher links.

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
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.href === current;
        const children = item.children ?? [];
        const hasChildren = children.length > 0;
        const expanded = hasChildren && isExpanded(item.href);

        return (
          <div key={item.href}>
            <div
              className={`flex items-center rounded-md transition-colors ${
                active
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 items-center gap-3 px-3 py-2 text-sm"
              >
                <span aria-hidden="true" className="text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggle(item.href)}
                  aria-expanded={expanded}
                  aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                  title={expanded ? "Collapse" : "Expand"}
                  className={`mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md border text-sm transition-colors ${
                    active
                      ? "border-white/40 hover:bg-white/20"
                      : "border-zinc-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
                  }`}
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
              <ul className="mt-1 ml-5 max-h-72 space-y-0.5 overflow-y-auto border-l border-zinc-200 dark:border-zinc-800 pl-3">
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
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                          childActive
                            ? "bg-emerald-100 font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block">{child.label}</span>
                          {child.hint && (
                            <span className="block truncate text-xs text-zinc-500">
                              {child.hint}
                            </span>
                          )}
                        </span>
                        {/* The newest released day is where the class is now. */}
                        {latest && (
                          <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        )}
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

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-sm font-bold text-white"
      >
        ☕
      </span>
      Java Course Hub
    </Link>
  );
}

function UserBlock({ name, role }: { name: string; role: string }) {
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="mb-3 text-xs capitalize text-zinc-500">{role}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

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

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 px-4 backdrop-blur md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-30 bg-white dark:bg-zinc-950 p-4 md:hidden">
          <NavLinks items={items} onNavigate={() => setOpen(false)} />
          <div className="mt-6">
            <UserBlock name={name} role={role} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:justify-between md:border-r md:border-zinc-200 dark:md:border-zinc-800 md:p-5 md:sticky md:top-0 md:h-screen">
        <div>
          <div className="mb-8">
            <Brand />
          </div>
          <NavLinks items={items} />
        </div>
        <UserBlock name={name} role={role} />
      </aside>
    </>
  );
}
