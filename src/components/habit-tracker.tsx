"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, useTransition } from "react";
import useSWR from "swr";
import { CalendarDays, CheckCheck, ChevronLeft, ChevronRight, ListChecks, Plus, Target } from "lucide-react";
import type { Habit, HabitInput, TrackerData } from "@/lib/habit-types";
import { HabitTable } from "./habit-table";
import { TrackerInsights } from "./tracker-insights";

const HabitModal = dynamic(() => import("./habit-modal").then((module) => module.HabitModal), { ssr: false });

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const emptyData: TrackerData = { habits: [], completions: [] };

async function fetcher(url: string): Promise<TrackerData> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Data habit gagal dimuat");
  return response.json();
}

export function HabitTracker({ readOnly = false }: { readOnly?: boolean }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [cutoff, setCutoff] = useState(now.getDate());
  const [editor, setEditor] = useState<Habit | null | undefined>(undefined);
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const visibleDays = readOnly ? Math.min(cutoff, dayCount) : dayCount;
  const datePrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const dataKey = `/api/habits?year=${year}&month=${month}`;
  const { data, error, isLoading, mutate } = useSWR<TrackerData>(dataKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
  });
  const habits = data?.habits ?? emptyData.habits;
  const completions = data?.completions ?? emptyData.completions;

  const completionKeys = useMemo(() => {
    const daysByHabit = new Map<string, number[]>();
    for (const completion of completions) {
      const day = Number(completion.completedOn.slice(-2));
      if (day > visibleDays) continue;
      const days = daysByHabit.get(completion.habitId) ?? [];
      days.push(day);
      daysByHabit.set(completion.habitId, days);
    }
    return new Map([...daysByHabit].map(([habitId, days]) => [habitId, days.sort((a, b) => a - b).join(",")]));
  }, [completions, visibleDays]);

  const stats = useMemo(() => {
    const values = habits.map((habit) => {
      const completed = new Set((completionKeys.get(habit.id) ?? "").split(",").filter(Boolean).map(Number));
      let current = 0;
      let streak = 0;
      for (let day = 1; day <= visibleDays; day += 1) {
        current = completed.has(day) ? current + 1 : 0;
        streak = Math.max(streak, current);
      }
      return { habit, achieved: completed.size, streak };
    });
    const total = values.reduce((sum, item) => sum + item.achieved, 0);
    const goals = habits.reduce((sum, habit) => sum + habit.goal, 0);
    const bestScore = values.length ? Math.max(...values.map((item) => item.achieved / item.habit.goal)) : 0;
    const bestStreak = values.length ? Math.max(...values.map((item) => item.streak)) : 0;
    return {
      total,
      rate: goals ? Math.round((total / goals) * 100) : 0,
      consistent: values.filter((item) => Math.abs(item.achieved / item.habit.goal - bestScore) < 0.000001),
      streak: bestStreak,
      streakWinners: values.filter((item) => item.streak === bestStreak && bestStreak > 0),
    };
  }, [completionKeys, habits, visibleDays]);

  const toggle = useCallback((habitId: string, day: number) => {
    if (readOnly) return;
    const completedOn = `${datePrefix}-${String(day).padStart(2, "0")}`;
    setActionError("");
    const applyToggle = (current: TrackerData) => {
      const exists = current.completions.some((item) => item.habitId === habitId && item.completedOn === completedOn);
      return {
        ...current,
        completions: exists
          ? current.completions.filter((item) => item.habitId !== habitId || item.completedOn !== completedOn)
          : [...current.completions, { habitId, completedOn }],
      };
    };
    void mutate(async (current) => {
      const optimistic = applyToggle(current ?? emptyData);
      try {
        const response = await fetch("/api/completions/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, completedOn }),
        });
        if (!response.ok) throw new Error();
        return optimistic;
      } catch {
        setActionError("Checklist gagal disimpan. Coba lagi.");
        throw new Error("Completion save failed");
      }
    }, {
      revalidate: false,
      optimisticData: (current) => applyToggle(current ?? emptyData),
      rollbackOnError: true,
    }).catch(() => undefined);
  }, [datePrefix, mutate, readOnly]);

  const openEditor = useCallback((habit: Habit) => setEditor(habit), []);

  async function saveHabit(input: HabitInput) {
    const editing = editor ?? null;
    const response = await fetch(editing ? `/api/habits/${editing.id}` : "/api/habits", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      setActionError(editing ? "Perubahan habit gagal disimpan." : "Habit gagal ditambahkan.");
      throw new Error("Habit save failed");
    }
    const saved = await response.json() as Habit;
    await mutate((current) => {
      const source = current ?? emptyData;
      return {
        ...source,
        habits: editing ? source.habits.map((habit) => habit.id === saved.id ? saved : habit) : [...source.habits, saved],
      };
    }, { revalidate: false });
    setEditor(undefined);
    setActionError("");
  }

  async function deleteHabit(habit: Habit) {
    const response = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    if (!response.ok) {
      setActionError("Habit gagal dihapus.");
      throw new Error("Habit delete failed");
    }
    await mutate((current) => {
      const source = current ?? emptyData;
      return {
        habits: source.habits.filter((item) => item.id !== habit.id),
        completions: source.completions.filter((item) => item.habitId !== habit.id),
      };
    }, { revalidate: false });
    setEditor(undefined);
    setActionError("");
  }

  function moveMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    startTransition(() => {
      setYear(next.getFullYear());
      setMonth(next.getMonth());
    });
  }

  return (
    <main className={`tracker-main${isPending ? " is-pending" : ""}`}>
      <section className="workspace-header glass-panel enter-up">
        <div className="period-heading">
          <span>{readOnly ? "Rekap sampai tanggal" : "Periode aktif"}</span>
          <h1>{monthNames[month]} {year}</h1>
          <p>{readOnly ? "Tinjau pencapaian pada periode pilihan." : "Jaga ritme kecil yang membentuk progres besar."}</p>
        </div>
        {readOnly ? (
          <div className="date-filters">
            <label>Tahun<input type="number" min="2021" max="2100" value={year} onChange={(event) => startTransition(() => setYear(Number(event.target.value)))} /></label>
            <label>Bulan<select value={month} onChange={(event) => startTransition(() => setMonth(Number(event.target.value)))}>{monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}</select></label>
            <label>Tanggal<select value={visibleDays} onChange={(event) => setCutoff(Number(event.target.value))}>{Array.from({ length: dayCount }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label>
          </div>
        ) : (
          <div className="month-navigation" aria-label="Pilih bulan">
            <button className="icon-control" type="button" onClick={() => moveMonth(-1)} aria-label="Bulan sebelumnya" title="Bulan sebelumnya"><ChevronLeft /></button>
            <span><CalendarDays size={17} />{monthNames[month].slice(0, 3)} {year}</span>
            <button className="icon-control" type="button" onClick={() => moveMonth(1)} aria-label="Bulan berikutnya" title="Bulan berikutnya"><ChevronRight /></button>
          </div>
        )}
      </section>

      <section className="metric-strip glass-panel enter-up" aria-label="Ringkasan periode">
        <div><span><Target size={17} />Completion</span><strong>{stats.rate}%</strong></div>
        <div><span><CheckCheck size={17} />Checklist</span><strong>{stats.total}</strong></div>
        <div><span><ListChecks size={17} />Habit aktif</span><strong>{habits.length}</strong></div>
        <div><span>Rentang</span><strong>{visibleDays} <small>hari</small></strong></div>
      </section>

      {(error || actionError) && <p className="error-banner" role="alert">{actionError || error?.message}</p>}

      <section className="tracker-workbench glass-panel enter-up">
        <header className="workbench-header">
          <div><span>Daily grid</span><h2>{readOnly ? "Rekap checklist" : "Checklist habit"}</h2></div>
          {!readOnly && <button className="primary-control" type="button" onClick={() => setEditor(null)}><Plus size={18} />New Habit</button>}
        </header>
        <HabitTable habits={habits} visibleDays={visibleDays} completionKeys={completionKeys} readOnly={readOnly} loading={isLoading} onToggle={toggle} onEdit={openEditor} />
      </section>

      <TrackerInsights consistent={stats.consistent} streak={stats.streak} streakWinners={stats.streakWinners} />

      {editor !== undefined && <HabitModal key={editor?.id ?? "new"} habit={editor} onClose={() => setEditor(undefined)} onSubmit={saveHabit} onDelete={deleteHabit} />}
    </main>
  );
}
