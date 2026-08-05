import { useEffect, useRef, useState } from "react";
import { mondayKey } from "../lib/date";
import type { Assignments, DayKey, Screen, TaskItem, TwidState } from "../lib/types";

const STORAGE_KEY = "twid:v1";
export const MAX_CHARS = 4;
export const PLACE_MIN = 4;
export const PLACE_MAX = 96;

/** Where tasks get parked when they first land on the week board: a
 *  3x4 grid down Monday's canvas, so a dozen chips arrive readable
 *  instead of stacked on one point. Percentages of the day canvas —
 *  the same coordinate space a real drop writes. The spacing is set so
 *  chips clear each other at phone width (a day canvas is ~170x155
 *  there, and a chip is 48x32); past 12 the grid starts over and they
 *  do overlap, but they're all draggable apart from the first frame. */
const PARK_COLS = [20, 50, 80];
const PARK_ROWS = [16, 38, 60, 82];

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function emptyItem(): TaskItem {
  return { id: makeId(), text: "" };
}

function defaultState(): TwidState {
  return {
    items: [emptyItem()],
    assignments: {},
    screen: "capture",
    weekKey: mondayKey(new Date()),
  };
}

function hasContent(items: TaskItem[]): boolean {
  return items.some((it) => it.text.trim() !== "");
}

function loadState(): TwidState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return defaultState();
    const items: TaskItem[] = parsed.items;
    // A returning visitor with tasks already written down doesn't get sent
    // back through capture — the week board is where they left off. Only a
    // genuinely empty board (or a never-visited one) opens on capture.
    const screen: Screen =
      !hasContent(items) ? "capture" : parsed.screen === "capture" ? "capture" : "week";
    return {
      items,
      assignments: parsed.assignments ?? {},
      screen,
      weekKey: parsed.weekKey ?? mondayKey(new Date()),
    };
  } catch {
    return defaultState();
  }
}

function omit(assignments: Assignments, id: string): Assignments {
  if (!(id in assignments)) return assignments;
  const next = { ...assignments };
  delete next[id];
  return next;
}

/** Every task without a placement gets parked on Monday. Used when
 *  arriving on the week board (all tasks start on day one) and when a
 *  new week rolls over. Tasks already on Monday push the new ones down
 *  the grid so they don't land on top of each other. */
function parkOnMonday(items: TaskItem[], assignments: Assignments): Assignments {
  const next = { ...assignments };
  let slot = items.filter((it) => next[it.id]?.day === "mon").length;
  for (const item of items) {
    if (next[item.id]) continue;
    next[item.id] = {
      day: "mon",
      x: PARK_COLS[slot % PARK_COLS.length],
      y: PARK_ROWS[Math.floor(slot / PARK_COLS.length) % PARK_ROWS.length],
    };
    slot++;
  }
  return next;
}

export function useTwidState() {
  const isFirstVisit = useRef(typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)).current;
  const [state, setState] = useState<TwidState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // New week started -> everything is unscheduled again, so it goes back
  // to Monday (there's no holding pool anymore; the board is the only
  // place a task can live). Checked at load, then every minute in case
  // the app is left open across the boundary.
  useEffect(() => {
    function checkRollover() {
      setState((s) => {
        const curWeek = mondayKey(new Date());
        if (s.weekKey === curWeek) return s;
        return { ...s, weekKey: curWeek, assignments: parkOnMonday(s.items, {}) };
      });
    }
    checkRollover();
    const id = setInterval(checkRollover, 60_000);
    return () => clearInterval(id);
  }, []);

  function setItemText(id: string, text: string) {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, text } : it)),
    }));
  }

  /** Capture screen only: the "+" adds the next empty field by hand —
   *  the list never grows on its own. Returns the new item's id so the
   *  caller can move focus into it. */
  function addItem(): string {
    const item = emptyItem();
    setState((s) => ({ ...s, items: [...s.items, item] }));
    return item.id;
  }

  function deleteItem(id: string) {
    setState((s) => ({
      ...s,
      items: s.items.filter((it) => it.id !== id),
      assignments: omit(s.assignments, id),
    }));
  }

  function placeOnDay(id: string, day: DayKey, x: number, y: number) {
    setState((s) => ({ ...s, assignments: { ...s.assignments, [id]: { day, x, y } } }));
  }

  /** Capture -> week. Blank fields are dropped (they were only ever
   *  scaffolding for typing), and everything written down lands on
   *  Monday for the user to spread out from there. */
  function goToWeek() {
    setState((s) => {
      const items = s.items.filter((it) => it.text.trim() !== "");
      if (items.length === 0) return s;
      return { ...s, items, screen: "week", assignments: parkOnMonday(items, s.assignments) };
    });
  }

  /** Week -> capture, keeping what's already there: existing tasks stay
   *  placed, and one fresh field is waiting to be typed into. */
  function addMoreTasks() {
    setState((s) => ({ ...s, screen: "capture", items: [...s.items, emptyItem()] }));
  }

  /** "Start completely from scratch": tasks, placements and the stored
   *  copy of them all go, back to a single empty capture field. */
  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState());
  }

  return {
    state,
    isFirstVisit,
    setItemText,
    addItem,
    deleteItem,
    placeOnDay,
    goToWeek,
    addMoreTasks,
    resetAll,
  };
}
