"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Clock, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

function SessionExpiredContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/login";

  return (
    <div className="glass-panel-l1 rounded-2xl p-8 sm:p-12 border border-secondary/40 max-w-md w-full text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto border border-secondary/30">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-[11px] font-mono font-bold uppercase">
          <KeyRound className="w-3.5 h-3.5" />
          <span>S-04 · Session Interstitial</span>
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-on-surface">
          Session Expired
        </h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Your cryptographic session token has expired to protect your society or contractor credentials. Please sign in again to continue your work.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
          className="w-full py-3 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-glow"
        >
          <span>Sign In to Resume Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function SessionExpiredPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 w-full flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="font-mono text-xs text-on-surface-variant">Checking session state...</div>}>
          <SessionExpiredContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
