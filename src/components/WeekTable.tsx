import { DAYS, isoDate, weekDates } from "../lib/date";
import { DayCanvas } from "./DayCanvas";
import type { Assignments, TaskItem } from "../lib/types";

interface WeekTableProps {
  weekKey: string;
  items: TaskItem[];
  assignments: Assignments;
  onTextChange: (id: string, text: string) => void;
}

export function WeekTable({ weekKey, items, assignments, onTextChange }: WeekTableProps) {
  const dates = weekDates(weekKey);
  const todayStr = isoDate(new Date());

  return (
    <div className="weektable">
      {DAYS.map((day, i) => (
        <DayCanvas
          key={day.key}
          day={day}
          date={dates[i]}
          isToday={isoDate(dates[i]) === todayStr}
          items={items}
          assignments={assignments}
          onTextChange={onTextChange}
        />
      ))}
    </div>
  );
}
