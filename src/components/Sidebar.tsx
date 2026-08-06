"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/login/actions";

// App shell navigation. Client-side only because it needs the current path for
// active state and a toggle for the mobile drawer — the *contents* are decided
// on the server (see AppShell) so a student never receives teacher links.

export type NavItem = { href: string; label: string; icon: string };

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
  const current = activeHref(pathname, items);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-emerald-600 text-white font-medium"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            <span aria-hidden="true" className="text-base">
              {item.icon}
            </span>
            {item.label}
          </Link>
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
