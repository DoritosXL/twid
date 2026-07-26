import { useEffect, useRef } from "react";

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
          <strong>Tasks</strong> — type a task (up to 4 letters) in the strip up top. A fresh
          blank slot appears automatically so you can keep adding more.
        </li>
        <li>
          <strong>Placing a task</strong> — drag any task chip onto a day and drop it exactly
          where you release it.
        </li>
        <li>
          <strong>Deleting a task</strong> — drag it off the board entirely to dissolve it, or
          tap <strong>Delete</strong> in the header to arm delete mode, then tap any chip.
        </li>
        <li>
          <strong>Remember layout</strong> — check it to keep this week's placement next week;
          leave it unchecked and every new week starts with all tasks back in the strip.
        </li>
      </ul>
      <button type="button" className="infoclose" onClick={onClose}>
        Got it
      </button>
    </dialog>
  );
}
