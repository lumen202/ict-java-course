"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";
import { Spinner } from "@/components/PendingButton";
import {
  localDateKey,
  monthKey,
  periodLabel,
  weekdaysOfMonth,
  type ClassDay,
} from "@/lib/payroll/calendar";
import {
  PRESENT_MARK,
  daysPresent,
  mealAmount,
  totalReceived,
  transportAmount,
  type PayrollCandidate,
  type PayrollHeader,
  type PayrollRow,
  type PayrollSheet,
} from "@/lib/payroll/model";

// The preview *is* the export: what's on screen is the object posted to
// /api/payroll, so a number the teacher checked here is the number that lands
// in the cell. Nothing is saved — the month travels in the URL, and edits last
// until the download.

type Props = {
  year: number;
  month: number;
  monthOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
  students: PayrollCandidate[];
  /** Raw turn-in timestamps, per student, for the month and a day either side. */
  activity: Record<string, string[]>;
  header: PayrollHeader;
  cap: number;
};

const money = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const neverChanges = () => () => {};

/**
 * The roll is prefilled from the teacher's *own* calendar days, so the first
 * render has to happen in their browser — on a server (almost certainly in UTC)
 * the same timestamps bucket into different days. Gating on the hydration
 * boundary lets everything below use a plain `useState` initialiser instead of
 * an effect that corrects itself after paint.
 */
export function PayrollEditor(props: Props) {
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  if (!hydrated) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-80 w-full" />
      </div>
    );
  }

  return <Editor {...props} />;
}

