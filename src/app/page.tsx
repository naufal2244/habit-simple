import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ShieldCheck } from "lucide-react";
import { AuthActions } from "@/components/auth-actions";
import { isClerkConfigured } from "@/lib/env";

export default function Home() {
  const authEnabled = isClerkConfigured();

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="HabitTracker home">
          <CalendarCheck aria-hidden="true" size={21} strokeWidth={2.2} />
          <span>HabitTracker</span>
        </Link>
        <AuthActions enabled={authEnabled} compact />
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <Image
          className="hero-image"
          src="/habit-tracker-preview.png"
          alt="Tampilan tabel HabitTracker dengan checklist harian"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-label">Rutinitas yang konsisten</p>
          <h1 id="hero-title">HabitTracker</h1>
          <p className="hero-copy">
            Catat kebiasaan harian dan lihat progresmu tetap jelas dari bulan ke bulan.
          </p>
          <div className="hero-actions">
            <AuthActions enabled={authEnabled} />
            <Link className="secondary-link" href="/dashboard">
              Lihat dashboard
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="Keunggulan utama">
        <div>
          <CalendarCheck aria-hidden="true" size={22} />
          <span>Tracker harian dan rekap tanggal</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={22} />
          <span>Data terpisah untuk setiap akun</span>
        </div>
        <p>Mulai dari satu habit. Pertahankan yang benar-benar penting.</p>
      </section>
    </main>
  );
}
