"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sun,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Building2,
  Lock,
  Calculator,
  Calendar,
  CheckCircle2,
  MapPin,
  Sliders,
  Scale,
  FileCheck,
  TrendingUp,
  Wrench,
  Check,
  Layers,
  Activity,
  ArrowUpRight,
  Info,
  DollarSign,
  Star,
  Eye,
  FileText,
  BadgeCheck,
} from "lucide-react";

export default function LandingPage() {
  const heroGridPatternId = useId();
  // Interactive Calculator State
  const [roofArea, setRoofArea] = useState<number>(8000);
  const [selectedDiscom, setSelectedDiscom] = useState<string>("adani");
  const [contactInput, setContactInput] = useState<string>("");
  const [consultationSubmitted, setConsultationSubmitted] = useState<boolean>(false);

  // Satellite Scanner Interactive State
  const [tuneObstructions, setTuneObstructions] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);
  const [vendorEmail, setVendorEmail] = useState<string>("");
  const [vendorSubmitted, setVendorSubmitted] = useState<boolean>(false);

  // Real-time calculations based on area
  const effectiveArea = Math.max(1000, roofArea || 1000);
  // Standard solar metric: ~115 sq.ft per kWp
  const calculatedKwp = Math.round(effectiveArea / 115);
  const panelCount = Math.round(calculatedKwp * 1.85);
  // Lease earnings: approx ₹2,600 to ₹3,900 / kWp / year
  const minAnnual = calculatedKwp * 2600;
  const maxAnnual = calculatedKwp * 3900;
  const minAnnualLakhs = (minAnnual / 100000).toFixed(2);
  const maxAnnualLakhs = (maxAnnual / 100000).toFixed(2);
  // 25-yr indexed corpus
  const twentyFiveYrLakhs = ((minAnnual * 25 * 1.3) / 100000).toFixed(1);
  const co2OffsetTons = Math.round(calculatedKwp * 1.35);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = contactInput.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      setConsultationSubmitted(true);
    }
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorEmail.trim()) {
      setVendorSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white relative">
      {/* Existing Shared Navbar Component */}
      <Navbar />

      <main className="w-full relative">
        {/* Ambient Top Lighting Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-32 left-1/3 w-[650px] h-[400px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute top-20 right-10 w-[450px] h-[400px] bg-secondary/10 rounded-full blur-[150px]" />
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16 pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Hero Value Proposition */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 shadow-sm border border-outline-variant/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-primary-fixed">
                  Verified PM Surya Ghar &amp; DISCOM Vendors Only
                </span>
              </div>

              {/* Authoritative Headline */}
              <div className="flex flex-col gap-2">
                <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] text-on-surface">
                  Monetize Your Idle Rooftop.{" "}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-fixed to-secondary">
                    Zero Upfront Investment.
                  </span>
                </h1>
              </div>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                India&apos;s premier blind-bidding solar marketplace for Housing Societies (RWAs). Get transparent, competitive Capex &amp; RESCO bids from top empanelled EPC developers with zero operational risk.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-primary-on bg-gradient-to-r from-primary to-primary-container hover:brightness-110 px-6 py-3.5 rounded-xl transition-all shadow-glow hover:shadow-[0_0_30px_rgba(78,222,163,0.45)] group"
                >
                  <span>Estimate Solar Potential</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-secondary hover:text-white px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all border border-outline-variant/30"
                >
                  <Award className="w-4 h-4 text-secondary" />
                  <span>Join as Empanelled Vendor</span>
                </Link>
              </div>

              {/* Social Proof / Traction Metric Bar */}
              <div className="w-full pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/30">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
                      450,000+ sq.ft
                    </span>
                    <span className="text-xs text-on-surface-variant">Rooftops catalogued in MMR</span>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:border-l border-outline-variant/30 sm:pl-4">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface">
                      38+ Societies
                    </span>
                    <span className="text-xs text-on-surface-variant">Mumbai, Navi Mumbai &amp; Thane</span>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:border-l border-outline-variant/30 sm:pl-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span className="font-mono text-xl sm:text-2xl font-bold text-secondary">
                        4.9 / 5
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">RWA Management Trust Index</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Satellite Roof Scanner Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full rounded-2xl bg-surface-container-low/90 backdrop-blur-2xl border border-outline-variant/40 p-4 sm:p-5 flex flex-col gap-4 shadow-glass overflow-hidden">
                {/* Scanning Status Header */}
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-primary-fixed">
                      Satellite Feed Active • 0.25m/px
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    LAT 19.2812° N
                  </span>
                </div>

                {/* Society Location Bar */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high/90 text-on-surface text-xs border border-outline-variant/30">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-medium">Green Meadows Co-op Housing, Mira Road (E)</span>
                  <span className="ml-auto text-primary text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 shrink-0">
                    LOCKED
                  </span>
                </div>

                {/* Simulated Satellite Image & HUD Overlays */}
                <div className="relative w-full h-80 sm:h-88 rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 group">
                  {/* Visual aerial simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container-lowest to-[#0d1c24] flex items-center justify-center">
                    {/* Architectural roof shapes */}
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-6 left-8 right-8 bottom-6 border border-primary/30 rounded-md" />
                      <div className="absolute top-12 left-16 right-16 bottom-14 border border-dashed border-primary/20" />
                      <div className="absolute top-20 left-24 w-28 h-20 bg-surface-container-highest/60 rounded border border-outline-variant/40" />
                      <div className="absolute bottom-16 right-20 w-32 h-24 bg-surface-container-highest/60 rounded border border-outline-variant/40" />
                    </div>
                  </div>

                  {/* High-Tech Technical Grid SVG Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={heroGridPatternId} width="28" height="28" patternUnits="userSpaceOnUse">
                        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#4edea3" strokeOpacity="0.18" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${heroGridPatternId})`} />

                    {/* Polygon Usable Solar Boundary */}
                    <polygon
                      points="35,45 285,38 310,230 65,245"
                      fill="rgba(78, 222, 163, 0.16)"
                      stroke="#4edea3"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                    />

                    {/* Highlighted Obstructions */}
                    <rect
                      x="75"
                      y="70"
                      width="50"
                      height="38"
                      fill={tuneObstructions ? "rgba(255, 180, 171, 0.45)" : "rgba(255, 180, 171, 0.25)"}
                      stroke="#ffb4ab"
                      strokeWidth={tuneObstructions ? "2" : "1.5"}
                    />
                    <text x="78" y="65" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">
                      TANK #1 (OVERHEAD)
                    </text>

                    <rect
                      x="180"
                      y="135"
                      width="58"
                      height="46"
                      fill={tuneObstructions ? "rgba(255, 180, 171, 0.45)" : "rgba(255, 180, 171, 0.25)"}
                      stroke="#ffb4ab"
                      strokeWidth={tuneObstructions ? "2" : "1.5"}
                    />
                    <text x="183" y="130" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">
                      LIFT SHAFT ROOM
                    </text>
                  </svg>

                  {/* Live HUD Telemetry Chips */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant/30 text-[11px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-on-surface">
                        Usable: <strong className="text-primary">{tuneObstructions ? "12,180 sq.ft (Fine-Tuned)" : "12,400 sq.ft"}</strong>
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant/30 text-[11px] font-mono">
                      <Sun className="w-3.5 h-3.5 text-secondary" />
                      <span className="text-on-surface">1,820 Peak Solar Hrs/Yr</span>
                    </div>
                  </div>

                  {/* Estimated ROI Banner HUD */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-secondary uppercase font-semibold tracking-wider">
                        Est. Annual Society Corpus
                      </span>
                      <span className="font-mono text-base sm:text-lg font-bold text-secondary-fixed leading-tight">
                        ₹2.4L – ₹4.1L
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Or 100% common electricity waiver
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase font-semibold">
                        Tier-1 Yield
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-semibold text-on-surface mt-1">
                        92 kWp Cap
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Interactive Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setTuneObstructions(!tuneObstructions)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                      tuneObstructions
                        ? "bg-secondary/20 border-secondary/40 text-secondary"
                        : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/30"
                    }`}
                    type="button"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{tuneObstructions ? "Obstructions Active" : "Tune Obstructions"}</span>
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-semibold transition-all border border-primary/30"
                    type="button"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Get Society Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRUST & DISCOM INTEGRATION TICKER / MARQUEE */}
        <section className="w-full bg-surface-container-lowest/80 border-y border-outline-variant/20 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">
                  Standard Interconnection &amp; Compliance Verified
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low/80 border border-outline-variant/20">
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-on-surface font-medium truncate">Adani Electricity</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low/80 border border-outline-variant/20">
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-on-surface font-medium truncate">Tata Power Net-Meter</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low/80 border border-outline-variant/20">
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-on-surface font-medium truncate">MSEDCL Grid-Tie</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low/80 border border-outline-variant/20">
                  <Sun className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-xs text-on-surface font-medium truncate">MNRE Empanelled</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 4-STEP PIPELINE PROTOCOL */}
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col gap-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-mono text-primary font-semibold tracking-wider">
                    // 4-STEP PROCUREMENT PROTOCOL
                  </span>
                  <span className="h-px w-12 bg-primary/40" />
                </div>
                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
                  From Satellite Scan to Monthly Lease Revenue
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant">
                  Guaranteed zero-conflict procurement with automated DISCOM grid feasibility and verified blind auctioning.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-outline">
                <span>END-TO-END AUDITED TIMELINE</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>

            {/* 4 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="group relative rounded-xl bg-surface-container/70 hover:bg-surface-container-high/90 p-6 flex flex-col justify-between gap-8 transition-all border border-outline-variant/30 hover:border-primary/40 hover:shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-primary">01</span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-on-surface group-hover:text-primary transition-colors">
                    Satellite Estimate
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Auto-detect roof usable area and solar irradiance via high-resolution satellite imagery in 45 seconds without physical trespassing.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant group-hover:text-primary transition-colors">
                  <span>Latency: &lt; 45 Seconds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative rounded-xl bg-surface-container/70 hover:bg-surface-container-high/90 p-6 flex flex-col justify-between gap-8 transition-all border border-outline-variant/30 hover:border-secondary/40 hover:shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-secondary">02</span>
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                      <Scale className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-on-surface group-hover:text-secondary transition-colors">
                    Blind Bidding
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Verified solar installers submit sealed competitive bids. Zero price-fixing or vendor collusion, ensuring maximum tariff discounts.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant group-hover:text-secondary transition-colors">
                  <span>Cryptographic Sealing</span>
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative rounded-xl bg-surface-container/70 hover:bg-surface-container-high/90 p-6 flex flex-col justify-between gap-8 transition-all border border-outline-variant/30 hover:border-primary/40 hover:shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-primary">03</span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-on-surface group-hover:text-primary transition-colors">
                    In-Person Audit
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Society committee reviews transparent bids, selects the winner, and schedules an authorized physical structural engineering audit.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant group-hover:text-primary transition-colors">
                  <span>DISCOM Form 1 Vetted</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="group relative rounded-xl bg-surface-container/70 hover:bg-surface-container-high/90 p-6 flex flex-col justify-between gap-8 transition-all border border-outline-variant/30 hover:border-secondary/40 hover:shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-secondary">04</span>
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-on-surface group-hover:text-secondary transition-colors">
                    Monitored Payouts
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Track live generation, monthly lease revenue transfers, and carbon offsets directly on an automated, tamper-proof RWA dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant group-hover:text-secondary transition-colors">
                  <span>Escrow Bank Payout</span>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DUAL PERSONA SECTION: FOR RWAS VS FOR EPC DEVELOPERS */}
        <section id="societies" className="w-full bg-surface-container-lowest py-20 lg:py-28 border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-14">
              <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
                <span className="text-xs font-mono text-secondary font-semibold uppercase tracking-wider">
                  // BALANCED TWO-SIDED MARKETPLACE
                </span>
                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
                  Engineered for Cooperative Societies &amp; Tier-1 EPC Developers
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant">
                  Removing mistrust, protracted negotiations, and regulatory opacity from rooftop solar adoption.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Column A: For Housing Societies & RWAs */}
                <div className="rounded-2xl bg-surface-container-low/95 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between gap-8 border border-outline-variant/30 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold uppercase">
                        <Building2 className="w-3.5 h-3.5" />
                        For Housing Societies &amp; RWAs
                      </span>
                      <span className="text-xs font-mono text-primary font-semibold">
                        ZERO CAPEX OPTION
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-on-surface">
                        Turn idle concrete roofs into recurring corpus funds.
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        Monetize your building with verified developers who assume entire capital and maintenance liabilities.
                      </p>
                    </div>

                    {/* Feature Checkpoints */}
                    <div className="flex flex-col gap-3.5 pt-2">
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Zero Capex &amp; Zero Maintenance Risk
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Vendor bears 100% equipment, insurance, and replacement costs under the 25-year RESCO model.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Institutional Legal Advisory &amp; Model PPA
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Pre-drafted bilingual legal agreements vetted by high court real estate attorneys protect society roof ownership.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Transparent AGM Presentation Kit
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Generate 1-click comparison sheets and DISCOM sanction checklists ready for member voting.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-container text-primary-on font-semibold hover:brightness-110 transition-all shadow-glow"
                    >
                      <span>Calculate Society Savings</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Column B: For Empanelled Solar Vendors & EPCs */}
                <div id="vendors" className="rounded-2xl bg-surface-container-low/95 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between gap-8 border border-outline-variant/30 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-mono font-semibold uppercase">
                        <Wrench className="w-3.5 h-3.5" />
                        For Empanelled Solar Vendors &amp; EPCs
                      </span>
                      <span className="text-xs font-mono text-secondary font-semibold">
                        HIGH-VELOCITY PIPELINE
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-on-surface">
                        Close multi-kW rooftop solar leases without cold acquisition.
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        Direct access to RWA-approved rooftops with pre-evaluated shadow maps and verified meter data.
                      </p>
                    </div>

                    {/* Feature Checkpoints */}
                    <div className="flex flex-col gap-3.5 pt-2">
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5 text-secondary">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Pre-Qualified High-Intent Sites
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Access listings backed by committee majority consent, eliminating dropped negotiations.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5 text-secondary">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Zero Customer Acquisition Waste
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Cut sales cycle times from 9 months down to 14 days using digital RFP tender packets.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/20">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 mt-0.5 text-secondary">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">
                            Standard DISCOM Interconnection Pipeline
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            Fast-tracked technical liaison protocols aligned with Maharashtra &amp; national grid codes.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2">
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary hover:bg-secondary-fixed text-black font-bold transition-all shadow-[0_0_20px_rgba(255,185,95,0.25)]"
                    >
                      <span className="text-black font-bold">Apply for Vendor Empanelment</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE LEAD QUALIFICATION & SOLAR CALCULATOR */}
        <section id="calculator" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="rounded-3xl bg-surface-container-low/95 backdrop-blur-2xl p-6 sm:p-10 lg:p-12 border border-outline-variant/40 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
              {/* Left Column: Explainer */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span className="text-xs font-mono text-primary-fixed uppercase tracking-wider font-semibold">
                    Instant Yield Estimator
                  </span>
                </div>

                <h2 className="font-heading font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
                  Estimate Your Society&apos;s 25-Year Solar Yield
                </h2>

                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Select your local utility electricity provider and approximate usable terrace space to calculate estimated lease payouts or electricity bill offsets.
                </p>

                <div className="pt-2 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>No site visit required for baseline quote</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Calculated using Tier-1 540Wp Mono-PERC modules</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Index-linked 25-year guaranteed payout structure</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Form & Real-time Results */}
              <div className="lg:col-span-7 bg-surface-container/90 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 border border-outline-variant/30 shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DISCOM Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase font-semibold">
                      DISCOM / Circle
                    </label>
                    <select
                      value={selectedDiscom}
                      onChange={(e) => setSelectedDiscom(e.target.value)}
                      className="w-full bg-surface-container-high text-on-surface text-sm rounded-lg px-4 py-3 border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="adani">Adani Electricity (Mumbai Suburban)</option>
                      <option value="tata">Tata Power (Mumbai City / Suburbs)</option>
                      <option value="msedcl_thane">MSEDCL (Thane / Navi Mumbai)</option>
                      <option value="msedcl_pune">MSEDCL (Pune Urban)</option>
                      <option value="bescom">BESCOM (Bengaluru Central)</option>
                    </select>
                  </div>

                  {/* Rooftop Area Input & Range Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-on-surface-variant uppercase font-semibold">
                        Usable Rooftop Area
                      </label>
                      <span className="text-[11px] font-mono text-primary font-semibold">
                        {roofArea.toLocaleString()} SQ. FT.
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1000"
                        max="100000"
                        step="500"
                        value={roofArea}
                        onChange={(e) => setRoofArea(Number(e.target.value))}
                        className="w-full bg-surface-container-high text-on-surface font-mono text-sm rounded-lg px-4 py-3 pr-20 border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                      />
                      <span className="absolute right-4 text-xs font-mono text-outline font-semibold">
                        SQ. FT.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Area Preset Buttons */}
                <div className="flex items-center gap-2 flex-wrap -mt-2">
                  <span className="text-[11px] font-mono text-on-surface-variant">Presets:</span>
                  {[3000, 5000, 8000, 15000, 25000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRoofArea(preset)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                        roofArea === preset
                          ? "bg-primary/20 border-primary text-primary font-semibold"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-outline-variant"
                      }`}
                    >
                      {preset.toLocaleString()} sq.ft
                    </button>
                  ))}
                </div>

                {/* Dynamic Output Display Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/20">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-on-surface-variant">Recommended Capacity</span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-on-surface">
                      {calculatedKwp} kWp
                    </span>
                    <span className="text-[11px] font-mono text-outline">
                      ~{panelCount} Tier-1 Panels
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-secondary font-semibold">Est. Annual Rent Payout</span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-secondary-fixed">
                      ₹{minAnnualLakhs}L – ₹{maxAnnualLakhs}L
                    </span>
                    <span className="text-[11px] font-mono text-secondary/80">
                      Guaranteed Lease
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-primary font-semibold">25-Yr Net Benefit</span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-primary-fixed">
                      ₹{twentyFiveYrLakhs} Lakhs
                    </span>
                    <span className="text-[11px] font-mono text-primary/80">
                      Indexed @ 3% p.a.
                    </span>
                  </div>
                </div>

                {/* Lead Qualification / Consultation Submission Form */}
                {consultationSubmitted ? (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Consultation Scheduled Successfully!</p>
                      <p className="text-xs text-on-surface-variant">
                        Our state technical advisor will share your society feasibility dossier within 24 hours.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConsultationSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center bg-surface-container-high rounded-lg border border-outline-variant/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 overflow-hidden w-full sm:flex-1">
                      <div className="px-3.5 py-3.5 bg-surface-container border-r border-outline-variant/40 text-on-surface-variant font-mono font-bold text-sm select-none shrink-0 flex items-center gap-1.5">
                        <span className="text-xs">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                        placeholder="Enter Chairman / Secretary Phone Number"
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full bg-transparent text-on-surface text-sm px-4 py-3.5 focus:outline-none placeholder:text-outline font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 font-semibold text-primary-on bg-gradient-to-r from-primary to-primary-container hover:brightness-110 px-6 py-3.5 rounded-lg transition-all shadow-glow"
                    >
                      <span>Schedule Free Consultation</span>
                      <Calendar className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 6. TRUST & CRYPTOGRAPHIC ENCLAVE STRIP */}
        <section className="w-full pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  All submitted bids are cryptographically hashed on our secure enclave until auction closing. No competitor or third party can peek at society tariff quotes.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-mono text-on-surface font-semibold uppercase tracking-wider">
                  256-Bit Auction Enclave Active
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. COMPREHENSIVE HIGH-END EDITORIAL FOOTER */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          {/* Top Verification Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">
                Empanelled vendor verification enforced. Blind bids remain strictly hidden from competitors.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                DISCOM Synchronized
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                Audited Bids
              </span>
            </div>
          </div>

          {/* Main Footer Links Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-2">
            {/* Brand Column */}
            <div className="lg:col-span-5 flex flex-col gap-4 pr-0 lg:pr-8 lg:border-r border-outline-variant/20">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow">
                  <Sun className="w-6 h-6 fill-primary-on" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-xl tracking-tight text-on-surface">
                    Sun<span className="text-primary">Lease</span>
                  </span>
                  <span className="text-[10px] font-mono text-primary uppercase font-semibold tracking-wider -mt-1">
                    Solar Clean Infrastructure
                  </span>
                </div>
              </Link>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-md">
                India&apos;s dedicated rooftop solar bidding &amp; yield underwriting marketplace connecting cooperative housing societies directly with tier-1 accredited EPC developers.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-primary text-[10px] font-mono uppercase font-semibold">
                  RESCO &amp; Capex Engine
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-secondary text-[10px] font-mono uppercase font-semibold">
                  DISCOM Integrated
                </span>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-heading font-semibold text-sm text-on-surface">Governance</span>
                <Link href="/vendor/verification" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  DISCOM Guidelines
                </Link>
                <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/dashboard/admin/directory" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Empanelled EPC Charter
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-heading font-semibold text-sm text-on-surface">Platforms</span>
                <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Rooftop Capacity Calculator
                </Link>
                <Link href="/dashboard/vendor" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Vendor Tender Marketplace
                </Link>
                <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  RWA Dashboard Demo
                </Link>
                <Link href="/dashboard/rwa" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Yield Escrow Structure
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-heading font-semibold text-sm text-on-surface">Contact &amp; Support</span>
                <p className="text-xs text-on-surface-variant">
                  State Desk: <span className="text-on-surface">support@sunlease.internal</span>
                </p>
                <p className="text-xs text-on-surface-variant">
                  Toll-Free Verification: <span className="text-on-surface">1800-419-SOLAR</span>
                </p>
                <p className="text-xs font-mono text-secondary font-semibold">
                  IN-DL-2025-EPC-09228
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Security */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-outline-variant/20 text-xs text-on-surface-variant">
            <p>© 2025 SunLease Clean Infrastructure Technologies Ltd. All rights reserved.</p>
            <p className="font-mono text-[10px] text-outline uppercase tracking-wider">
              SECURE SSL 256-BIT ENCRYPTED TENDER SYSTEM
            </p>
          </div>
        </div>
      </footer>

      {/* Society Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-lg text-on-surface">Preliminary Society Solar Dossier</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-on-surface-variant">
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex justify-between">
                <span>Site Address:</span>
                <strong className="text-on-surface">Green Meadows Co-op, Mira Road</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex justify-between">
                <span>Gross Usable Area:</span>
                <strong className="text-primary font-mono">{tuneObstructions ? "12,180 sq.ft (Obstructions Deducted)" : "12,400 sq.ft"}</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex justify-between">
                <span>Recommended System:</span>
                <strong className="text-on-surface font-mono">92 kWp Mono-PERC</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex justify-between">
                <span>Est. Annual Savings:</span>
                <strong className="text-secondary font-mono">₹2.40L – ₹4.10 Lakhs</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex justify-between">
                <span>Annual CO2 Offset:</span>
                <strong className="text-primary font-mono">{co2OffsetTons} Metric Tons/Yr</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
              >
                Close
              </button>
              <Link
                href="/login"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-fixed text-primary-on transition-colors flex items-center gap-1.5"
              >
                <span>Customize in Calculator / Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Empanelment Modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-bold text-lg text-on-surface">Apply for EPC Empanelment</h3>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {vendorSubmitted ? (
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-secondary">Application Received!</p>
                  <p className="text-xs text-on-surface-variant">
                    Our vendor onboarding team will verify your MNRE credentials and dispatch the tender invitation packet.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVendorSubmit} className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Join India&apos;s verified network of solar EPC developers and bid on pre-qualified housing society rooftops with active RWA resolutions.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-on-surface-variant uppercase font-semibold">
                    Company Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@solarcompany.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full bg-surface-container text-on-surface text-sm rounded-lg px-4 py-3 border border-outline-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/40"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  <span>Requires valid MNRE or State DISCOM Empanelment License</span>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setVendorModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary-fixed text-on-secondary transition-all shadow-[0_0_15px_rgba(255,185,95,0.3)]"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
