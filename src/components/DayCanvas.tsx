import { useDroppable } from "@dnd-kit/core";
import { TaskChip } from "./TaskChip";
import type { DayDef } from "../lib/date";
import type { Assignments, TaskItem } from "../lib/types";

interface DayCanvasProps {
  day: DayDef;
  date: Date;
  isToday: boolean;
  items: TaskItem[];
  assignments: Assignments;
  onTextChange: (id: string, text: string) => void;
}

export function DayCanvas({ day, date, isToday, items, assignments, onTextChange }: DayCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.key });
  const dayItems = items.filter((it) => assignments[it.id]?.day === day.key);

  return (
    <section
      className={`daycanvas ${day.key}${isToday ? " today" : ""}${isOver ? " drag-over" : ""}`}
    >
      <div className="colhead">
        <h2>{day.short}</h2>
        <div className="date">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      </div>
      <div className="canvas" ref={setNodeRef}>
        {dayItems.length === 0 ? (
          <div className="empty-hint">drop tasks here</div>
        ) : (
          dayItems.map((item) => (
            <TaskChip
              key={item.id}
              item={item}
              placement={assignments[item.id]}
              onTextChange={onTextChange}
            />
          ))
        )}
      </div>
    </section>
  );
}
