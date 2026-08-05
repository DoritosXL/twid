export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** The app is a two-screen flow: first you write the week's tasks down,
 *  then you place them across the days. */
export type Screen = "capture" | "week";

export interface TaskItem {
  id: string;
  text: string;
}

/** Where a task chip has been dropped: a day, plus its exact drop point
 *  as a percentage of that day's canvas (so it stays put across resizes,
 *  but is fully freeform — nothing snaps into a list). */
export interface Placement {
  day: DayKey;
  x: number;
  y: number;
}

export type Assignments = Record<string, Placement>;

export interface TwidState {
  items: TaskItem[];
  assignments: Assignments;
  screen: Screen;
  /** ISO date (YYYY-MM-DD) of the Monday the current assignments belong to. */
  weekKey: string;
}
