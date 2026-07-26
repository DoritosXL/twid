import { useDraggable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import { MAX_CHARS } from "../hooks/useTwidState";
import type { Placement, TaskItem } from "../lib/types";

interface TaskChipProps {
  item: TaskItem;
  placement?: Placement;
  deleteMode: boolean;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function TaskChip({ item, placement, deleteMode, onTextChange, onDelete }: TaskChipProps) {
  const isNote = !!placement;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { isNote },
  });

  const style: CSSProperties = placement
    ? { left: `${placement.x}%`, top: `${placement.y}%` }
    : {};

  return (
    <div
      ref={setNodeRef}
      className={`card${isNote ? " note" : ""}${isDragging ? " dragging-source" : ""}`}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDownCapture={(e) => {
        if (deleteMode) e.preventDefault(); // block native input focus while armed
      }}
      onClick={() => {
        if (deleteMode) onDelete(item.id);
      }}
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
