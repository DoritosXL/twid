import { useDroppable } from "@dnd-kit/core";

/** The one way to delete a task: drag its chip up here and let go.
 *  Lives in the week screen's top strip so it's reachable from every
 *  day without scrolling. */
export function Bin() {
  const { setNodeRef, isOver } = useDroppable({ id: "bin" });

  return (
    <div
      ref={setNodeRef}
      className={`bin${isOver ? " over" : ""}`}
      role="button"
      aria-label="Drop a task here to delete it"
      title="Drag a task here to delete it"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M4 7h16M10 4h4M9.5 7v11M14.5 7v11M6 7l1 13h10l1-13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
