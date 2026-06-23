"use client";

import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, LogIn } from "lucide-react";

export function AuthActions({ enabled, compact = false }: { enabled: boolean; compact?: boolean }) {
  if (!enabled) {
    return (
      <div className={`auth-actions${compact ? " compact" : ""}`}>
        <Link className="setup-action" href="/sign-in">
          <LogIn aria-hidden="true" size={18} />
          Masuk
        </Link>
      </div>
    );
  }

  return <ConfiguredAuthActions compact={compact} />;
}

function ConfiguredAuthActions({ compact }: { compact: boolean }) {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return <div className={`auth-actions${compact ? " compact" : ""}`} aria-hidden="true" />;

  return (
    <div className={`auth-actions${compact ? " compact" : ""}`}>
      {userId ? (
        <>
          {!compact && (
            <Link className="primary-action" href="/dashboard">
              Dashboard
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          )}
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button className="primary-action" type="button">
            <LogIn aria-hidden="true" size={18} />
            Masuk dengan Google
          </button>
        </SignInButton>
      )}
    </div>
  );
}
