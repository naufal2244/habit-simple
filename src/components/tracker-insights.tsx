import { Award, Flame } from "lucide-react";
import type { Habit } from "@/lib/habit-types";

type ConsistentItem = { habit: Habit; achieved: number };
type StreakItem = { habit: Habit };

type TrackerInsightsProps = {
  consistent: ConsistentItem[];
  streak: number;
  streakWinners: StreakItem[];
};

export function TrackerInsights({ consistent, streak, streakWinners }: TrackerInsightsProps) {
  return (
    <section className="insight-grid" aria-label="Insight habit">
      <article className="insight-panel glass-panel">
        <div className="insight-icon"><Award size={20} /></div>
        <div>
          <p>Most Consistent</p>
          <ul>
            {consistent.length ? consistent.map((item) => (
              <li key={item.habit.id}><strong>{item.habit.name}</strong><span>{item.achieved}/{item.habit.goal} hari</span></li>
            )) : <li><span>Belum ada data</span></li>}
          </ul>
        </div>
      </article>
      <article className="insight-panel glass-panel">
        <div className="insight-icon warm"><Flame size={20} /></div>
        <div>
          <p>Longest Streak</p>
          <strong className="streak-value">{streak} <small>hari</small></strong>
          <ul>
            {streakWinners.length ? streakWinners.map((item) => <li key={item.habit.id}><strong>{item.habit.name}</strong></li>) : <li><span>Belum ada streak</span></li>}
          </ul>
        </div>
      </article>
    </section>
  );
}
