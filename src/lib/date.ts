import type { DayKey } from "./types";

export interface DayDef {
  key: DayKey;
  label: string;
  short: string;
}

export const DAYS: DayDef[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function mondayKey(d: Date): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return isoDate(date);
}

export function weekDates(mondayStr: string): Date[] {
  const start = new Date(mondayStr + "T00:00:00");
  return DAYS.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatRange(dates: Date[]): string {
  const mon = dates[0];
  const sun = dates[dates.length - 1];
  const monMonth = mon.toLocaleDateString("en-US", { month: "short" });
  const sunMonth = sun.toLocaleDateString("en-US", { month: "short" });
  if (monMonth === sunMonth) {
    return `${monMonth} ${mon.getDate()}–${sun.getDate()}, ${sun.getFullYear()}`;
  }
  return `${monMonth} ${mon.getDate()} – ${sunMonth} ${sun.getDate()}, ${sun.getFullYear()}`;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
