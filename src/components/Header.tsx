interface HeaderProps {
  weekRangeText: string;
  remember: boolean;
  onRememberChange: (remember: boolean) => void;
  deleteMode: boolean;
  onToggleDeleteMode: () => void;
  onOpenInfo: () => void;
}

export function Header({
  weekRangeText,
  remember,
  onRememberChange,
  deleteMode,
  onToggleDeleteMode,
  onOpenInfo,
}: HeaderProps) {
  return (
    <header className="top">
      <div className="brand">
        <div>
          <h1 title="this week I do">twid</h1>
          <p className="weekrange">{weekRangeText}</p>
        </div>
      </div>

      <div className="topctrls">
        <button type="button" className="infobtn" aria-label="How this works" onClick={onOpenInfo}>
          i
        </button>

        <label
          className="remember"
          title="When checked, next week keeps this week's layout. When unchecked, every new week starts empty again."
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
          />
          <span>Remember layout</span>
        </label>

        <button
          type="button"
          className={`deletebtn${deleteMode ? " armed" : ""}`}
          aria-pressed={deleteMode}
          title="Tap on to arm — then tap any task to delete it."
          onClick={onToggleDeleteMode}
        >
          Delete
        </button>
      </div>
    </header>
  );
}
