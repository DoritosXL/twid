# twid

*This Week I Do* — a tiny weekly task board inspired by the Montessori idea
of letting kids build their own mental model of "what happens when" —
instead of holding the whole week in your head, you write short tasks down
and place each one on the day it belongs to.

> This branch (`react-rewrite`) is a rebuild of the original static
> HTML/CSS/JS version (still on `main`) using React + TypeScript + Vite and
> [dnd-kit](https://dndkit.com/) for drag-and-drop. The original was fully
> hand-rolled with raw Pointer Events, which worked but accumulated a class
> of bugs (touch coordinate drift on drop, drag-ghost sizing/positioning)
> that a proven DnD library solves for free.

## How it works

- **Tasks** live in a strip at the top. Type a task (max 4 characters) and a
  fresh empty slot appears automatically — the list only grows on its own;
  nothing is ever removed except by you.
- **The week table** below shows all 7 days. Drag a task chip from the Tasks
  strip onto a day and drop it exactly where you like — placement is
  freeform, not a snapped-in list.
- **Drag a chip off the board entirely** and it dissolves (deleted). There's
  also a **Delete** button in the header: tap it to arm delete mode, then tap
  any chip to remove it, tap the button again to disarm.
- **Remember layout**: leave this unchecked and every new week starts with
  all tasks back in the Tasks strip. Check it and next week keeps the same
  day placement as this one.
- Everything is stored in the browser's `localStorage` — there's no backend,
  no accounts, no network calls (besides an optional Google Font).

## Tech

React 19 + TypeScript, built with Vite. Drag-and-drop uses
[`@dnd-kit/core`](https://dndkit.com/) with a `PointerSensor` (unifies mouse
and touch, and its activation-distance constraint is what distinguishes a
tap-to-edit from a drag). Chip placement is computed from the draggable's
own tracked rect relative to the drop target, not raw event coordinates —
which is what makes drops land exactly where released, even on touch.

```
src/
  lib/          pure helpers: date/week math, shared types
  hooks/        useTwidState — state + localStorage persistence + weekly rollover
  components/   Header, Pool, WeekTable, DayCanvas, TaskChip, InfoDialog
```

## Running locally

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
```

## License

MIT — see [LICENSE](LICENSE).
