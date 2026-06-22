"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

type Habit = { id: string; name: string; goal: number; color: string };
type Completion = { habitId: string; completedOn: string };

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const colors = ["#97E3B8", "#F9B4C4", "#9BD3F5", "#FFE58A", "#BDA7F2", "#FFB482", "#7DE1D6", "#C6E887"];

async function fetchHabitData(year: number, month: number) {
  const response = await fetch(`/api/habits?year=${year}&month=${month}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Data habit gagal dimuat");
  return response.json() as Promise<{ habits: Habit[]; completions: Completion[] }>;
}

export function HabitTracker({ readOnly = false }: { readOnly?: boolean }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [cutoff, setCutoff] = useState(now.getDate());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", goal: 20, color: colors[0] });
  const dayCount = new Date(year, month + 1, 0).getDate();
  const visibleDays = readOnly ? Math.min(cutoff, dayCount) : dayCount;

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHabitData(year, month);
      setHabits(data.habits);
      setCompletions(data.completions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchHabitData(year, month)
      .then((data) => {
        if (!active) return;
        setHabits(data.habits);
        setCompletions(data.completions);
        setError("");
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Terjadi kesalahan");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [month, year]);

  const completionSet = useMemo(
    () => new Set(completions.map((item) => `${item.habitId}:${item.completedOn}`)),
    [completions],
  );

  function dateForDay(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function achieved(habitId: string) {
    let total = 0;
    for (let day = 1; day <= visibleDays; day += 1) {
      if (completionSet.has(`${habitId}:${dateForDay(day)}`)) total += 1;
    }
    return total;
  }

  function longestStreak(habitId: string) {
    let current = 0;
    let longest = 0;
    for (let day = 1; day <= visibleDays; day += 1) {
      current = completionSet.has(`${habitId}:${dateForDay(day)}`) ? current + 1 : 0;
      longest = Math.max(longest, current);
    }
    return longest;
  }

  const stats = (() => {
    const values = habits.map((habit) => ({ habit, achieved: achieved(habit.id), streak: longestStreak(habit.id) }));
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
  })();

  async function toggle(habitId: string, day: number) {
    if (readOnly) return;
    const completedOn = dateForDay(day);
    const key = `${habitId}:${completedOn}`;
    const wasCompleted = completionSet.has(key);
    setCompletions((current) => wasCompleted
      ? current.filter((item) => `${item.habitId}:${item.completedOn}` !== key)
      : [...current, { habitId, completedOn }]);
    const response = await fetch("/api/completions/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, completedOn }),
    });
    if (!response.ok) void loadData();
  }

  async function addHabit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) return setError("Habit gagal ditambahkan");
    setModalOpen(false);
    setForm({ name: "", goal: 20, color: colors[0] });
    await loadData();
  }

  async function changeGoal(habitId: string, goal: number) {
    setHabits((current) => current.map((habit) => habit.id === habitId ? { ...habit, goal } : habit));
    await fetch(`/api/habits/${habitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal }),
    });
  }

  function moveMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <main className="tracker-main">
      <section className="tracker-toolbar">
        <div>
          <p>{readOnly ? "Rekap sampai tanggal" : "Periode aktif"}</p>
          <h1>{monthNames[month]} {year}</h1>
        </div>
        {readOnly ? (
          <div className="date-filters">
            <label>Tahun<input type="number" min="2021" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label>
            <label>Bulan<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}</select></label>
            <label>Tanggal<select value={visibleDays} onChange={(event) => setCutoff(Number(event.target.value))}>{Array.from({ length: dayCount }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label>
          </div>
        ) : (
          <div className="month-navigation">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="Bulan sebelumnya"><ChevronLeft /></button>
            <button type="button" onClick={() => moveMonth(1)} aria-label="Bulan berikutnya"><ChevronRight /></button>
          </div>
        )}
      </section>

      {error && <p className="error-banner">{error}</p>}
      <section className="tracker-card">
        <div className="tracker-scroll">
          <table className="tracker-table">
            <thead><tr><th className="sticky-name">Habit Name</th>{Array.from({ length: visibleDays }, (_, index) => <th key={index + 1}>{index + 1}</th>)}<th className="sticky-goal">Goal</th><th className="sticky-achieved">Achieved</th></tr></thead>
            <tbody>
              {habits.map((habit) => {
                const done = achieved(habit.id);
                return <tr key={habit.id} style={{ "--habit-color": habit.color } as React.CSSProperties}>
                  <td className="sticky-name">{habit.name}</td>
                  {Array.from({ length: visibleDays }, (_, index) => {
                    const day = index + 1;
                    const checked = completionSet.has(`${habit.id}:${dateForDay(day)}`);
                    return <td className={`day-cell${checked ? " checked" : ""}`} key={day}>
                      <button type="button" disabled={readOnly} onClick={() => void toggle(habit.id, day)} aria-label={`${habit.name}, tanggal ${day}`}><span>✓</span></button>
                    </td>;
                  })}
                  <td className="sticky-goal">{readOnly ? habit.goal : <input aria-label={`Goal ${habit.name}`} type="number" min="1" max="31" value={habit.goal} onChange={(event) => void changeGoal(habit.id, Number(event.target.value))} />}</td>
                  <td className={`sticky-achieved ${done >= habit.goal ? "complete" : done >= Math.ceil(habit.goal * .55) ? "partial" : "low"}`}>{done}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {!loading && !habits.length && <div className="empty-state">Belum ada habit untuk akun ini.</div>}
        </div>
        {!readOnly && <div className="tracker-footer"><button type="button" onClick={() => setModalOpen(true)}><Plus size={19} />New Habit</button></div>}
      </section>

      <section className="tracker-stats">
        <article><p>Monthly Completion</p><strong>{stats.rate}%</strong></article>
        <article><p>Most Consistent</p><ul>{stats.consistent.length ? stats.consistent.map((item) => <li key={item.habit.id}>{item.habit.name} — {item.achieved}/{item.habit.goal}</li>) : <li>-</li>}</ul></article>
        <article><p>Longest Streak</p><strong>{stats.streak} <small>Days</small></strong><ul>{stats.streakWinners.map((item) => <li key={item.habit.id}>{item.habit.name}</li>)}</ul></article>
        <article><p>Total Checklist</p><strong>{stats.total}</strong></article>
      </section>

      {modalOpen && <div className="tracker-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
        <form className="tracker-modal" onSubmit={addHabit}>
          <div className="modal-title"><div><p>Tambah Data</p><h2>Habit Baru</h2></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Tutup"><X /></button></div>
          <label>Nama habit<input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Morning Walk" /></label>
          <label>Goal bulanan<input required type="number" min="1" max="31" value={form.goal} onChange={(event) => setForm({ ...form, goal: Number(event.target.value) })} /></label>
          <fieldset><legend>Warna baris</legend><div className="color-options">{colors.map((color) => <button className={form.color === color ? "selected" : ""} key={color} type="button" style={{ background: color }} onClick={() => setForm({ ...form, color })} aria-label={`Pilih warna ${color}`} />)}</div></fieldset>
          <div className="modal-actions"><button type="button" onClick={() => setModalOpen(false)}>Batal</button><button className="save" type="submit">Simpan Habit</button></div>
        </form>
      </div>}
    </main>
  );
}
