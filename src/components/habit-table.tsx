"use client";

import type { Habit } from "@/lib/habit-types";
import { HabitRow } from "./habit-row";

type HabitTableProps = {
  habits: Habit[];
  visibleDays: number;
  completionKeys: Map<string, string>;
  readOnly: boolean;
  loading: boolean;
  onToggle: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
};

export function HabitTable({ habits, visibleDays, completionKeys, readOnly, loading, onToggle, onEdit }: HabitTableProps) {
  return (
    <div className="tracker-scroll">
      <table className="tracker-table">
        <thead>
          <tr>
            <th className="sticky-name">Habit Name</th>
            {Array.from({ length: visibleDays }, (_, index) => <th key={index + 1}>{index + 1}</th>)}
            <th className="sticky-goal">Goal</th>
            <th className="sticky-achieved">Achieved</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              visibleDays={visibleDays}
              completionKey={completionKeys.get(habit.id) ?? ""}
              readOnly={readOnly}
              onToggle={onToggle}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
      {loading && !habits.length && <div className="table-loading" aria-label="Memuat habit"><span /><span /><span /></div>}
      {!loading && !habits.length && <div className="empty-state">Belum ada habit untuk akun ini.</div>}
    </div>
  );
}
