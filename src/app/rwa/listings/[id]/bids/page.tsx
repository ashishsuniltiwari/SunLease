"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileCheck2,
  Lock,
  Clock,
  ShieldCheck,
  Building2,
  Zap,
  ArrowRight,
  Eye,
  Key,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Coins,
  BadgeAlert,
  UserCheck,
  XCircle,
  Calendar,
} from "lucide-react";

export default function BidComparisonMasterPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsealed, setUnsealed] = useState(true); // Default unsealed for RWA evaluation

  // R-06 Modal State
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listing
      const resListing = await fetch(`/api/listings/${listingId}`);
      const dataListing = await resListing.json();
      if (!resListing.ok) {
        throw new Error(dataListing.error || "Failed to load listing details");
      }
      setListing(dataListing.listing);

      // Fetch bids
      const resBids = await fetch(`/api/bids?listingId=${listingId}`);
      const dataBids = await resBids.json();
      if (!resBids.ok) {
        throw new Error(dataBids.error || "Failed to load bids");
      }
      setBids(dataBids.bids || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchData();
    }
  }, [listingId]);

  // Execute R-06 Bid Acceptance
  const handleConfirmAccept = async () => {
    if (!selectedBid) return;
    setIsAccepting(true);
    setAcceptError(null);

    try {
      const res = await fetch(`/api/bids/${selectedBid.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept bid");
      }

      // Close modal and redirect to Audit Desk (R-07)
      setSelectedBid(null);
      router.push(`/rwa/listings/${listingId}/audit`);
    } catch (err: any) {
      setAcceptError(err.message || "Failed to accept proposal");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Bid Comparison Master Table">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-primary" />
          <span>Decrypting and fetching blind bids from Intel SGX hardware enclave...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout title="Bid Comparison Master Table">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-error/30 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-error mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">Unable to Load Bids</h2>
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

  const listingStatus = (listing.status || "LIVE").toUpperCase();

  return (
    <DashboardLayout title={`Bid Comparison Master Table — ${listing.societyName || listing.society}`}>
      <div className="space-y-6 max-w-6xl">
        {/* Header Protocol Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                R-05 · BID COMPARISON MASTER
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-secondary" /> SGX Enclave Anti-Collusion Protocol Active
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              {listing.societyName || listing.society}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Target Capacity: <strong className="text-on-surface font-mono">{listing.estimated_kw || 116} kWp</strong> • Usable Area: <strong className="text-on-surface font-mono">{listing.area?.toLocaleString()} sq.ft</strong> • Status: <strong className="text-primary font-mono">{listingStatus}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setUnsealed(!unsealed)}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-secondary" />
              <span>{unsealed ? "Simulate Sealed View" : "Reveal Bids"}</span>
            </button>
            <Link
              href={`/rwa/listings/${listing.id}`}
              className="px-3.5 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
            >
              <span>Listing Detail (R-04)</span>
            </Link>
          </div>
        </div>

        {/* Auction Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Received Proposals</span>
            <div className="flex items-center gap-2 mt-1">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <span className="text-lg font-mono font-bold text-primary">{bids.length} Submitted Bids</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Tier-1 &amp; Tier-2 empanelled</span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Reserve Floor Tariff</span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-secondary" />
              <span className="text-lg font-mono font-bold text-on-surface">₹2.80 / kWh</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Guaranteed minimum rate</span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Listing Phase</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${listingStatus === "LIVE" ? "bg-primary animate-pulse" : "bg-secondary"}`} />
              <span className="text-lg font-mono font-bold text-on-surface">{listingStatus}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">
              {listingStatus === "LIVE" ? "Open for bid acceptance" : "Auction round concluded"}
            </span>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="glass-panel-l1 rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/50">
            <div>
              <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
                Comparative Commercial Analysis
                <span className="text-xs font-mono font-normal text-on-surface-variant">
                  ({bids.length} proposals)
                </span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                All rates normalized to 25-year indexed RESCO lease payouts and verified kWp capacities.
              </p>
            </div>
            <span className="text-[11px] font-mono text-primary flex items-center gap-1.5 self-start sm:self-auto bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Hardware SGX Verified
            </span>
          </div>

          {bids.length === 0 ? (
            <div className="p-12 text-center space-y-3 font-mono text-xs text-on-surface-variant">
              <Clock className="w-8 h-8 mx-auto text-on-surface-variant/50" />
              <p className="text-sm font-heading font-bold text-on-surface">No Bids Submitted Yet</p>
              <p className="max-w-md mx-auto text-xs">
                This listing is active in the contractor marketplace. Empanelled solar developers are conducting preliminary structural scans.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant font-mono uppercase text-[10px] bg-surface-container/40">
                    <th className="py-3.5 px-4">Bid Ref / Vendor</th>
                    <th className="py-3.5 px-4">Model &amp; Capacity</th>
                    <th className="py-3.5 px-4 text-right">Proposed Tariff</th>
                    <th className="py-3.5 px-4 text-right">Est. Society Rent</th>
                    <th className="py-3.5 px-4 text-center">Timeline</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {bids.map((b) => {
                    const isPending = b.status === "PENDING";
                    const isAccepted = b.status === "ACCEPTED";
                    const isNotSelected = b.status === "NOT_SELECTED";
                    const isWithdrawn = b.status === "WITHDRAWN";

                    const annualEstLakhs = ((b.kwp * (b.amount * 1000) * 1.2) / 100000).toFixed(1);

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-surface-container-high/30 transition-colors ${
                          isAccepted ? "bg-primary-container/10 font-medium" : ""
                        }`}
                      >
                        {/* Vendor & ID */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-on-surface text-xs">
                                #{b.id.slice(-8).toUpperCase()}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/10 text-primary border border-primary/20">
                                Tier-1
                              </span>
                            </div>
                            <span className="text-xs text-on-surface-variant block font-medium">
                              {b.vendor?.name || b.vendor?.email || "Empanelled EPC Contractor"}
                            </span>
                            <span className="text-[10px] font-mono text-outline block">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Model & Capacity */}
                        <td className="py-4 px-4 font-mono">
                          <span className="font-bold text-secondary text-sm block">
                            {b.kwp} kWp
                          </span>
                          <span className="text-[10px] text-on-surface-variant block">
                            {b.proposalType || "RESCO_LEASE"}
                          </span>
                        </td>

                        {/* Proposed Tariff */}
                        <td className="py-4 px-4 text-right font-mono">
                          {unsealed ? (
                            <div>
                              <span className="text-base font-extrabold text-primary block">
                                ₹{b.amount?.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-on-surface-variant">per kWh</span>
                            </div>
                          ) : (
                            <span className="font-mono text-outline tracking-widest text-xs">
                              ••••••••
                            </span>
                          )}
                        </td>

                        {/* Est. Society Rent */}
                        <td className="py-4 px-4 text-right font-mono">
                          {unsealed ? (
                            <div>
                              <strong className="text-on-surface text-xs block">
                                ~₹{annualEstLakhs}L / yr
                              </strong>
                              <span className="text-[10px] text-on-surface-variant">Guaranteed Indexed</span>
                            </div>
                          ) : (
                            <span className="font-mono text-outline tracking-widest text-xs">••••</span>
                          )}
                        </td>

                        {/* Timeline */}
                        <td className="py-4 px-4 text-center font-mono text-xs">
                          {b.timelineWeeks ? `${b.timelineWeeks} Weeks` : "6-8 Weeks"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            isAccepted
                              ? "bg-primary/20 text-primary border-primary/40"
                              : isPending
                              ? "bg-secondary/15 text-secondary border-secondary/30"
                              : isNotSelected
                              ? "bg-outline-variant/30 text-on-surface-variant border-outline-variant/40"
                              : "bg-error/15 text-error border-error/30"
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        {/* Action (R-06 Trigger) */}
                        <td className="py-4 px-4 text-right">
                          {isPending && (listingStatus === "LIVE" || listingStatus === "ACTIVE" || listingStatus === "OPEN") ? (
                            <button
                              onClick={() => setSelectedBid(b)}
                              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 transition-all shadow-glow flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <span>Accept Bid</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : isAccepted ? (
                            <Link
                              href={`/rwa/listings/${listingId}/audit`}
                              className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-on text-xs font-semibold hover:brightness-110 inline-flex items-center gap-1"
                            >
                              <span>Audit Desk &rarr;</span>
                            </Link>
                          ) : (
                            <span className="text-[11px] font-mono text-outline">Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* R-06: CONFIRM ACCEPT MODAL */}
        {selectedBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel-l1 rounded-2xl p-6 sm:p-8 border border-primary/40 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center gap-2.5 text-primary">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-heading font-bold text-lg text-on-surface">
                  R-06 · Confirm Winning Solar Bid
                </h3>
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Binding Auction Transition Warning</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Accepting this proposal will atomically mark all competing bids as <strong className="text-on-surface font-mono">NOT_SELECTED</strong>, advance listing status to <strong className="text-secondary font-mono">AUDIT_SCHEDULED</strong>, and initiate Phase 3 Physical Feasibility with the selected installer.
                </p>
              </div>

              {/* Proposal Summary Card */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Contractor Name:</span>
                  <strong className="text-on-surface font-bold">
                    {selectedBid.vendor?.name || selectedBid.vendor?.email || "Empanelled EPC Contractor"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Agreed Lease Tariff:</span>
                  <strong className="text-primary font-bold text-sm">
                    ₹{selectedBid.amount?.toFixed(2)} / kWh
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">System Capacity:</span>
                  <strong className="text-secondary font-bold">
                    {selectedBid.kwp} kWp (Zero Capex)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Commercial Model:</span>
                  <span className="text-on-surface">{selectedBid.proposalType || "RESCO_LEASE"}</span>
                </div>
              </div>

              {acceptError && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{acceptError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={() => setSelectedBid(null)}
                  className="px-4 py-2.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={handleConfirmAccept}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {isAccepting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking In Winning Bid...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm &amp; Proceed to Audit (Phase 3)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
