"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileCheck2,
  Users,
  Coins,
  BadgePercent,
  Calculator,
} from "lucide-react";

export default function ForSocietiesPage() {
  const benefits = [
    {
      icon: Coins,
      title: "Guaranteed Monthly Revenue",
      desc: "Monetize idle, non-accessible terrace slabs. Societies earn ₹2,600 to ₹3,900 per installed kWp per year, credited directly to the society sinking or reserve bank account.",
    },
    {
      icon: BadgePercent,
      title: "Zero Sinking Fund Depletion",
      desc: "100% of solar photovoltaic modules, string inverters, and mounting structures are funded, insured, and maintained by the empanelled EPC developer for 25 years.",
    },
    {
      icon: Zap,
      title: "Common Area Power Savings",
      desc: "Offset 40% to 75% of society electricity bills for passenger elevators, borewell pumps, basement lighting, and clubhouse air conditioning via DISCOM net-metering.",
    },
    {
      icon: Lock,
      title: "Legally Protected RESCO PPA",
      desc: "Standardized Tripartite PPA vetted by energy legal counsels protects society structural integrity, waterproofing warranties, and sets transparent dispute escrow mechanisms.",
    },
    {
      icon: ShieldCheck,
      title: "Pre-Vetted Tier-1 Installers",
      desc: "Only MNRE empanelled contractors with a minimum 500 kWp installed commercial track record can participate in our blind bidding enclave.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Telemetry Transparency",
      desc: "Managing committees receive live kWh solar generation dashboards, grid-feed statistics, and automated carbon reduction certificates for annual general meetings (AGMs).",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>P-03 · HOUSING SOCIETIES &amp; RWAs</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-on-surface">
            Turn Your Society Rooftop into Clean Solar Yield
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Protect your society&apos;s maintenance corpus. Adopt commercial-grade rooftop solar with zero capital investment, guaranteed monthly lease earnings, and 25-year comprehensive O&amp;M.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/rwa/listings/new"
              className="px-6 py-3 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
            >
              <span>Scan Society Rooftop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-5 py-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container-highest transition-colors"
            >
              Learn the 4-Phase Process
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-on-surface">
                  {b.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* RWA Adoption Flow */}
        <div className="glass-panel-l2 rounded-2xl p-8 border border-outline-variant/30 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">
              Simple 3-Step RWA Committee Resolution
            </h2>
            <p className="text-xs text-on-surface-variant">
              Designed to pass easily through Managing Committee meetings and general body votes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <span className="font-mono text-primary font-bold text-sm">Step A · Feasibility &amp; Listing</span>
              <h4 className="font-heading font-semibold text-sm text-on-surface">Google Solar Scan</h4>
              <p className="text-on-surface-variant">
                Enter your address. Our satellite tool maps shadow-free area and provides a committee ready 1-page PDF feasibility summary with estimated revenue.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <span className="font-mono text-secondary font-bold text-sm">Step B · Blind EPC Auction</span>
              <h4 className="font-heading font-semibold text-sm text-on-surface">Receive Sealed Bids</h4>
              <p className="text-on-surface-variant">
                Empanelled Tier-1 EPC contractors bid blind. The society reviews all verified offers in a side-by-side comparison matrix with zero vendor harassment.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
              <span className="font-mono text-tertiary font-bold text-sm">Step C · Execution &amp; Payouts</span>
              <h4 className="font-heading font-semibold text-sm text-on-surface">Onsite Audit &amp; Lease</h4>
              <p className="text-on-surface-variant">
                Conduct structural load audit, sign standard model tripartite agreement, and begin receiving monthly lease income with live telemetry tracking.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-panel-l1 rounded-2xl p-8 border border-outline-variant/30 space-y-6">
          <h2 className="text-xl font-heading font-bold text-on-surface text-center">
            Frequently Asked Questions for Society Committees
          </h2>
          <div className="divide-y divide-outline-variant/20 max-w-3xl mx-auto text-xs space-y-4">
            <div className="pt-4 space-y-1.5">
              <h4 className="font-bold text-sm text-on-surface">Does solar installation damage rooftop waterproofing?</h4>
              <p className="text-on-surface-variant leading-relaxed">
                No. Tier-1 EPC developers utilize non-penetrative, pre-cast concrete ballast mounting structures or elevated walkways designed to preserve existing waterproofing membranes and provide clear access for routine society maintenance.
              </p>
            </div>
            <div className="pt-4 space-y-1.5">
              <h4 className="font-bold text-sm text-on-surface">Who pays for maintenance if an inverter or module fails?</h4>
              <p className="text-on-surface-variant leading-relaxed">
                Under the RESCO lease model, 100% of equipment replacement, repairs, insurance, and routine panel washing are the contractual responsibility of the EPC developer. The society incurs zero out-of-pocket costs.
              </p>
            </div>
            <div className="pt-4 space-y-1.5">
              <h4 className="font-bold text-sm text-on-surface">What happens if the society wants to terminate early?</h4>
              <p className="text-on-surface-variant leading-relaxed">
                Our model agreement includes standard buy-out schedules with straight-line depreciation if the housing society ever decides to acquire plant ownership early.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
