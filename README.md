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

It's two screens, in that order.

- **Write the week down.** You start with a single field. Type into it (max 4
  characters — short labels stay readable on the board) and a **+** appears to
  add another; Enter does the same. As soon as something is written down, **Go
  to the week calendar** takes you across.
- **Place it.** The calendar gets ~90% of the screen, with a slim strip of
  controls above it. Every task starts on **Monday**; drag each one onto the
  day you want. A chip lands exactly where you release it — placement is
  freeform, not a snapped-in list.
- **The bin** in the top strip is how you delete: drag a chip onto it and let
  go. Released anywhere else, a chip just stays where it was.
- **+** in the top strip goes back to the task list to add more (existing
  placements are kept; the new tasks land on Monday). **↺** starts completely
  from scratch, and **i** explains all of this at any time.
- A new week unschedules everything, so the tasks come back to Monday.
- Everything is stored in the browser's `localStorage` — there's no backend,
  no accounts, no network calls (besides an optional Google Font). A returning
  visitor with tasks already written down opens straight on the calendar.

## Tech

React 19 + TypeScript, built with Vite. Drag-and-drop uses
[`@dnd-kit/core`](https://dndkit.com/) with a `PointerSensor` (unifies mouse
and touch, and its activation-distance constraint is what distinguishes a
tap-to-edit from a drag). Chip placement is computed from the draggable's
own tracked rect relative to the drop target, not raw event coordinates —
which is what makes drops land exactly where released, even on touch. (One
trap: dnd-kit measures draggables with a *transform-agnostic* rect, so chips
are centred on their drop point with negative margins rather than
`translate(-50%, -50%)` — a transform there puts the rect dnd-kit reports half
a chip away from where the chip actually is, and every re-drag drifts.)

```
src/
  lib/          pure helpers: date/week math, shared types
  hooks/        useTwidState — state + localStorage persistence + weekly rollover
  components/   CaptureScreen, Header, Bin, WeekTable, DayCanvas, TaskChip, InfoDialog
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
