import { useState } from "react";
import { MAX_CHARS } from "../hooks/useTwidState";
import type { TaskItem } from "../lib/types";

interface CaptureScreenProps {
  items: TaskItem[];
  onTextChange: (id: string, text: string) => void;
  onAdd: () => string;
  onGoToWeek: () => void;
  onOpenInfo: () => void;
}

/** Screen one: writing the week down. Nothing but fields — one to start
 *  with, a "+" once there's something in the last one, and the way
 *  through to the calendar once at least one task exists. */
export function CaptureScreen({ items, onTextChange, onAdd, onGoToWeek, onOpenInfo }: CaptureScreenProps) {
  // The field to drop the caret into after "+" (or Enter) adds one.
  const [focusId, setFocusId] = useState<string | null>(null);

  const lastFilled = items[items.length - 1]?.text.trim() !== "";
  const anyFilled = items.some((it) => it.text.trim() !== "");

  function handleAdd() {
    setFocusId(onAdd());
  }

  return (
    <div className="capture">
      <header className="capturetop">
        <div>
          <h1 title="this week I do">twid</h1>
          <p className="capturelede">What do you want to do this week?</p>
        </div>
        <button type="button" className="infobtn" aria-label="How this works" onClick={onOpenInfo}>
          i
        </button>
      </header>

      <div className="capturelist">
        {items.map((item, i) => (
          <label key={item.id} className="capturerow">
            <span className="capturenum">{i + 1}</span>
            <input
              type="text"
              className="captureinput"
              value={item.text}
              placeholder={i === 0 ? "e.g. GYM" : "Task"}
              maxLength={MAX_CHARS}
              autoComplete="off"
              autoCapitalize="characters"
              autoFocus={item.id === focusId}
              onChange={(e) => onTextChange(item.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && lastFilled) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
          </label>
        ))}

        {lastFilled ? (
          <button type="button" className="addbtn" onClick={handleAdd}>
            <span aria-hidden="true">+</span> Add another task
          </button>
        ) : (
          <p className="capturehint">Up to {MAX_CHARS} letters each — short labels stay readable on the board.</p>
        )}
      </div>

      {anyFilled ? (
        <div className="capturefoot">
          <button type="button" className="gobtn" onClick={onGoToWeek}>
            Go to the week calendar
          </button>
        </div>
      ) : null}
    </div>
  );
}
