"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setMessage(data.message || "Password reset link generated.");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-16 flex flex-col justify-center">
        <div className="glass-panel-l1 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Account Recovery
            </h1>
            <p className="text-xs text-on-surface-variant">
              Enter the verified email linked to your RWA, Vendor, or Admin account to receive an instant recovery link.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message ? (
            <div className="p-5 rounded-xl bg-primary/10 border border-primary/30 space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
              <p className="text-xs text-on-surface font-medium">{message}</p>
              {resetUrl && (
                <div className="pt-2">
                  <Link
                    href={resetUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 shadow-glow"
                  >
                    <span>Proceed to Reset Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="email"
                    required
                    placeholder="admin@palmmeadows.rwa.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {loading ? "Generating Link..." : "Send Password Reset Link"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-outline-variant/20">
            <Link
              href="/login"
              className="text-xs text-primary hover:underline font-semibold"
            >
              &larr; Return to Sign In
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