function Editor({
  year,
  month,
  monthOptions,
  yearOptions,
  students,
  activity,
  header: initialHeader,
  cap: initialCap,
}: Props) {
  const router = useRouter();

  const allDays = useMemo(() => weekdaysOfMonth(year, month), [year, month]);

  const [rows, setRows] = useState<PayrollRow[]>(() => {
    const monthDates = new Set(allDays.map((d) => d.date));
    return students.map((student) => ({
      ...student,
      // A turn-in is the only evidence the app has that someone was in the
      // room. It's a starting point, not a record — the teacher corrects it.
      present: [
        ...new Set(
          (activity[student.id] ?? [])
            .map((at) => localDateKey(new Date(at)))
            .filter((date) => monthDates.has(date)),
        ),
      ],
    }));
  });
  const [excluded, setExcluded] = useState<string[]>([]);
  const [beforeCheckAll, setBeforeCheckAll] = useState<PayrollRow[] | null>(null);
  const [header, setHeader] = useState(initialHeader);
  const [cap, setCap] = useState(initialCap);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropped = useMemo(() => new Set(excluded), [excluded]);
  const days = useMemo(() => allDays.filter((d) => !dropped.has(d.date)), [allDays, dropped]);

  const sheet: PayrollSheet = { year, month, days, rows, header, cap };
  const period = periodLabel(year, month);
  const total = rows.reduce((sum, row) => sum + totalReceived(row, days, cap), 0);

  // Week bands span every weekday of the month so a dropped day can be put
  // back, but they carry the number the *export* will give them — a week with
  // nothing left in it gets no number there, and none here.
  const bands = useMemo(() => {
    const out: { span: number; label: string }[] = [];
    let counted = 0;
    for (let i = 0; i < allDays.length; ) {
      let j = i;
      while (j < allDays.length && allDays[j].week === allDays[i].week) j++;
      const alive = allDays.slice(i, j).some((d) => !dropped.has(d.date));
      if (alive) counted++;
      out.push({ span: j - i, label: alive ? String(counted) : "—" });
      i = j;
    }
    return out;
  }, [allDays, dropped]);

  function goTo(nextYear: number, nextMonth: number) {
    router.push(`/teacher/payroll?month=${monthKey(nextYear, nextMonth)}`);
  }

  function setPresent(rowId: string, date: string, present: boolean) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const marked = new Set(row.present);
        if (present) marked.add(date);
        else marked.delete(date);
        return { ...row, present: [...marked] };
      }),
    );
  }

  function toggleColumn(date: string) {
    const everyone = rows.length > 0 && rows.every((row) => row.present.includes(date));
    setRows((current) =>
      current.map((row) => {
        const marked = new Set(row.present);
        if (everyone) marked.delete(date);
        else marked.add(date);
        return { ...row, present: [...marked] };
      }),
    );
  }

  function toggleStudent(rowId: string) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const full = days.every((d) => row.present.includes(d.date));
        // Ticks on dropped days are kept either way: putting the day back
        // should restore what was there, not silently blank it.
        const kept = row.present.filter((date) => dropped.has(date));
        return { ...row, present: full ? kept : [...kept, ...days.map((d) => d.date)] };
      }),
    );
  }

  function setRate(rowId: string, field: "transportRate" | "mealRate", value: number) {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  }

  function setRateForEveryone(field: "transportRate" | "mealRate", value: number) {
    setRows((current) => current.map((row) => ({ ...row, [field]: value })));
  }

  /** Ticks every remaining class day for every row — the bulk version of
   * clicking each weekday letter, for when attendance is "everyone, every day"
   * and the per-day turn-in prefill would otherwise leave gaps to fix by hand. */
  function checkAll() {
    setBeforeCheckAll(rows);
    setRows((current) =>
      current.map((row) => {
        const kept = row.present.filter((date) => dropped.has(date));
        return { ...row, present: [...kept, ...days.map((d) => d.date)] };
      }),
    );
  }

  function undoCheckAll() {
    if (!beforeCheckAll) return;
    setRows(beforeCheckAll);
    setBeforeCheckAll(null);
  }

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheet),
      });

      if (!response.ok) {
        const said = await response.json().catch(() => null);
        setError(said?.error ?? "Couldn't build the file.");
        return;
      }

      const disposition = response.headers.get("Content-Disposition") ?? "";
      const named = /filename="([^"]+)"/.exec(disposition)?.[1];
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = named ?? `Payroll ${period}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* `relative z-20` is load-bearing, not decoration. `.card` sets a
          backdrop-filter, which makes it a stacking context — so the month
          picker's own z-index only ranks it *inside* this card, and the table
          card below — a later sibling, also a stacking context — painted over
          the open list, hiding most of the months behind it. Giving this card a
          z-index puts the two cards in the same comparison. Confirmed by
          isolation: dropping the backdrop-filter alone makes it render. */}
      <section className="card relative z-20 flex flex-wrap items-end gap-4 p-5">
        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">Month</span>
          <Select
            ariaLabel="Month"
            value={String(month)}
            onChange={(value) => goTo(year, Number(value))}
            options={monthOptions}
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">Year</span>
          <Select
            ariaLabel="Year"
            value={String(year)}
            onChange={(value) => goTo(Number(value), month)}
            options={yearOptions}
            maxWidthClassName="max-w-28"
          />
        </div>

        <RateField
          label="Transportation rate for everyone"
          onCommit={(value) => setRateForEveryone("transportRate", value)}
        />
        <RateField
          label="Meal rate for everyone"
          onCommit={(value) => setRateForEveryone("mealRate", value)}
        />

        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-500">Attendance</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost px-3 py-2"
              onClick={checkAll}
              disabled={days.length === 0 || rows.length === 0}
              title="Tick every remaining class day for every student"
            >
              Check all present
            </button>
            {beforeCheckAll && (
              <button
                type="button"
                className="btn-ghost px-3 py-2"
                onClick={undoCheckAll}
                title="Undo check all present"
              >
                Undo
              </button>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="font-semibold tabular-nums">{money.format(total)}</div>
            <div className="text-xs text-zinc-500">
              {days.length} class {days.length === 1 ? "day" : "days"} · {rows.length}{" "}
              {rows.length === 1 ? "student" : "students"}
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={download}
            disabled={busy || days.length === 0}
          >
            {busy ? (
              <>
                <Spinner />
                Building…
              </>
            ) : (
              "Download .xlsx"
            )}
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-950/40">
          {error}
        </p>
      )}

      <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
        Click a <strong>date</strong> to take that day off the roll — a holiday, a cancelled
        session. It stays visible, struck through, so you can put it back. Click a{" "}
        <strong>weekday letter</strong> to mark everyone in or out for that day, a{" "}
        <strong>row number</strong> to do the same for one student, or any cell to change a single
        tick.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-max border-collapse text-xs">
          <caption className="caption-bottom px-4 py-3 text-left text-xs text-zinc-500">
            Preview of {period}. The downloaded form also carries the No. and Signature columns,
            the certification block, and blank ruled lines up to ten names.
          </caption>
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900">
              <Th rowSpan={3} className="sticky left-0 z-10 w-10 bg-zinc-50 dark:bg-zinc-900">
                No.
              </Th>
              <Th rowSpan={3} className="sticky left-10 z-10 bg-zinc-50 text-left dark:bg-zinc-900">
                Name
              </Th>
              <Th>Week</Th>
              {bands.map((band, i) => (
                <Th key={i} colSpan={band.span}>
                  {band.label}
                </Th>
              ))}
              <Th rowSpan={3}>
                Total
                <br />
                days
              </Th>
              <Th colSpan={2}>Transportation</Th>
              <Th colSpan={2}>Meal allowance</Th>
              <Th rowSpan={3}>
                Total
                <br />
                received
              </Th>
              <Th rowSpan={3}>
                <span className="sr-only">Remove</span>
              </Th>
            </tr>
            <tr className="bg-zinc-50 dark:bg-zinc-900">
              <Th>Day</Th>
              {allDays.map((day) => (
                <Th key={day.date} className={dropped.has(day.date) ? "opacity-40" : undefined}>
                  <button
                    type="button"
                    className="w-full hover:text-emerald-600"
                    onClick={() => toggleColumn(day.date)}
                    title={`Mark everyone in or out on ${day.weekday} ${day.day}`}
                  >
                    {day.weekday}
                  </button>
                </Th>
              ))}
              <Th>
                Daily
                <br />
                rate
              </Th>
              <Th>
                Amount
                <br />
                due
              </Th>
              <Th>
                Daily
                <br />
                rate
              </Th>
              <Th>Amount</Th>
            </tr>
            <tr className="bg-zinc-50 dark:bg-zinc-900">
              <Th>Date</Th>
              {allDays.map((day) => {
                const off = dropped.has(day.date);
                return (
                  <Th key={day.date}>
                    <button
                      type="button"
                      className={`w-full hover:text-emerald-600 ${
                        off ? "text-zinc-400 line-through" : ""
                      }`}
                      onClick={() =>
                        setExcluded((current) =>
                          current.includes(day.date)
                            ? current.filter((d) => d !== day.date)
                            : [...current, day.date],
                        )
                      }
                      title={off ? "Put this day back on the roll" : "Take this day off the roll"}
                    >
                      {day.day}
                    </button>
                  </Th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row, index) => (
              <StudentRow
                key={row.id}
                index={index}
                row={row}
                allDays={allDays}
                days={days}
                dropped={dropped}
                cap={cap}
                onToggleCell={setPresent}
                onToggleStudent={toggleStudent}
                onRate={setRate}
                onRemove={() => setRows((current) => current.filter((r) => r.id !== row.id))}
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={allDays.length + 9} className="px-4 py-8 text-center text-zinc-500">
                  Nobody on the class list yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer text-sm font-semibold">Form details</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Project"
            value={header.project}
            onChange={(project) => setHeader({ ...header, project })}
          />
          <Field
            label="Venue"
            value={header.venue}
            onChange={(venue) => setHeader({ ...header, venue })}
          />
          {(["certifier", "approver", "payer"] as const).map((who) => (
            <div key={who} className="grid gap-2">
              <Field
                label={`${SIGNATORY_LABEL[who]} — name`}
                value={header[who].name}
                onChange={(name) => setHeader({ ...header, [who]: { ...header[who], name } })}
              />
              <Field
                label={`${SIGNATORY_LABEL[who]} — title`}
                value={header[who].title}
                onChange={(title) => setHeader({ ...header, [who]: { ...header[who], title } })}
              />
            </div>
          ))}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500">
              Cap on the total received
            </span>
            <input
              className="input"
              type="number"
              min={0}
              value={cap}
              onChange={(e) => setCap(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
        </div>
      </details>
    </div>
  );
}

const SIGNATORY_LABEL = {
  certifier: "Certified by",
  approver: "Approved by",
  payer: "Paid by",
} as const;

function StudentRow({
  index,
  row,
  allDays,
  days,
  dropped,
  cap,
  onToggleCell,
  onToggleStudent,
  onRate,
  onRemove,
}: {
  index: number;
  row: PayrollRow;
  allDays: ClassDay[];
  days: ClassDay[];
  dropped: Set<string>;
  cap: number;
  onToggleCell: (rowId: string, date: string, present: boolean) => void;
  onToggleStudent: (rowId: string) => void;
  onRate: (rowId: string, field: "transportRate" | "mealRate", value: number) => void;
  onRemove: () => void;
}) {
  const present = new Set(row.present);

  return (
    <tr className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10">
      <Td className="sticky left-0 z-10 w-10 bg-white p-0 text-center dark:bg-zinc-900">
        <button
          type="button"
          className="h-full w-full px-2 py-1.5 hover:text-emerald-600"
          onClick={() => onToggleStudent(row.id)}
          title="Mark this student in or out for every day"
        >
          {index + 1}
        </button>
      </Td>
      <Td className="sticky left-10 z-10 whitespace-nowrap bg-white text-left font-medium dark:bg-zinc-900">
        {row.last}
        {row.first && <span className="font-normal text-zinc-500">, {row.first}</span>}
        {row.middle && <span className="font-normal text-zinc-500"> {row.middle}</span>}
      </Td>
      <Td />
      {allDays.map((day) => {
        const off = dropped.has(day.date);
        const ticked = present.has(day.date);
        return (
          <Td key={day.date} className="p-0">
            <button
              type="button"
              disabled={off}
              onClick={() => onToggleCell(row.id, day.date, !ticked)}
              className={`h-7 w-full text-center ${
                off
                  ? "cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/60"
                  : ticked
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-300 hover:bg-emerald-100/60 dark:text-zinc-700 dark:hover:bg-emerald-900/30"
              }`}
              aria-label={`${row.last} on day ${day.day}`}
              aria-pressed={ticked}
            >
              {ticked ? PRESENT_MARK : "·"}
            </button>
          </Td>
        );
      })}
      <Td className="text-center font-semibold">{daysPresent(row, days)}</Td>
      <Td className="p-1">
        <RateInput value={row.transportRate} onChange={(v) => onRate(row.id, "transportRate", v)} />
      </Td>
      <Td className="text-right tabular-nums">{money.format(transportAmount(row, days))}</Td>
      <Td className="p-1">
        <RateInput value={row.mealRate} onChange={(v) => onRate(row.id, "mealRate", v)} />
      </Td>
      <Td className="text-right tabular-nums">{money.format(mealAmount(row, days))}</Td>
      <Td className="text-right font-semibold tabular-nums">
        {money.format(totalReceived(row, days, cap))}
      </Td>
      <Td className="text-center">
        <button
          type="button"
          className="px-1 text-zinc-400 hover:text-red-600"
          onClick={onRemove}
          title={`Take ${row.last} off this month's roll`}
          aria-label={`Take ${row.last} off this month's roll`}
        >
          ×
        </button>
      </Td>
    </tr>
  );
}

