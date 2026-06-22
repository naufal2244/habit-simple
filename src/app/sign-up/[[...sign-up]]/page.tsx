import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { CalendarCheck } from "lucide-react";
import { isClerkConfigured } from "@/lib/env";

export default function SignUpPage() {
  const enabled = isClerkConfigured();

  return (
    <main className="auth-page">
      {enabled ? (
        <div className="clerk-slot">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
        </div>
      ) : (
        <section className="auth-panel">
          <Link className="brand" href="/">
            <CalendarCheck aria-hidden="true" size={21} />
            HabitTracker
          </Link>
          <h1>Pendaftaran sedang disiapkan</h1>
          <p>Provision Clerk pada Vercel Project baru untuk mengaktifkan pendaftaran dan Google OAuth.</p>
          <Link className="primary-action" href="/">
            Kembali ke landing page
          </Link>
        </section>
      )}
    </main>
  );
}
