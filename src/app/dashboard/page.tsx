import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CalendarCheck, Database, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthActions } from "@/components/auth-actions";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/env";

export default async function DashboardPage() {
  const authEnabled = isClerkConfigured();
  if (authEnabled) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand" href="/">
          <CalendarCheck aria-hidden="true" size={21} />
          HabitTracker
        </Link>
        <AuthActions enabled={authEnabled} compact />
      </header>
      <main className="dashboard-main">
        <p className="hero-label">Protected workspace</p>
        <h1>Dashboard akunmu</h1>
        <p>
          Fondasi auth dan database sudah disiapkan. Tracker yang sekarang masih statis dapat dipindahkan ke route ini setelah Clerk dan Neon terhubung.
        </p>
        <section className="dashboard-preview" aria-label="Status integrasi">
          <article>
            <ShieldCheck aria-hidden="true" size={22} />
            <span>Authentication</span>
            <strong>{authEnabled ? "Aktif" : "Setup"}</strong>
          </article>
          <article>
            <Database aria-hidden="true" size={22} />
            <span>Database</span>
            <strong>{isDatabaseConfigured() ? "Aktif" : "Setup"}</strong>
          </article>
          <article>
            <CalendarCheck aria-hidden="true" size={22} />
            <span>Tracker</span>
            <strong>Siap migrasi</strong>
          </article>
        </section>
      </main>
    </div>
  );
}
