import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Header } from "./components/Header";
import { Pool } from "./components/Pool";
import { WeekTable } from "./components/WeekTable";
import { InfoDialog } from "./components/InfoDialog";
import { MAX_CHARS, PLACE_MAX, PLACE_MIN, useTwidState } from "./hooks/useTwidState";
import { clamp, formatRange, weekDates } from "./lib/date";
import type { DayKey, TaskItem } from "./lib/types";

export default function App() {
  const { state, isFirstVisit, setItemText, deleteItem, placeOnDay, moveToPool, setRemember } =
    useTwidState();

  const [deleteMode, setDeleteMode] = useState(false);
  const [infoOpen, setInfoOpen] = useState(isFirstVisit);
  const [activeItem, setActiveItem] = useState<TaskItem | null>(null);
  const [activeIsNote, setActiveIsNote] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle("delete-mode", deleteMode);
  }, [deleteMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const weekRangeText = "Week of " + formatRange(weekDates(state.weekKey));
  const poolItems = state.items.filter((it) => !state.assignments[it.id]);

  function handleDragStart(event: DragStartEvent) {
    const item = state.items.find((it) => it.id === event.active.id);
    if (!item) return;
    setActiveItem(item);
    setActiveIsNote(!!(event.active.data.current as { isNote?: boolean } | undefined)?.isNote);
    setOverId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveItem(null);
    setOverId(null);

    if (!over) {
      // Dropped outside the board entirely — dissolve it.
      deleteItem(String(active.id));
      return;
    }
    if (over.id === "pool") {
      moveToPool(String(active.id));
      return;
    }

    // Land exactly where it was released — no snapping to a list.
    const initial = active.rect.current.initial;
    if (!initial) return;
    const overRect = over.rect;
    const centerX = initial.left + initial.width / 2 + delta.x;
    const centerY = initial.top + initial.height / 2 + delta.y;
    const x = clamp(((centerX - overRect.left) / overRect.width) * 100, PLACE_MIN, PLACE_MAX);
    const y = clamp(((centerY - overRect.top) / overRect.height) * 100, PLACE_MIN, PLACE_MAX);
    placeOnDay(String(active.id), over.id as DayKey, x, y);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="wrap">
        <Header
          weekRangeText={weekRangeText}
          remember={state.remember}
          onRememberChange={setRemember}
          deleteMode={deleteMode}
          onToggleDeleteMode={() => setDeleteMode((v) => !v)}
          onOpenInfo={() => setInfoOpen(true)}
        />

        <div className="boardwrap">
          <Pool
            items={poolItems}
            deleteMode={deleteMode}
            onTextChange={setItemText}
            onDelete={deleteItem}
          />
          <WeekTable
            weekKey={state.weekKey}
            items={state.items}
            assignments={state.assignments}
            deleteMode={deleteMode}
            onTextChange={setItemText}
            onDelete={deleteItem}
          />
        </div>
      </div>

      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />

      <DragOverlay>
        {activeItem ? (
          <div className={`card${activeIsNote ? " note" : ""} ghost-inner${overId ? "" : " ghost-void"}`}>
            <input type="text" className="itemtext" value={activeItem.text} readOnly maxLength={MAX_CHARS} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
