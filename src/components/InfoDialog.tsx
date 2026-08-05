import { useEffect, useRef } from "react";
import { MAX_CHARS } from "../hooks/useTwidState";

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InfoDialog({ open, onClose }: InfoDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="infodialog" onClose={onClose}>
      <h2>How twid works</h2>
      <ul>
        <li>
          <strong>Write your tasks</strong> — one short label per field (up to {MAX_CHARS} letters). Tap
          <strong> + </strong> for another field, then <strong>Go to the week calendar</strong>.
        </li>
        <li>
          <strong>Everything starts on Monday</strong> — drag each task onto the day you want it
          on. It lands exactly where you release it; placement is freeform.
        </li>
        <li>
          <strong>Deleting a task</strong> — drag its chip onto the bin in the top bar and let go.
        </li>
        <li>
          <strong>Add more tasks</strong> — the <strong>+</strong> in the top bar takes you back to
          the task list; anything new lands on Monday too.
        </li>
        <li>
          <strong>Start from scratch</strong> — <strong>↺</strong> clears every task and placement
          and returns you to an empty task list.
        </li>
      </ul>
      <button type="button" className="infoclose" onClick={onClose}>
        Got it
      </button>
    </dialog>
  );
}
