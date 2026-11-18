"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Sun,
  ShieldCheck,
  Lock,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  FileCheck2,
  CheckCircle2,
  Scale,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Rooftop Digital Twin & Yield Estimate",
      desc: "Using the Google Maps Solar API, we scan your society's rooftop boundaries to detect usable area, shade profile, and solar irradiance. The system auto-calculates peak kWp potential and estimated annual lease earnings without requiring an initial site visit.",
      badge: "Google Solar API Integrated",
      color: "text-primary",
      borderColor: "border-primary/40",
      bgBadge: "bg-primary/10 text-primary border-primary/30",
    },
    {
      num: "02",
      title: "SGX-Encrypted Blind Bidding",
      desc: "Your listing opens exclusively to verified, Tier-1 MNRE empanelled EPC contractors. Vendors submit sealed commercial bids (RESCO lease tariffs or CAPEX rates). Anti-collusion algorithms prevent competitors from viewing each other's bids until the enclave reveals the best terms.",
      badge: "Anti-Collusion Hardware Enclave",
      color: "text-secondary",
      borderColor: "border-secondary/40",
      bgBadge: "bg-secondary/10 text-secondary border-secondary/30",
    },
    {
      num: "03",
      title: "Onsite Structural & DISCOM Audit",
      desc: "When the RWA committee selects the winning bid, the listing transitions to an Audit phase. The EPC developer visits the society to conduct structural load-bearing tests and net-metering feasibility. If passed, the society proceeds directly to the 25-year lease agreement.",
      badge: "Phase 3 Physical Feasibility",
      color: "text-tertiary",
      borderColor: "border-tertiary/40",
      bgBadge: "bg-tertiary/10 text-tertiary border-tertiary/30",
    },
    {
      num: "04",
      title: "Zero-Capex RESCO & Live IoT Telemetry",
      desc: "The installer pays for 100% of equipment, installation, and 25-year O&M. The housing society earns monthly lease payouts in an escrow account, while common-area meters enjoy clean solar electricity. Plant generation is monitored 24/7 via edge IoT telemetry.",
      badge: "Edge Inverter Telemetry",
      color: "text-primary",
      borderColor: "border-primary/40",
      bgBadge: "bg-primary/10 text-primary border-primary/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>P-02 · THE SUNLEASE PROTOCOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-on-surface">
            How Rooftop Solar Leases Work
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            From satellite rooftop scanning to competitive blind contractor bidding and 25-year guaranteed income — step-by-step transparency for housing societies and EPC developers.
          </p>
        </div>

        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`glass-panel-l1 rounded-2xl p-6 sm:p-8 border ${s.borderColor} shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden group hover:border-primary/60 transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-mono font-extrabold ${s.color}`}>
                    {s.num}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${s.bgBadge}`}>
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-on-surface">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                <span>Phase {idx + 1} of 4</span>
                <span className="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Protocol Spec &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-on-surface">
              Self-Funded CAPEX vs. The SunLease RESCO Model
            </h2>
            <p className="text-xs text-on-surface-variant">
              Why 92% of Mumbai &amp; Pune housing societies choose our zero-risk model.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono">
                  <th className="py-3 px-4">Evaluation Criteria</th>
                  <th className="py-3 px-4 text-error">Traditional CAPEX Purchase</th>
                  <th className="py-3 px-4 text-primary bg-primary/5 rounded-t-lg">SunLease RESCO Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">Upfront Capital Expenditure</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">₹50L - ₹85L locked from Society Sinking Fund</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">₹0 Upfront Investment</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">Inverter &amp; Battery Replacement</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">Society bears ₹12L - ₹18L cost at year 10-12</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">100% Installer Responsibility</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">Monthly Lease Income</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">None (Only net-metering credits)</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">₹25,000 - ₹55,000 / month guaranteed</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">Contractor Selection</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">Opaque manual offline quotes, cartel pricing</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">Cryptographic Blind Bidding with verified Tier-1 EPCs</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">Performance Monitoring</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">Manual meter inspection, unmonitored drop-offs</td>
                  <td className="py-3.5 px-4 font-bold text-primary bg-primary/5">Real-time IoT Inverter Telemetry with anomaly alerts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-primary-container/20 via-primary/10 to-secondary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-heading font-bold text-on-surface">Ready to monetize your society&apos;s rooftop?</h3>
            <p className="text-xs text-on-surface-variant">
              Takes less than 2 minutes to calculate rooftop potential and receive verified EPC bids.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rwa/listings/new"
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
            >
              <span>List Your Rooftop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/for-societies"
              className="px-4 py-2.5 rounded-lg bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest transition-colors"
            >
              Read Society Guide
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
