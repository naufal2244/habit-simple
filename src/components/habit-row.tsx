"use client";

import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import { FileText, Pencil } from "lucide-react";
import type { Completion, Habit } from "@/lib/habit-types";

type HabitRowProps = {
  habit: Habit;
  visibleDays: number;
  todayDay: number | null;
  completionKey: string;
  completionLookup: Map<string, Completion>;
  readOnly: boolean;
  onToggle: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
  onOpenNote: (habit: Habit, day: number) => void;
};

export const HabitRow = memo(function HabitRow({
  habit,
  visibleDays,
  todayDay,
  completionKey,
  completionLookup,
  readOnly,
  onToggle,
  onEdit,
  onOpenNote,
}: HabitRowProps) {
  const completedDays = useMemo(
    () => new Set(completionKey ? completionKey.split(",").map(Number) : []),
    [completionKey],
  );
  const achieved = completedDays.size;
  const status = achieved >= habit.goal ? "complete" : achieved >= Math.ceil(habit.goal * 0.55) ? "partial" : "low";

  return (
    <tr style={{ "--habit-color": habit.color } as CSSProperties}>
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
        const completion = completionLookup.get(`${habit.id}:${day}`);
        const checked = Boolean(completion?.completed);
        const hasNote = Boolean(completion?.note.trim());
        return (
          <td className={`day-cell${checked ? " checked" : ""}${hasNote ? " has-note" : ""}${day === todayDay ? " today-column" : ""}`} key={day}>
            <button
              className="day-toggle"
              type="button"
              disabled={readOnly}
              onClick={() => onToggle(habit.id, day)}
              aria-label={`${habit.name}, tanggal ${day}${checked ? ", selesai" : ""}`}
              aria-pressed={checked}
            >
              <span aria-hidden="true">✓</span>
            </button>
            {(!readOnly || hasNote) && (
              <button
                className="note-control"
                type="button"
                onClick={() => onOpenNote(habit, day)}
                aria-label={`${hasNote ? "Edit" : "Tambah"} catatan ${habit.name}, tanggal ${day}`}
                title={hasNote ? "Edit catatan" : "Tambah catatan"}
              >
                <FileText size={12} />
              </button>
            )}
          </td>
        );
      })}
      <td className="sticky-goal">{habit.goal}</td>
      <td className={`sticky-achieved ${status}`}>{achieved}</td>
    </tr>
  );
});
