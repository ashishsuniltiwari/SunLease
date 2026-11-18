"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Missing or invalid password reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel-l1 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-heading font-bold text-on-surface">
          Create New Password
        </h1>
        <p className="text-xs text-on-surface-variant">
          Enter and confirm your new secure password to restore portal access.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/30 space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-heading font-bold text-sm text-on-surface">Password Successfully Updated!</h3>
          <p className="text-xs text-on-surface-variant">
            Your new password has been securely encrypted with bcryptjs.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 shadow-glow"
            >
              <span>Sign In to Your Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
            />
          </div>

          {!token && (
            <div className="p-2.5 rounded bg-warning/10 border border-warning/30 text-warning text-[11px] font-mono">
              Notice: No reset token detected in URL query. Ensure you opened the link from the recovery email or generated link.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Set New Password"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-outline-variant/20">
        <Link
          href="/login"
          className="text-xs text-primary hover:underline font-semibold"
        >
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-16 flex flex-col justify-center">
        <Suspense fallback={<div className="text-center text-xs text-on-surface-variant font-mono">Loading security token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  );
}
