import { useDroppable } from "@dnd-kit/core";
import { TaskChip } from "./TaskChip";
import type { TaskItem } from "../lib/types";

interface PoolProps {
  items: TaskItem[];
  deleteMode: boolean;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function Pool({ items, deleteMode, onTextChange, onDelete }: PoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });

  return (
    <section className={`col pool${isOver ? " drag-over" : ""}`}>
      <div className="colhead">
        <h2>Tasks</h2>
      </div>
      <div className="itemlist" ref={setNodeRef}>
        {items.map((item) => (
          <TaskChip
            key={item.id}
            item={item}
            deleteMode={deleteMode}
            onTextChange={onTextChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
