# twid

*This Week I Do* — a tiny, self-contained weekly task board inspired by the
Montessori idea of
letting kids build their own mental model of "what happens when" — instead of
holding the whole week in your head, you write short tasks down and place
each one on the day it belongs to.

No build step, no framework, no dependencies: just `index.html`, `style.css`,
and `app.js`. Open `index.html` directly in a browser, or serve the folder
with any static file server.

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

Plain HTML/CSS/JS. Drag-and-drop is implemented with Pointer Events (works
with mouse, touch, and pen) rather than the native HTML5 Drag and Drop API,
for more control over the drag visuals (the chip swings from a "pinned"
top-center point while you drag it) and better mobile behavior.

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or simply open `index.html` in a browser — no server required.

## License

MIT — see [LICENSE](LICENSE).
