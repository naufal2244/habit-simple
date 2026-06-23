"use client";

import { useEffect, useRef } from "react";
import type { Habit } from "@/lib/habit-types";
import { HabitRow } from "./habit-row";

type HabitTableProps = {
  habits: Habit[];
  visibleDays: number;
  todayDay: number | null;
  completionKeys: Map<string, string>;
  readOnly: boolean;
  loading: boolean;
  onToggle: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
};

export function HabitTable({ habits, visibleDays, todayDay, completionKeys, readOnly, loading, onToggle, onEdit }: HabitTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFocusedDay = useRef<number | null>(null);

  useEffect(() => {
    if (!todayDay) {
      lastFocusedDay.current = null;
      return;
    }
    if (loading || lastFocusedDay.current === todayDay) return;

    const container = scrollRef.current;
    const todayHeader = container?.querySelector<HTMLElement>(`th[data-day="${todayDay}"]`);
    if (!container || !todayHeader) return;

    const stickyNameWidth = container.querySelector<HTMLElement>("th.sticky-name")?.offsetWidth ?? 0;
    const availableWidth = Math.max(0, container.clientWidth - stickyNameWidth);
    const targetLeft = todayHeader.offsetLeft - stickyNameWidth - availableWidth / 2 + todayHeader.offsetWidth / 2;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: reducedMotion ? "auto" : "smooth" });
    lastFocusedDay.current = todayDay;
  }, [loading, todayDay]);

  return (
    <div className="tracker-scroll" ref={scrollRef}>
      <table className="tracker-table">
        <thead>
          <tr>
            <th className="sticky-name">Habit Name</th>
            {Array.from({ length: visibleDays }, (_, index) => {
              const day = index + 1;
              return <th className={day === todayDay ? "today-column" : ""} data-day={day} key={day} title={day === todayDay ? "Hari ini" : undefined}>{day}</th>;
            })}
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
              todayDay={todayDay}
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
