import { useEffect, useRef, useState } from "react";
import { mondayKey } from "../lib/date";
import type { Assignments, DayKey, TaskItem, TwidState } from "../lib/types";

const STORAGE_KEY = "twid:v1";
export const MAX_CHARS = 4;
export const PLACE_MIN = 4;
export const PLACE_MAX = 96;

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultState(): TwidState {
  return {
    items: [{ id: makeId(), text: "" }],
    assignments: {},
    remember: false,
    weekKey: mondayKey(new Date()),
  };
}

function loadState(): TwidState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return defaultState();
    return {
      items: parsed.items,
      assignments: parsed.assignments ?? {},
      remember: !!parsed.remember,
      weekKey: parsed.weekKey ?? mondayKey(new Date()),
    };
  } catch {
    return defaultState();
  }
}

/** The list only ever grows on its own: whenever the last slot has been
 *  typed into, a fresh empty one appears after it. Nothing is removed
 *  except by an explicit delete. */
function withTrailingEmpty(items: TaskItem[]): TaskItem[] {
  const last = items[items.length - 1];
  if (!last || last.text.trim() !== "") {
    return [...items, { id: makeId(), text: "" }];
  }
  return items;
}

function omit(assignments: Assignments, id: string): Assignments {
  if (!(id in assignments)) return assignments;
  const next = { ...assignments };
  delete next[id];
  return next;
}

export function useTwidState() {
  const isFirstVisit = useRef(typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)).current;
  const [state, setState] = useState<TwidState>(() => {
    const loaded = loadState();
    return { ...loaded, items: withTrailingEmpty(loaded.items) };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // New week started (and "remember" isn't checked) -> everything goes
  // back to the pool. Checked at load, then every minute in case the
  // app is left open across the boundary.
  useEffect(() => {
    function checkRollover() {
      setState((s) => {
        const curWeek = mondayKey(new Date());
        if (s.weekKey === curWeek) return s;
        return { ...s, weekKey: curWeek, assignments: s.remember ? s.assignments : {} };
      });
    }
    checkRollover();
    const id = setInterval(checkRollover, 60_000);
    return () => clearInterval(id);
  }, []);

  function setItemText(id: string, text: string) {
    setState((s) => ({
      ...s,
      items: withTrailingEmpty(s.items.map((it) => (it.id === id ? { ...it, text } : it))),
    }));
  }

  function deleteItem(id: string) {
    setState((s) => ({
      ...s,
      items: withTrailingEmpty(s.items.filter((it) => it.id !== id)),
      assignments: omit(s.assignments, id),
    }));
  }

  function placeOnDay(id: string, day: DayKey, x: number, y: number) {
    setState((s) => ({ ...s, assignments: { ...s.assignments, [id]: { day, x, y } } }));
  }

  function moveToPool(id: string) {
    setState((s) => ({ ...s, assignments: omit(s.assignments, id) }));
  }

  function setRemember(remember: boolean) {
    setState((s) => ({ ...s, remember }));
  }

  return { state, isFirstVisit, setItemText, deleteItem, placeOnDay, moveToPool, setRemember };
}
