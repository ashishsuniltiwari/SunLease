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
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  RotateCw,
  Trash2,
  Lock,
  Wrench,
  FileCheck2,
  Coins,
  ChevronRight,
  XCircle,
  Eye,
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/listings/${listingId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load listing");
      }
      setListing(data.listing);
    } catch (err: any) {
      setError(err.message || "Failed to fetch listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Handle Publish from DRAFT -> LIVE
  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listingId,
          action: "PUBLISH",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish listing");
      }
      await fetchListing();
    } catch (err: any) {
      alert(`Publish error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Withdraw Listing
  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listingId,
          action: "WITHDRAW",
          withdrawReason: withdrawReason || "Withdrawn by Society RWA",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to withdraw listing");
      }
      setShowWithdrawModal(false);
      await fetchListing();
    } catch (err: any) {
      alert(`Withdraw error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Listing Details">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-primary" />
          <span>Loading rooftop parameters and blind bidding state...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout title="Listing Details">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-error/30 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-error mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">Unable to Access Listing</h2>
          <p className="text-xs text-on-surface-variant">{error || "Listing not found or access restricted."}</p>
          <Link
            href="/dashboard/rwa"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold"
          >
            &larr; Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const status = (listing.status || "LIVE").toUpperCase();

  // Progress Bar Phases
  const phases = [
    { key: "DRAFT", label: "Draft", sub: "Society Review" },
    { key: "LIVE", label: "Live Auction", sub: "Blind Bids Open" },
    { key: "AUDIT_SCHEDULED", label: "Audit", sub: "Onsite Feasibility" },
    { key: "CONTRACTED", label: "Contracted", sub: "25-Yr Lease Active" },
  ];

  const getPhaseIndex = (st: string) => {
    if (st === "DRAFT") return 0;
    if (st === "LIVE" || st === "ACTIVE" || st === "OPEN") return 1;
    if (st === "AUDIT_SCHEDULED") return 2;
    if (st === "CONTRACTED") return 3;
    if (st === "CLOSED" || st === "WITHDRAWN") return 4;
    return 1;
  };

  const currentIdx = getPhaseIndex(status);

  return (
    <DashboardLayout title={`Listing #${listing.id.slice(-6).toUpperCase()} — ${listing.societyName || listing.society}`}>
      <div className="max-w-5xl space-y-6">
        {/* Top Header Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                #{listing.id.slice(-8).toUpperCase()}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                status === "DRAFT"
                  ? "bg-warning/15 text-warning border-warning/30"
                  : status === "WITHDRAWN" || status === "CLOSED"
                  ? "bg-error/15 text-error border-error/30"
                  : status === "AUDIT_SCHEDULED"
                  ? "bg-secondary/15 text-secondary border-secondary/30"
                  : status === "CONTRACTED"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-primary/15 text-primary border-primary/30"
              }`}>
                {status}
              </span>
              {listing.data_source === "MANUAL_OVERRIDE" && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary/10 text-secondary border border-secondary/20">
                  Entered by the society
                </span>
              )}
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

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Context Actions based on Status */}
            {status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{actionLoading ? "Publishing..." : "Publish to Live Auction"}</span>
              </button>
            )}

            {(status === "LIVE" || status === "ACTIVE" || status === "OPEN") && (
              <>
                <Link
                  href={`/rwa/listings/${listing.id}/bids`}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Compare Bids ({listing.bids?.length || listing._count?.bids || 0})</span>
                </Link>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-error/90 hover:text-error hover:bg-error/10 border border-outline-variant/30 transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Withdraw Listing</span>
                </button>
              </>
            )}

            {status === "AUDIT_SCHEDULED" && (
              <Link
                href={`/rwa/listings/${listing.id}/audit`}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-sm"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Manage Physical Audit (R-07)</span>
              </Link>
            )}

            {status === "CONTRACTED" && (
              <>
                <Link
                  href={`/rwa/listings/${listing.id}/contract`}
                  className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>View Contract (R-08)</span>
                </Link>
                <Link
                  href="/dashboard/rwa"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>View Telemetry</span>
                </Link>
              </>
            )}

            <Link
              href="/dashboard/rwa"
              className="px-3 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
            >
              Back
            </Link>
          </div>
        </div>

        {/* 6-PHASE PROGRESS BAR */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-on-surface uppercase tracking-wider">
              R-04 · Listing Lifecycle Phase
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Current: <strong className="text-primary">{status}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {phases.map((p, idx) => {
              const isPast = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              return (
                <div
                  key={p.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-primary-container/20 border-primary shadow-[0_0_15px_rgba(0,229,153,0.15)]"
                      : isPast
                      ? "bg-surface-container/60 border-primary/30 text-on-surface-variant"
                      : "bg-surface-container-low/40 border-outline-variant/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-outline">
                      PHASE 0{idx + 1}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <h4 className={`font-heading font-bold text-xs ${isCurrent ? "text-primary" : "text-on-surface"}`}>
                    {p.label}
                  </h4>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">
                    {p.sub}
                  </span>
                </div>
              );
            })}
          </div>

          {status === "WITHDRAWN" && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>This listing has been formally withdrawn. All pending vendor bids were updated to NOT_SELECTED.</span>
            </div>
          )}
        </div>

        {/* Specifications & Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rooftop Specs */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Rooftop Structural Specs
            </h3>
            <div className="space-y-3 text-xs divide-y divide-outline-variant/20 font-mono">
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Gross Area:</span>
                <strong className="text-on-surface">{listing.area?.toLocaleString()} sq.ft</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Usable Metric:</span>
                <strong className="text-on-surface">{listing.usable_area_sqm || Math.round(listing.area * 0.0929)} m²</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Est. Capacity:</span>
                <strong className="text-secondary font-bold">{listing.estimated_kw || Math.round(listing.area / 115)} kWp</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Annual Sun:</span>
                <strong className="text-on-surface">{listing.sunlight_hours_yr || 1780} hrs/yr</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Bidding Details */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Lock className="w-4 h-4 text-secondary" />
              Blind Auction State
            </h3>
            <div className="space-y-3 text-xs divide-y divide-outline-variant/20 font-mono">
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Bids Received:</span>
                <strong className="text-primary font-bold">{listing.bids?.length || 0} Sealed</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Auction Enclave:</span>
                <span className="text-primary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Intel SGX
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Reserve Tariff:</span>
                <strong className="text-on-surface">₹2.80 / kWh Floor</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Created On:</span>
                <span className="text-on-surface">{new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Commercial Projections */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Coins className="w-4 h-4 text-tertiary" />
              RWA Financial Projections
            </h3>
            <div className="space-y-3 text-xs divide-y divide-outline-variant/20 font-mono">
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Society Capex:</span>
                <strong className="text-primary font-bold">₹0.00 (Zero)</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">Est. Annual Rent:</span>
                <strong className="text-primary">
                  ₹{(Math.round((listing.estimated_kw || 116) * 3200) / 100000).toFixed(1)} Lakhs
                </strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">25-Yr Indexed Corpus:</span>
                <strong className="text-secondary">
                  ₹{(Math.round((listing.estimated_kw || 116) * 3200 * 25 * 1.3) / 100000).toFixed(1)} Lakhs
                </strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-on-surface-variant">CO2 Reduction:</span>
                <span className="text-on-surface">~{Math.round((listing.estimated_kw || 116) * 1.35)} Tons/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="glass-panel-l2 rounded-xl p-4 border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-on-surface-variant">
            Listing Actions Navigation:
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/rwa/listings/${listing.id}/bids`}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-on-surface font-semibold flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-primary" />
              <span>R-05 Bid Master Table</span>
            </Link>
            <Link
              href={`/rwa/listings/${listing.id}/audit`}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-secondary/50 text-on-surface font-semibold flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-secondary" />
              <span>R-07 Audit Desk</span>
            </Link>
            <Link
              href={`/rwa/listings/${listing.id}/contract`}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-tertiary/50 text-on-surface font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-tertiary" />
              <span>R-08 Contract</span>
            </Link>
          </div>
        </div>

        {/* Withdraw Confirmation Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel-l1 rounded-2xl p-6 border border-error/40 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-error">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-heading font-bold text-lg">Withdraw Rooftop Listing?</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Withdrawing this listing will immediately remove it from the live contractor marketplace and transition all received pending bids to <strong className="text-on-surface font-mono">NOT_SELECTED</strong>.
              </p>
              <div className="space-y-1 text-xs">
                <label className="font-mono text-on-surface-variant uppercase font-semibold">
                  Reason for Withdrawal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Society AGM deferred decision, structural renovation"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-error"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleWithdraw}
                  className="px-4 py-2 rounded-lg bg-error text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? "Withdrawing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
