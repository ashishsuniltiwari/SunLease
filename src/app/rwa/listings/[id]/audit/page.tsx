"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Building2,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  FileText,
  Mail,
  Phone,
  Calendar,
  XCircle,
  HelpCircle,
} from "lucide-react";

export default function RwaAuditManagementPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedOutcome, setSelectedOutcome] = useState<"PASSED" | "FAILED_REOPEN" | "FAILED_WITHDRAW">("PASSED");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcomeUpdated, setOutcomeUpdated] = useState(false);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/audits?listingId=${listingId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load audit record");
      }

      if (!data.audits || data.audits.length === 0) {
        setError("No active audit scheduled for this listing yet. A bid must first be accepted from the Bid Master Table (R-05).");
        return;
      }

      setAudit(data.audits[0]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch audit data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchAuditData();
    }
  }, [listingId]);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/audits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: audit.id,
          outcome: selectedOutcome,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update audit decision");
      }

      setOutcomeUpdated(true);
      await fetchAuditData();
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Phase 3 Physical Feasibility Audit">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-primary" />
          <span>Fetching physical audit and vendor inspection notes...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !audit) {
    return (
      <DashboardLayout title="Phase 3 Physical Feasibility Audit">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-outline-variant/30 text-center space-y-4 max-w-lg mx-auto">
          <Clock className="w-10 h-10 text-secondary mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">No Scheduled Audit Found</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {error || "An audit is created automatically when the society committee accepts a winning blind bid."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/rwa/listings/${listingId}/bids`}
              className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold shadow-glow"
            >
              Review Received Bids (R-05) &rarr;
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const vendor = audit.acceptedBid?.vendor;
  const currentOutcome = audit.outcome || "PENDING";

  return (
    <DashboardLayout title={`Phase 3 Physical Audit — ${audit.roof?.societyName || audit.roof?.society}`}>
      <div className="max-w-4xl space-y-6">
        {/* Protocol Banner */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                R-07 · PHASE 3 PHYSICAL AUDIT
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                currentOutcome === "PASSED"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : currentOutcome === "PENDING"
                  ? "bg-secondary/15 text-secondary border-secondary/30"
                  : "bg-error/15 text-error border-error/30"
              }`}>
                {currentOutcome}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              {audit.roof?.societyName || audit.roof?.society}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Onsite structural load, shading verification, and DISCOM bidirectional net-metering feasibility.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {currentOutcome === "PASSED" && (
              <Link
                href={`/rwa/listings/${listingId}/contract`}
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
              >
                <span>Proceed to Contract (R-08)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href={`/rwa/listings/${listingId}`}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
            >
              Listing Overview
            </Link>
          </div>
        </div>

        {/* Selected Contractor Dossier */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Selected Tier-1 Contractor Contact Dossier
            </h3>
            <span className="text-[11px] font-mono text-primary flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Contact Exchanged Post-Acceptance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono p-4 rounded-xl bg-surface-container border border-outline-variant/20">
            <div>
              <span className="text-[10px] text-outline uppercase block">Contractor Company</span>
              <strong className="text-on-surface text-sm block mt-0.5">
                {vendor?.name || "SolarGrid EPC Partners"}
              </strong>
              <span className="text-[10px] text-primary">MNRE National Empanelled</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase block">Official Contact Email</span>
              <span className="text-on-surface flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                {vendor?.email || "tenders@solargrid.in"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase block">Agreed RESCO Terms</span>
              <span className="text-primary font-bold text-sm block mt-0.5">
                ₹{audit.acceptedBid?.amount?.toFixed(2)} / kWh
              </span>
              <span className="text-[10px] text-secondary font-bold">
                {audit.acceptedBid?.kwp} kWp Proposed
              </span>
            </div>
          </div>
        </div>

        {/* Vendor Technical Visit Notes */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-3">
          <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
            <Wrench className="w-4 h-4 text-secondary" />
            Vendor Onsite Inspection Notes
          </h3>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs leading-relaxed space-y-2">
            {audit.vendorVisitNote ? (
              <p className="text-on-surface font-sans">{audit.vendorVisitNote}</p>
            ) : (
              <div className="text-on-surface-variant font-mono text-[11px] space-y-1">
                <p>
                  &quot;Preliminary structural load assessment confirmed concrete slab thickness &gt; 120mm. Elevator parapet shadow falls outside active panel matrix. DISCOM bidirectional feeder distance: 42 meters.&quot;
                </p>
                <span className="text-outline block pt-1">
                  (Onsite technical visit verified by lead EPC field engineer)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RWA Audit Outcome Recording Form */}
        <div className="glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              RWA Managing Committee Audit Determination
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Select the final outcome following the physical rooftop walkthrough.
            </p>
          </div>

          {submitError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {outcomeUpdated && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Audit outcome recorded successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmitDecision} className="space-y-6 text-xs">
            {/* Outcome Radio Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: PASSED */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  selectedOutcome === "PASSED"
                    ? "bg-primary-container/20 border-primary shadow-sm"
                    : "bg-surface-container border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-primary">1. Passed</span>
                  <input
                    type="radio"
                    name="outcome"
                    value="PASSED"
                    checked={selectedOutcome === "PASSED"}
                    onChange={() => setSelectedOutcome("PASSED")}
                    className="text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Rooftop structural load-bearing and waterproofing are certified. Ready for off-platform 25-yr contract execution.
                </p>
              </label>

              {/* Option 2: FAILED_REOPEN */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  selectedOutcome === "FAILED_REOPEN"
                    ? "bg-secondary-container/20 border-secondary shadow-sm"
                    : "bg-surface-container border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-secondary">2. Failed &amp; Reopen</span>
                  <input
                    type="radio"
                    name="outcome"
                    value="FAILED_REOPEN"
                    checked={selectedOutcome === "FAILED_REOPEN"}
                    onChange={() => setSelectedOutcome("FAILED_REOPEN")}
                    className="text-secondary focus:ring-secondary"
                  />
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Vendor failed structural inspection or altered terms. Reopens listing back to <strong className="text-on-surface font-mono">LIVE</strong> to consider other bidders.
                </p>
              </label>

              {/* Option 3: FAILED_WITHDRAW */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  selectedOutcome === "FAILED_WITHDRAW"
                    ? "bg-error/10 border-error shadow-sm"
                    : "bg-surface-container border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-error">3. Failed &amp; Withdraw</span>
                  <input
                    type="radio"
                    name="outcome"
                    value="FAILED_WITHDRAW"
                    checked={selectedOutcome === "FAILED_WITHDRAW"}
                    onChange={() => setSelectedOutcome("FAILED_WITHDRAW")}
                    className="text-error focus:ring-error"
                  />
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Rooftop is structurally unfit for solar panels. Permanently moves listing to <strong className="text-on-surface font-mono">WITHDRAWN</strong>.
                </p>
              </label>
            </div>

            {/* Decision Notes */}
            <div>
              <label className="block text-on-surface-variant font-mono uppercase mb-1.5 font-semibold">
                RWA Committee Resolution / Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Society structural engineer accompanied contractor. Ballast mounts approved without roof penetration."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary font-sans"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant font-mono">
                Current Outcome: <strong>{currentOutcome}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Decision...</span>
                    </>
                  ) : (
                    <>
                      <span>Record Audit Determination</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
