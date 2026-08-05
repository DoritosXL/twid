import { Bin } from "./Bin";

interface HeaderProps {
  weekRangeText: string;
  onAddTasks: () => void;
  onReset: () => void;
  onOpenInfo: () => void;
}

/** The week screen's top strip — deliberately the only thing above the
 *  calendar, which gets all the remaining height. */
export function Header({ weekRangeText, onAddTasks, onReset, onOpenInfo }: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <div>
          <h1 title="this week I do">twid</h1>
          <p className="weekrange">{weekRangeText}</p>
        </div>
      </div>

      <div className="topctrls">
        <Bin />

        <button type="button" className="iconbtn" aria-label="Add more tasks" title="Add more tasks" onClick={onAddTasks}>
          +
        </button>

        <button
          type="button"
          className="iconbtn"
          aria-label="Start completely from scratch"
          title="Start completely from scratch"
          onClick={onReset}
        >
          ↺
        </button>

        <button type="button" className="iconbtn infobtn" aria-label="How this works" onClick={onOpenInfo}>
          i
        </button>
      </div>
    </header>
  );
}
