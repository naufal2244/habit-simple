import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { CalendarCheck } from "lucide-react";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  const enabled = isClerkConfigured();

  return (
    <main className="auth-page">
      {enabled ? (
        <div className="clerk-slot">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        </div>
      ) : (
        <section className="auth-panel">
          <Link className="brand" href="/">
            <CalendarCheck aria-hidden="true" size={21} />
            HabitTracker
          </Link>
          <h1>Login sedang disiapkan</h1>
          <p>
            Hubungkan Clerk ke Vercel Project baru dan pull environment variables. Setelah itu, login Google akan aktif di halaman ini.
          </p>
          <Link className="primary-action" href="/">
            Kembali ke landing page
          </Link>
        </section>
      )}
    </main>
  );
}
