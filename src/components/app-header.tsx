import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { AuthActions } from "./auth-actions";

export function AppHeader({ active }: { active: "tracker" | "recap" }) {
  return (
    <header className="dashboard-header app-nav-header glass-nav">
      <Link className="brand" href="/dashboard">
        <CalendarCheck aria-hidden="true" size={21} />
        HabitTracker
      </Link>
      <nav className="app-nav" aria-label="Navigasi aplikasi">
        <Link className={active === "tracker" ? "is-active" : ""} href="/dashboard">
          Tracker
        </Link>
        <Link className={active === "recap" ? "is-active" : ""} href="/recap">
          Rekap
        </Link>
      </nav>
      <AuthActions enabled compact />
    </header>
  );
}
