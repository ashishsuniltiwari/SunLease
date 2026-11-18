"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  MapPin,
  Sun,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  RotateCw,
  Coins,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Award,
  Sparkles,
} from "lucide-react";

export default function VendorRoofDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // V-07 Form State
  const [proposalType, setProposalType] = useState<"RESCO_LEASE" | "CAPEX" | "SUBSCRIPTION">("RESCO_LEASE");
  const [proposedTariff, setProposedTariff] = useState("3.25");
  const [proposedKwp, setProposedKwp] = useState("105");
  const [timelineWeeks, setTimelineWeeks] = useState("6");
  const [commercialTerms, setCommercialTerms] = useState(
    "Zero Capex model with 25-yr O&M, ALMM-listed bifacial TOPCon modules, and SMA string inverters."
  );
  const [contractorNote, setContractorNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // V-08 Confirmation State
  const [submittedBidReceipt, setSubmittedBidReceipt] = useState<any | null>(null);

  const fetchRoof = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listing details
      const resListing = await fetch(`/api/listings/${listingId}`);
      const dataListing = await resListing.json();
      if (!resListing.ok) {
        throw new Error(dataListing.error || "Rooftop listing not found");
      }
      setListing(dataListing.listing);

      // Pre-fill kWp
      if (dataListing.listing?.estimated_kw) {
        setProposedKwp(dataListing.listing.estimated_kw.toString());
      }

      // Check if vendor already has a bid on this listing
      const resBids = await fetch("/api/bids");
      if (resBids.ok) {
        const dataBids = await resBids.json();
        const found = dataBids.bids?.find((b: any) => b.listingId === listingId);
        if (found) {
          setExistingBid(found);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load rooftop parameters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchRoof();
    }
  }, [listingId]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          amount: parseFloat(proposedTariff) || 3.25,
          kwp: parseFloat(proposedKwp) || 105,
          proposalType,
          commercialTerm: commercialTerms,
          timelineWeeks: parseInt(timelineWeeks, 10) || 6,
          note: contractorNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit blind bid");
      }

      setSubmittedBidReceipt(data.bid);
      await fetchRoof();
    } catch (err: any) {
      setSubmitError(err.message || "Bidding submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Rooftop Technical Feasibility Inspection">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-secondary" />
          <span>Loading satellite irradiance and structural telemetry...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout title="Rooftop Technical Feasibility Inspection">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-outline-variant/30 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-secondary mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">Rooftop Listing Not Found</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {error || "The requested listing does not exist, has been contracted, or has been withdrawn by the society."}
          </p>
          <Link
            href="/dashboard/vendor"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold"
          >
            &larr; Return to Marketplace
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Technical Feasibility Inspection — ${listing.societyName || listing.society}`}>
      <div className="max-w-5xl space-y-6">
        {/* Top Header Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                V-06 · TECHNICAL FEASIBILITY
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-secondary" /> SGX Encrypted Blind Auction
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              {listing.societyName || listing.society}
            </h1>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-on-surface-variant/70" />
              <span>{listing.location || "Mumbai Suburban Circle"}</span>
              {listing.city && <span>• {listing.city}</span>}
            </p>
          </div>

          <Link
            href="/dashboard/vendor"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all self-start md:self-auto"
          >
            &larr; Back to Marketplace
          </Link>
        </div>

        {/* Technical Parameters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30 space-y-1 font-mono">
            <span className="text-[10px] text-outline uppercase block">Usable Roof Area</span>
            <strong className="text-lg font-bold text-on-surface block">
              {listing.area?.toLocaleString()} sq.ft
            </strong>
            <span className="text-[11px] text-on-surface-variant block">
              ~{listing.usable_area_sqm || Math.round(listing.area * 0.0929)} m² net
            </span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30 space-y-1 font-mono">
            <span className="text-[10px] text-outline uppercase block">Estimated Capacity</span>
            <strong className="text-lg font-bold text-secondary block">
              {listing.estimated_kw || Math.round(listing.area / 115)} kWp
            </strong>
            <span className="text-[11px] text-on-surface-variant block">
              Peak solar array
            </span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30 space-y-1 font-mono">
            <span className="text-[10px] text-outline uppercase block">Annual Sunshine</span>
            <strong className="text-lg font-bold text-on-surface block">
              {listing.sunlight_hours_yr || 1780} hrs/yr
            </strong>
            <span className="text-[11px] text-primary block">
              High irradiance zone
            </span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30 space-y-1 font-mono">
            <span className="text-[10px] text-outline uppercase block">Floor Reserve Tariff</span>
            <strong className="text-lg font-bold text-primary block">
              ₹2.80 / kWh
            </strong>
            <span className="text-[11px] text-on-surface-variant block">
              Society floor price
            </span>
          </div>
        </div>

        {/* Structural & Shadow Notes */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-3">
          <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            Shadow Obstruction &amp; Structural Notes
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {listing.shade_note ||
              "Standard flat concrete terrace with elevator machine room clearance. Dedicated common-meter feeder line located within 40 meters. Ballast mounting recommended."}
          </p>
          <div className="flex items-center gap-3 text-xs font-mono text-outline pt-1">
            <span>Data Source: <strong className="text-on-surface">{listing.data_source || "GOOGLE_SOLAR"}</strong></span>
            <span>•</span>
            <span>Common Sanctioned Load: <strong className="text-on-surface">180 kVA</strong></span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* V-08: BID CONFIRMATION SCREEN */}
        {/* ========================================================================= */}
        {submittedBidReceipt ? (
          <div className="glass-panel-l1 rounded-2xl p-8 border border-primary/40 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                V-08 · Bid Confirmation
              </span>
              <h2 className="text-2xl font-heading font-bold text-on-surface">
                Blind Bid Sealed in Hardware Enclave!
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your price is sealed and invisible to rival companies in hardware SGX enclave. It will only be revealed during the RWA society evaluation round.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 max-w-md mx-auto grid grid-cols-2 gap-3 text-xs font-mono text-left">
              <div>
                <span className="text-[10px] text-outline uppercase block">Bid Reference</span>
                <strong className="text-on-surface block mt-0.5">#{submittedBidReceipt.id?.slice(-8).toUpperCase()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Proposed Tariff</span>
                <strong className="text-primary text-sm block mt-0.5">₹{submittedBidReceipt.amount?.toFixed(2)} / kWh</strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Capacity</span>
                <span className="text-secondary font-bold block mt-0.5">{submittedBidReceipt.kwp} kWp</span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Enclave State</span>
                <span className="text-primary font-bold flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3" /> Sealed
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/vendor/bids"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
              >
                <span>View in My Bids Desk (V-09)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/vendor"
                className="px-4 py-2.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
              >
                Return to Marketplace
              </Link>
            </div>
          </div>
        ) : existingBid ? (
          /* Already Bid State */
          <div className="glass-panel-l1 rounded-2xl p-6 border border-secondary/30 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-secondary" />
              <div>
                <h3 className="font-heading font-bold text-base text-on-surface">
                  You Have an Active Bid on this Rooftop
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Current Bid #{existingBid.id.slice(-8).toUpperCase()}:{" "}
                  <strong className="text-primary font-mono">₹{existingBid.amount?.toFixed(2)} / kWh</strong> ({existingBid.kwp} kWp) — Status:{" "}
                  <span className="font-mono text-secondary font-bold uppercase">{existingBid.status}</span>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                href="/vendor/bids"
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold shadow-sm"
              >
                Manage in My Bids Desk (V-09) &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* V-07: SUBMIT BLIND BID FORM */
          /* ========================================================================= */
          <form onSubmit={handleSubmitBid} className="glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-secondary font-bold uppercase">
                V-07 · Commercial Proposal Submission
              </span>
              <h2 className="text-xl font-heading font-bold text-on-surface mt-1">
                Submit Sealed Commercial Proposal
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Bids are cryptographically sealed in the enclave. Rule: exactly 1 pending proposal permitted per listing.
              </p>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Proposal Type */}
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Proposal Type
                </label>
                <select
                  value={proposalType}
                  onChange={(e: any) => setProposalType(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
                >
                  <option value="RESCO_LEASE">RESCO Zero-Capex Lease</option>
                  <option value="CAPEX">Direct CAPEX EPC Sale</option>
                  <option value="SUBSCRIPTION">Hybrid Energy Subscription</option>
                </select>
              </div>

              {/* Proposed Tariff */}
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Offered Lease Tariff (₹ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3.25"
                  value={proposedTariff}
                  onChange={(e) => setProposedTariff(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-sm font-bold text-primary"
                />
              </div>

              {/* Proposed kWp */}
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Proposed Array Size (kWp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="105"
                  value={proposedKwp}
                  onChange={(e) => setProposedKwp(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-sm font-bold text-secondary"
                />
              </div>
            </div>

            {/* Execution Timeline & Commercial Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Project Execution Timeline (Weeks)
                </label>
                <input
                  type="number"
                  required
                  placeholder="6"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Commercial Terms Summary
                </label>
                <input
                  type="text"
                  required
                  value={commercialTerms}
                  onChange={(e) => setCommercialTerms(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
                />
              </div>
            </div>

            {/* Contractor Hardware Notes */}
            <div>
              <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold text-xs">
                Hardware Equipment Specifications &amp; Notes
              </label>
              <textarea
                rows={3}
                placeholder="Specify panel brand (ALMM Tier-1), inverter make (SMA/Sungrow), and warranty clauses..."
                value={contractorNote}
                onChange={(e) => setContractorNote(e.target.value)}
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Lock className="w-4 h-4 text-secondary" />
                <span>Encrypted into SGX enclave. Zero competitor visibility.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-on font-bold hover:brightness-110 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sealing in Enclave...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Sealed Blind Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
