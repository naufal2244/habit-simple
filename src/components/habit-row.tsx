"use client";

import { memo, useMemo } from "react";
import { Pencil } from "lucide-react";
import type { Habit } from "@/lib/habit-types";

type HabitRowProps = {
  habit: Habit;
  visibleDays: number;
  completionKey: string;
  readOnly: boolean;
  onToggle: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
};

export const HabitRow = memo(function HabitRow({
  habit,
  visibleDays,
  completionKey,
  readOnly,
  onToggle,
  onEdit,
}: HabitRowProps) {
  const completedDays = useMemo(
    () => new Set(completionKey ? completionKey.split(",").map(Number) : []),
    [completionKey],
  );
  const achieved = completedDays.size;
  const status = achieved >= habit.goal ? "complete" : achieved >= Math.ceil(habit.goal * 0.55) ? "partial" : "low";

  return (
    <tr style={{ "--habit-color": habit.color } as React.CSSProperties}>
      <td className="sticky-name habit-name-cell">
        <span className="habit-swatch" aria-hidden="true" />
        <span className="habit-name">{habit.name}</span>
        {!readOnly && (
          <button className="edit-habit" type="button" onClick={() => onEdit(habit)} aria-label={`Edit ${habit.name}`} title="Edit habit">
            <Pencil size={15} />
          </button>
        )}
      </td>
      {Array.from({ length: visibleDays }, (_, index) => {
        const day = index + 1;
        const checked = completedDays.has(day);
        return (
          <td className={`day-cell${checked ? " checked" : ""}`} key={day}>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onToggle(habit.id, day)}
              aria-label={`${habit.name}, tanggal ${day}${checked ? ", selesai" : ""}`}
              aria-pressed={checked}
            >
              <span aria-hidden="true">✓</span>
            </button>
          </td>
        );
      })}
      <td className="sticky-goal">{habit.goal}</td>
      <td className={`sticky-achieved ${status}`}>{achieved}</td>
    </tr>
  );
});
