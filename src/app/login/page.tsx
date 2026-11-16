"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  Building2,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@palmmeadows.rwa.org");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"rwa" | "vendor" | "admin">("rwa");

  // Determine destination based on selected role pill
  const targetRoute =
    selectedRole === "vendor"
      ? "/dashboard/vendor"
      : selectedRole === "admin"
      ? "/dashboard/admin/verification"
      : "/dashboard/rwa";

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow group-hover:scale-105 transition-transform">
            <Sun className="w-4 h-4 fill-primary-on" />
          </div>
          <span className="font-heading font-extrabold text-lg text-on-surface tracking-tight">
            Sun<span className="text-primary">Lease</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
        </Link>
      </header>

      {/* Main Split Screen Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-outline-variant/30 glass-panel-l1 overflow-hidden shadow-2xl">
          {/* ======================================================== */}
          {/* LEFT COLUMN: BRANDED WELCOME & VALUE PROPOSITION         */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-b from-surface-container-low/90 to-surface-container-lowest/80 border-b lg:border-b-0 lg:border-r border-outline-variant/30 relative">
            <div>
              {/* Protocol Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-mono mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Intel SGX Hardware Enclave Secured</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-on-surface tracking-tight leading-snug">
                Powering Clean Energy Leases for Urban Societies.
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
                Connect housing societies with MNRE-empanelled EPC contractors through anti-collusion blind auctions and transparent IoT generation telemetry.
              </p>

              {/* Key Value Pillars */}
              <div className="mt-8 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Zero CAPEX RWA Solar Yields</h4>
                    <p className="text-on-surface-variant text-[11px]">
                      Societies monetize unused rooftop real estate with 25-year inflation-indexed lease agreements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Cryptographic Blind Bidding</h4>
                    <p className="text-on-surface-variant text-[11px]">
                      Bids are sealed inside hardware enclaves to eliminate collusion and protect contractor tariff models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">DISCOM & MEDA Verification</h4>
                    <p className="text-on-surface-variant text-[11px]">
                      Full state regulatory clearing with MSEDCL, Adani Electricity, and Tata Power grid sync.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial / Live Metric Snippet */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary uppercase font-semibold">
                  Live Pilot Metric
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant italic">
                “Palm Meadows CHS unlocked ₹4.8 Lakhs in guaranteed annual green energy revenue within 14 days of listing.”
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant/70 mt-3">
                <span>42 Empanelled EPCs</span>
                <span>•</span>
                <span>96.4% Geo-Audited</span>
                <span>•</span>
                <span>MMR Circle</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: SPLIT-SCREEN AUTHENTICATION FORM            */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-surface-container-lowest/60">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                  Authentication Terminal
                </span>
                <h2 className="text-2xl font-heading font-bold text-on-surface mt-1">
                  Sign in to SunLease
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Access your society telemetry, bidding desk, or admin clearance queue.
                </p>
              </div>

              {/* Quick Demo Role Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-on-surface-variant">
                  Select Prototype Role Preview:
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("rwa");
                      setEmail("admin@palmmeadows.rwa.org");
                    }}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all ${
                      selectedRole === "rwa"
                        ? "bg-primary text-primary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    RWA Society
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("vendor");
                      setEmail("bids@sunpower.epc.in");
                    }}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all ${
                      selectedRole === "vendor"
                        ? "bg-secondary text-secondary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Solar Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("admin");
                      setEmail("governance@sunlease.internal");
                    }}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all ${
                      selectedRole === "admin"
                        ? "bg-tertiary text-tertiary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Platform Admin
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                    Authorized Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-on-surface-variant">
                      Password / Security Key
                    </label>
                    <Link
                      href="/login"
                      className="text-[11px] text-primary hover:underline"
                    >
                      Forgot key?
                    </Link>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Session */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-outline-variant/40 bg-surface-container-low text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span>Trust this workstation</span>
                  </label>
                  <span className="font-mono text-[10px] text-primary flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SSL 256-Bit
                  </span>
                </div>

                {/* Primary Sign In Button (Hardcoded Link to Dashboard) */}
                <div className="pt-2">
                  <Link
                    href={targetRoute}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on font-heading font-bold text-sm hover:brightness-110 shadow-glow flex items-center justify-center gap-2 transition-all group"
                  >
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </form>

              {/* Registration Link Footer */}
              <div className="pt-4 border-t border-outline-variant/20 text-center">
                <p className="text-xs text-on-surface-variant">
                  Don&apos;t have an account yet?{" "}
                  <Link
                    href="/rwa/listings/new"
                    className="text-primary hover:underline font-semibold"
                  >
                    Register your Housing Society or EPC Firm
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="p-4 text-center text-[11px] font-mono text-on-surface-variant/60 relative z-10">
        SunLease State Solar Platform • Empanelled with MNRE &amp; Central DISCOM Regulators • Mumbai Metropolitan Region
      </footer>
    </div>
  );
}
