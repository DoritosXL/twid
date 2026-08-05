import { useDraggable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import { MAX_CHARS } from "../hooks/useTwidState";
import type { Placement, TaskItem } from "../lib/types";

interface TaskChipProps {
  item: TaskItem;
  placement: Placement;
  onTextChange: (id: string, text: string) => void;
}

export function TaskChip({ item, placement, onTextChange }: TaskChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });

  const style: CSSProperties = { left: `${placement.x}%`, top: `${placement.y}%` };

  return (
    <div
      ref={setNodeRef}
      className={`card note${isDragging ? " dragging-source" : ""}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <input
        type="text"
        className="itemtext"
        value={item.text}
        placeholder="Task"
        maxLength={MAX_CHARS}
        autoComplete="off"
        onChange={(e) => onTextChange(item.id, e.target.value)}
      />
    </div>
  );
}
