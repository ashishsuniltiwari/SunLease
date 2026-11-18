"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ShieldAlert, ArrowRight, LayoutDashboard, Home, Lock } from "lucide-react";

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const attemptedPath = searchParams.get("from") || "";
  const [role, setRole] = useState<string>("GUEST");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.user?.role) {
          setRole(data.user.role.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  const properDashboard =
    role === "VENDOR"
      ? "/dashboard/vendor"
      : role === "ADMIN"
      ? "/dashboard/admin/verification"
      : role === "RWA"
      ? "/dashboard/rwa"
      : "/login";

  return (
    <div className="glass-panel-l1 rounded-2xl p-8 sm:p-12 border border-error/40 max-w-lg w-full text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-error/15 text-error flex items-center justify-center mx-auto border border-error/30">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 border border-error/30 text-error text-[11px] font-mono font-bold uppercase">
          <Lock className="w-3.5 h-3.5" />
          <span>S-06 · 403 Forbidden Access</span>
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-on-surface">
          Access Restricted by Role
        </h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          You are currently signed in as a <strong className="text-primary font-mono">{role}</strong> account. You do not have cryptographic permissions to access this portal section.
        </p>
      </div>

      {attemptedPath && (
        <div className="p-3 rounded-lg bg-surface-container font-mono text-[11px] text-outline truncate text-left border border-outline-variant/30">
          Attempted Route: <span className="text-on-surface">{attemptedPath}</span>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={properDashboard}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-glow"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Return to {role} Dashboard</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 w-full flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="font-mono text-xs text-on-surface-variant">Verifying role boundary...</div>}>
          <ForbiddenContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
