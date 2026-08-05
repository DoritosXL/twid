import { useRef, useState } from "react";
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
import { CaptureScreen } from "./components/CaptureScreen";
import { Header } from "./components/Header";
import { WeekTable } from "./components/WeekTable";
import { InfoDialog } from "./components/InfoDialog";
import { MAX_CHARS, PLACE_MAX, PLACE_MIN, useTwidState } from "./hooks/useTwidState";
import { clamp, formatRange, weekDates } from "./lib/date";
import type { DayKey, TaskItem } from "./lib/types";

export default function App() {
  const {
    state,
    isFirstVisit,
    setItemText,
    addItem,
    deleteItem,
    placeOnDay,
    goToWeek,
    addMoreTasks,
    resetAll,
  } = useTwidState();

  const [infoOpen, setInfoOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<TaskItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // The "how this works" popup is worth one unprompted showing — the first
  // time a new visitor reaches the board, where the dragging happens.
  const infoShown = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const weekRangeText = "Week of " + formatRange(weekDates(state.weekKey));

  function handleGoToWeek() {
    goToWeek();
    if (isFirstVisit && !infoShown.current) {
      infoShown.current = true;
      setInfoOpen(true);
    }
  }

  function handleReset() {
    if (!window.confirm("Start completely from scratch? This clears every task and where you put it.")) return;
    resetAll();
  }

  function handleDragStart(event: DragStartEvent) {
    const item = state.items.find((it) => it.id === event.active.id);
    if (!item) return;
    setActiveItem(item);
    setOverId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveItem(null);
    setOverId(null);

    if (!over) return; // released on nothing — the chip just stays put
    if (over.id === "bin") {
      deleteItem(String(active.id));
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

  if (state.screen === "capture") {
    return (
      <>
        <CaptureScreen
          items={state.items}
          onTextChange={setItemText}
          onAdd={addItem}
          onGoToWeek={handleGoToWeek}
          onOpenInfo={() => setInfoOpen(true)}
        />
        <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
      </>
    );
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
          onAddTasks={addMoreTasks}
          onReset={handleReset}
          onOpenInfo={() => setInfoOpen(true)}
        />

        <div className="boardwrap">
          <WeekTable
            weekKey={state.weekKey}
            items={state.items}
            assignments={state.assignments}
            onTextChange={setItemText}
          />
        </div>
      </div>

      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* dropAnimation={null}: dnd-kit's default drop animation eases the
          overlay back toward the dragged element's *current* DOM rect —
          for a sortable list that's fine, but for our freeform placement
          that rect is still the pre-drop position (React hasn't
          re-rendered the new placement yet), so the default animation
          visibly snapped the chip toward the wrong spot for an instant
          before the real one appeared elsewhere. Disabling it lets the
          overlay simply vanish the moment the real chip is painted in
          its new spot — no snap, no mismatch, just "it stays put." */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className={`card ghost-chip ghost-inner${overId === "bin" ? " ghost-void" : ""}`}>
            <input type="text" className="itemtext" value={activeItem.text} readOnly maxLength={MAX_CHARS} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