function Th({
  children,
  className = "",
  colSpan,
  rowSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`border border-zinc-200 px-1.5 py-1 text-center align-middle text-[11px] font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <td
      className={`border border-zinc-200 px-2 py-1.5 align-middle dark:border-zinc-800 ${className}`}
    >
      {children}
    </td>
  );
}

/**
 * Holds the raw text while it's being typed, so "0" and "0." survive the trip
 * through Number() — a purely numeric controlled value erases the field the
 * moment you type a leading zero. Blur hands control back to the real value,
 * which is how "apply to everyone" reaches a field nobody is editing.
 */
function RateInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [typed, setTyped] = useState<string | null>(null);

  return (
    <input
      type="number"
      min={0}
      step="0.01"
      placeholder="0"
      value={typed ?? (value || "")}
      onChange={(e) => {
        setTyped(e.target.value);
        onChange(Math.max(0, Number(e.target.value) || 0));
      }}
      onBlur={() => setTyped(null)}
      className="w-20 rounded-md border border-zinc-300 bg-transparent px-1.5 py-0.5 text-right tabular-nums focus:border-emerald-400 focus:outline-none dark:border-zinc-700"
    />
  );
}

/** Sets one rate on every student at once — the common case, since most match. */
function RateField({ label, onCommit }: { label: string; onCommit: (value: number) => void }) {
  const [value, setValue] = useState("");

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          placeholder="0"
          onChange={(e) => setValue(e.target.value)}
          className="input w-28 py-2 text-right tabular-nums"
        />
        <button
          type="button"
          className="btn-ghost px-3 py-2"
          onClick={() => onCommit(Math.max(0, Number(value) || 0))}
        >
          Apply
        </button>
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
