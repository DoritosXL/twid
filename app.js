"use strict";

/* ── Constants ──────────────────────────────────────────── */

const STORAGE_KEY = "weekplanner:v1";

const DAYS = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
];

const MAX_CHARS = 4;

/* ── Date helpers ───────────────────────────────────────── */

function pad(n) { return String(n).padStart(2, "0"); }

function isoDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mondayKey(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return isoDate(date);
}

function weekDates(mondayStr) {
  const start = new Date(mondayStr + "T00:00:00");
  return DAYS.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatRange(dates) {
  const mon = dates[0], sun = dates[dates.length - 1];
  const monMonth = mon.toLocaleDateString("en-US", { month: "short" });
  const sunMonth = sun.toLocaleDateString("en-US", { month: "short" });
  if (monMonth === sunMonth) {
    return `${monMonth} ${mon.getDate()}–${sun.getDate()}, ${sun.getFullYear()}`;
  }
  return `${monMonth} ${mon.getDate()} – ${sunMonth} ${sun.getDate()}, ${sun.getFullYear()}`;
}

function makeId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

const PLACE_MIN = 4, PLACE_MAX = 96; // keep a dropped chip's center off the very edge

/* ── State ──────────────────────────────────────────────── */

function defaultState() {
  return {
    items: [{ id: makeId(), text: "" }],
    assignments: {}, // itemId -> { day, x, y } (x/y are % within that day's canvas, exact drop point)
    remember: false,
    weekKey: mondayKey(new Date()),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return defaultState();
    return {
      items: parsed.items,
      assignments: parsed.assignments || {},
      remember: !!parsed.remember,
      weekKey: parsed.weekKey || mondayKey(new Date()),
    };
  } catch (e) {
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureTrailingEmpty() {
  const last = state.items[state.items.length - 1];
  if (!last || last.text.trim() !== "") {
    state.items.push({ id: makeId(), text: "" });
  }
}
ensureTrailingEmpty();

/* Reset day placement on a new week, unless "remember" is checked. */
function checkWeekRollover() {
  const curWeek = mondayKey(new Date());
  if (state.weekKey !== curWeek) {
    if (!state.remember) state.assignments = {};
    state.weekKey = curWeek;
    saveState();
    render();
  }
}

/* ── Rendering ──────────────────────────────────────────── */

function buildCard(item, pos) {
  const card = document.createElement("div");
  card.className = pos ? "card note" : "card";
  card.dataset.id = item.id;
  card.addEventListener("pointerdown", (e) => onCardPointerDown(e, item.id));

  if (pos) {
    card.style.left = pos.x + "%";
    card.style.top = pos.y + "%";
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "itemtext";
  input.dataset.id = item.id;
  input.value = item.text;
  input.placeholder = "Task";
  input.maxLength = MAX_CHARS;
  input.autocomplete = "off";
  input.addEventListener("input", (e) => onItemInput(item.id, e.target.value));

  card.append(input);
  return card;
}

function render() {
  // Preserve focus + cursor position across the full re-render (typing
  // rebuilds the DOM on every keystroke via onItemInput -> render()).
  const active = document.activeElement;
  let focusId = null, selStart = null, selEnd = null;
  if (active && active.classList && active.classList.contains("itemtext")) {
    focusId = active.dataset.id;
    selStart = active.selectionStart;
    selEnd = active.selectionEnd;
  }

  const dates = weekDates(state.weekKey);
  document.getElementById("weekRange").textContent = "Week of " + formatRange(dates);
  const todayStr = isoDate(new Date());

  // Pool: tasks sit side by side, wrapping — no drop point to track here.
  const poolList = document.getElementById("poolList");
  poolList.innerHTML = "";
  const poolItems = state.items.filter((it) => !state.assignments[it.id]);
  poolItems.forEach((it) => poolList.appendChild(buildCard(it, null)));

  // Week table: 7 columns, each a freeform canvas — a chip lands exactly
  // where it's dropped, no snapping into a list.
  const weekTable = document.getElementById("weekTable");
  weekTable.innerHTML = "";
  DAYS.forEach((d, i) => {
    const dateObj = dates[i];
    const dayCol = document.createElement("section");
    dayCol.className = "daycanvas " + d.key;
    dayCol.dataset.day = d.key;
    if (isoDate(dateObj) === todayStr) dayCol.classList.add("today");

    const head = document.createElement("div");
    head.className = "colhead";
    head.innerHTML = `<h2>${d.short}</h2><div class="date">${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>`;
    dayCol.appendChild(head);

    const canvas = document.createElement("div");
    canvas.className = "canvas";
    canvas.dataset.day = d.key;

    const dayItems = state.items.filter((it) => state.assignments[it.id]?.day === d.key);
    if (dayItems.length === 0) {
      const hint = document.createElement("div");
      hint.className = "empty-hint";
      hint.textContent = "drop tasks here";
      canvas.appendChild(hint);
    } else {
      dayItems.forEach((it) => canvas.appendChild(buildCard(it, state.assignments[it.id])));
    }
    dayCol.appendChild(canvas);
    weekTable.appendChild(dayCol);
  });

  if (focusId) {
    const el = document.querySelector(`.itemtext[data-id="${CSS.escape(focusId)}"]`);
    if (el) {
      el.focus();
      try { el.setSelectionRange(selStart, selEnd); } catch (e) { /* ignore */ }
    }
  }
}

/* ── Item events ────────────────────────────────────────── */

function onItemInput(id, value) {
  const it = state.items.find((x) => x.id === id);
  if (it) it.text = value;
  ensureTrailingEmpty();
  saveState();
  render();
}

function onDeleteItem(id) {
  state.items = state.items.filter((x) => x.id !== id);
  delete state.assignments[id];
  ensureTrailingEmpty();
  saveState();
  render();
}

/* ── Drag and drop (pointer events; works with mouse + touch) ──
   There's no separate drag handle any more — the whole chip is
   pressable. A short pending phase tells a tap (-> focus the input to
   edit, or delete it if delete mode is armed) from a drag (-> movement
   past a small threshold). Dropping onto a day places the chip exactly
   where it's released — no snapping to a list. Dropping outside the
   board entirely dissolves the task. While dragging, the chip swings
   from a "pin" at its top-center: the outer wrapper tracks the pointer
   1:1, the inner note rotates with a lagging CSS transition. */

let pending = null;
let dragState = null;
let deleteMode = false;
const DRAG_THRESHOLD = 6;
const SWING_SENSITIVITY = 2.2;
const SWING_MAX_DEG = 26;

function onCardPointerDown(e, itemId) {
  if (deleteMode) e.preventDefault(); // block native input focus while armed
  pending = { itemId, card: e.currentTarget, startX: e.clientX, startY: e.clientY };
  window.addEventListener("pointermove", onPendingMove);
  window.addEventListener("pointerup", onPendingUp);
}

function onPendingMove(e) {
  if (!pending) return;
  const dx = e.clientX - pending.startX, dy = e.clientY - pending.startY;
  if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
  window.removeEventListener("pointermove", onPendingMove);
  window.removeEventListener("pointerup", onPendingUp);
  const { itemId, card } = pending;
  pending = null;
  startDrag(itemId, card, e);
}

function onPendingUp() {
  window.removeEventListener("pointermove", onPendingMove);
  window.removeEventListener("pointerup", onPendingUp);
  // Released before crossing the threshold: a plain tap. In delete mode
  // that removes the task; otherwise the browser's native focus/click
  // on the input has already happened — nothing more to do.
  if (pending && deleteMode) onDeleteItem(pending.itemId);
  pending = null;
}

function startDrag(itemId, card, e) {
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const rect = card.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.className = "ghost";
  ghost.style.left = e.clientX + "px";
  ghost.style.top = e.clientY + "px";

  const inner = card.cloneNode(true);
  inner.className = "card ghost-inner" + (card.classList.contains("note") ? " note" : "");
  inner.style.left = "0";
  inner.style.top = "0";
  inner.style.width = rect.width + "px";
  inner.style.transform = "translate(-50%, 0) rotate(0deg)"; // reset whatever the source card's transform was
  ghost.appendChild(inner);
  document.body.appendChild(ghost);

  card.classList.add("dragging-source");
  document.body.classList.add("dnd-active");

  dragState = { itemId, ghost, inner, lastX: e.clientX, targetDay: null };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e) {
  if (!dragState) return;
  dragState.ghost.style.left = e.clientX + "px";
  dragState.ghost.style.top = e.clientY + "px";

  const deltaX = e.clientX - dragState.lastX;
  dragState.lastX = e.clientX;
  const angle = clamp(deltaX * SWING_SENSITIVITY, -SWING_MAX_DEG, SWING_MAX_DEG);
  dragState.inner.style.transform = `translate(-50%, 0) rotate(${angle}deg)`;

  const under = document.elementFromPoint(e.clientX, e.clientY);
  const col = under && under.closest(".col, .daycanvas");
  document.querySelectorAll(".drag-over").forEach((c) => c.classList.remove("drag-over"));
  if (col) col.classList.add("drag-over");
  dragState.targetDay = col ? col.dataset.day : null;
  dragState.inner.classList.toggle("ghost-void", !col); // outside the board -> about to dissolve
}

function onPointerUp(e) {
  if (!dragState) return;
  const { itemId, targetDay, ghost, inner } = dragState;

  document.querySelectorAll(".drag-over").forEach((c) => c.classList.remove("drag-over"));
  document.body.classList.remove("dnd-active");
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  if (targetDay === "pool") {
    delete state.assignments[itemId];
    saveState();
    settleSwing(inner, ghost);
  } else if (targetDay) {
    // Land exactly where the pointer let go — no snapping into a list.
    const canvas = document.querySelector(`.canvas[data-day="${CSS.escape(targetDay)}"]`);
    const rect = canvas.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, PLACE_MIN, PLACE_MAX);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, PLACE_MIN, PLACE_MAX);
    state.assignments[itemId] = { day: targetDay, x, y };
    saveState();
    settleSwing(inner, ghost);
  } else {
    // Dropped outside the board entirely — dissolve it.
    state.items = state.items.filter((x) => x.id !== itemId);
    delete state.assignments[itemId];
    ensureTrailingEmpty();
    saveState();
    dissolveGhost(inner, ghost);
  }

  dragState = null;
  render();
}

function settleSwing(inner, ghost) {
  inner.style.transform = "translate(-50%, 0) rotate(0deg)";
  setTimeout(() => ghost.remove(), 160);
}

function dissolveGhost(inner, ghost) {
  inner.style.transition = "transform 180ms ease, opacity 180ms ease";
  inner.style.opacity = "0";
  inner.style.transform = "translate(-50%, 0) scale(.4)";
  setTimeout(() => ghost.remove(), 190);
}

/* ── Remember-layout toggle ─────────────────────────────── */

const rememberToggle = document.getElementById("rememberToggle");
rememberToggle.checked = state.remember;
rememberToggle.addEventListener("change", () => {
  state.remember = rememberToggle.checked;
  saveState();
});

/* ── Delete mode: tap any chip to remove it while armed ──── */

const deleteBtn = document.getElementById("deleteModeBtn");
deleteBtn.addEventListener("click", () => {
  deleteMode = !deleteMode;
  deleteBtn.classList.toggle("armed", deleteMode);
  deleteBtn.setAttribute("aria-pressed", String(deleteMode));
  document.body.classList.toggle("delete-mode", deleteMode);
});

/* ── Init ───────────────────────────────────────────────── */

checkWeekRollover();
render();
setInterval(checkWeekRollover, 60000);
