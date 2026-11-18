"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Sun,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  Leaf,
  Globe2,
  Lock,
  ArrowRight,
  Cpu,
  Layers,
  Award,
} from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: Cpu,
      title: "Google Maps Solar Intelligence",
      desc: "Instantaneous rooftop boundary extraction, geometric azimuth alignment, and high-precision PV yield projection powered by buildingInsights telemetry.",
    },
    {
      icon: Lock,
      title: "Confidential Computing & Blind Enclaves",
      desc: "Intel SGX hardware-enforced blind auctions ensure that commercial tariffs remain mathematically sealed from competing developers to guarantee zero cartelization.",
    },
    {
      icon: Zap,
      title: "Real-Time Edge IoT Telemetry",
      desc: "Direct RS-485 / Modbus inverter integrations with sub-minute telemetry, automated inverter fault detection, and tamper-evident generation logs.",
    },
    {
      icon: Leaf,
      title: "Institutional Climate Impact",
      desc: "Accelerating metropolitan India's Net-Zero 2070 decarbonization goals by transforming residential society rooftops into decentralized clean power stations.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>P-05 · ABOUT SUNLEASE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-on-surface">
            Decentralizing Rooftop Solar Across India&apos;s Skylines
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            SunLease is India&apos;s dedicated clean infrastructure marketplace bridging cooperative housing societies, tier-1 EPC developers, and state DISCOM distribution grids.
          </p>
        </div>

        {/* Mission Card */}
        <div className="glass-panel-l1 rounded-2xl p-8 sm:p-12 border border-outline-variant/30 space-y-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="font-mono text-xs uppercase text-primary font-bold tracking-wider">
              Our Founding Thesis
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-on-surface">
              Millions of square feet of idle concrete rooftops, locked behind opaque contracting.
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              India boasts over 1.2 billion square feet of urban residential rooftops under cooperative housing societies (RWAs). However, high upfront CAPEX (₹60L+), complex DISCOM net-metering regulations, and fear of vendor fly-by-night operations prevent over 90% of societies from adopting solar.
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              SunLease replaces opaque offline negotiations with transparent satellite analytics, cryptographic blind auctions, and guaranteed 25-year zero-capex RESCO contracts.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">
              Our Core Technology Pillars
            </h2>
            <p className="text-xs text-on-surface-variant">
              Engineered with modern web architecture and deep energy domain expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex items-start gap-4 hover:border-primary/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base text-on-surface">
                      {p.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-primary">₹0</span>
            <span className="text-[11px] font-mono text-on-surface-variant block uppercase">Capital Spent by RWAs</span>
          </div>
          <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-secondary">25 Yrs</span>
            <span className="text-[11px] font-mono text-on-surface-variant block uppercase">Guaranteed Lease O&amp;M</span>
          </div>
          <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-tertiary">100%</span>
            <span className="text-[11px] font-mono text-on-surface-variant block uppercase">DISCOM Net-Meter Aligned</span>
          </div>
          <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-primary">100%</span>
            <span className="text-[11px] font-mono text-on-surface-variant block uppercase">Blind Cryptographic Bids</span>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="rounded-2xl p-8 bg-surface-container-high border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-heading font-bold text-on-surface">Join the Rooftop Clean Energy Revolution</h3>
            <p className="text-xs text-on-surface-variant">
              Contact our engineering team or begin assessing your building potential today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
