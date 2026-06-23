export type Habit = {
  id: string;
  name: string;
  goal: number;
  color: string;
};

export type Completion = {
  habitId: string;
  completedOn: string;
};

export type TrackerData = {
  habits: Habit[];
  completions: Completion[];
};

export type HabitInput = Pick<Habit, "name" | "goal" | "color">;
