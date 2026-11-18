"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Store,
  ShieldCheck,
  Lock,
  Award,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  Scale,
  Activity,
} from "lucide-react";

export default function ForVendorsPage() {
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [licenseType, setLicenseType] = useState("MNRE_TIER_1");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const rules = [
    {
      num: "Rule 1",
      title: "One Pending Bid Per Listing",
      desc: "Each empanelled developer may submit exactly one active pending proposal per live society listing. Re-bidding requires explicitly withdrawing the prior submission, eliminating speculative spam.",
    },
    {
      num: "Rule 2",
      title: "Cryptographic Blind Enclave",
      desc: "All submitted commercial tariffs (₹/kWh) and CAPEX proposals remain strictly encrypted in Intel SGX hardware. Neither competitors nor platform operators can inspect bids until the RWA review round.",
    },
    {
      num: "Rule 3",
      title: "Pre-Qualified Housing Societies",
      desc: "Every listing on SunLease represents an active housing society with common-meter data, DISCOM sanctioned load, and preliminary satellite structural clearance.",
    },
    {
      num: "Rule 4",
      title: "Direct Physical Feasibility Audit",
      desc: "When an RWA committee selects your proposal, competing bids transition to Not Selected, and you are granted exclusive access to schedule the onsite structural audit and DISCOM paperwork.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-mono font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>P-04 · SOLAR EPC DEVELOPERS &amp; INSTALLERS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-on-surface">
            Scale Your Commercial Rooftop Solar Pipeline
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Gain direct, qualified access to cooperative housing societies across major metropolitan grid circles. Fair, transparent blind auctions with zero commission cuts on EPC hardware.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/vendor"
              className="px-6 py-3 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-sm"
            >
              <span>Explore Live Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vendor/verification"
              className="px-5 py-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container-highest transition-colors"
            >
              Submit Empanelment Dossier
            </Link>
          </div>
        </div>

        {/* 4 Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((r, i) => (
            <div
              key={i}
              className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-3 group hover:border-secondary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-secondary uppercase px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                  {r.num}
                </span>
                <Lock className="w-4 h-4 text-on-surface-variant" />
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                {r.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Empanelment Criteria + Fast Track Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 glass-panel-l1 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-on-surface">
              Installer Empanelment Standards
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              To protect residential housing societies from fly-by-night operators, SunLease enforces strict pre-qualification guidelines before granting auction bidding keys:
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                <BadgeCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-semibold block text-sm">Valid MNRE or State DISCOM Empanelment</strong>
                  <p className="text-on-surface-variant mt-0.5">
                    Active certificate of registration with MSEDCL, Adani Electricity, Tata Power, BESCOM, or MNRE Phase-II channel partner portal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-semibold block text-sm">Tier-1 Equipment Compliance</strong>
                  <p className="text-on-surface-variant mt-0.5">
                    Commitment to deploying ALMM-listed (Approved List of Models and Manufacturers) mono-PERC/TOPCon solar modules and BIS-certified string inverters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-on-surface font-semibold block text-sm">Statutory Tax &amp; Corporate Dossier</strong>
                  <p className="text-on-surface-variant mt-0.5">
                    Corporate PAN, Active GSTIN registration with zero compliance holds, and audited financial statements for the prior 2 fiscal years.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Apply Card */}
          <div className="lg:col-span-5 glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-secondary/30 space-y-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              <h3 className="font-heading font-bold text-lg text-on-surface">Apply for Vendor Empanelment</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Submit your corporate details to request digital bidding credentials.
            </p>

            {submitted ? (
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 space-y-2">
                <div className="flex items-center gap-2 text-secondary font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dossier Dispatched to Verification Desk!</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Our compliance officer will verify your GSTIN and dispatch auction credentials to <code className="text-primary font-mono">{companyEmail}</code> within 1 business day.
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/vendor"
                    className="inline-flex items-center gap-1.5 text-xs text-secondary hover:underline font-semibold"
                  >
                    View Live Marketplace Demo &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex CleanEnergy Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tender@solargrid.in"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                    Primary Licensing Level
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary"
                  >
                    <option value="MNRE_TIER_1">MNRE Tier-1 National Channel Partner</option>
                    <option value="STATE_DISCOM">State DISCOM (MSEDCL/Adani/Tata) Empanelled</option>
                    <option value="CAPEX_EPC">Specialized Commercial Rooftop EPC (&gt;1 MWp)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-secondary text-secondary-on font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Request Vendor Empanelment"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
