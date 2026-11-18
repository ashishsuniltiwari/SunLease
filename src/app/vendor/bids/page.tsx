"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Gavel,
  Lock,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  XCircle,
  ArrowRight,
  Store,
  Wrench,
} from "lucide-react";

export default function VendorBidsPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bids");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch bids");
      }
      setBids(data.bids || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleWithdrawBid = async (bidId: string) => {
    if (!confirm("Are you sure you want to withdraw this blind bid? You will be released from the bidding round.")) {
      return;
    }

    setWithdrawingId(bidId);
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "WITHDRAW" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to withdraw bid");
      }
      await fetchBids();
    } catch (err: any) {
      alert(`Withdraw error: ${err.message}`);
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Submitted Bids Desk (V-09)">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-secondary" />
          <span>Decrypting and fetching your submitted blind auction commitments...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Submitted Bids & Active Auctions">
      <div className="space-y-6 max-w-6xl">
        {/* Banner */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                V-09 · MY BIDS DESK
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-secondary" /> Hardware Enclave Blind-Bid Isolation Active
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              Submitted Blind Auction Bids
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Track your firm tariff commitments across housing society rooftop leasing auctions.
            </p>
          </div>

          <Link
            href="/dashboard/vendor"
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 self-start md:self-auto shadow-sm"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Explore Live Marketplace</span>
          </Link>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bids List */}
        {bids.length === 0 ? (
          <div className="glass-panel-l1 rounded-2xl p-12 border border-outline-variant/30 text-center space-y-3 font-mono text-xs text-on-surface-variant">
            <Gavel className="w-8 h-8 mx-auto text-on-surface-variant/50" />
            <h3 className="text-base font-heading font-bold text-on-surface">No Bids Submitted Yet</h3>
            <p className="max-w-md mx-auto text-xs">
              You haven&apos;t placed any blind bids yet. Browse the live society rooftop marketplace to evaluate solar feasibility and submit proposals.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/vendor"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-on font-bold shadow-sm"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bids.map((b) => {
              const statusUpper = (b.status || "PENDING").toUpperCase();
              const isPending = statusUpper === "PENDING";
              const isAccepted = statusUpper === "ACCEPTED";
              const isWithdrawn = statusUpper === "WITHDRAWN";
              const isNotSelected = statusUpper === "NOT_SELECTED";

              return (
                <div
                  key={b.id}
                  className={`glass-panel-l1 rounded-2xl p-5 border flex flex-col justify-between gap-4 transition-all ${
                    isAccepted
                      ? "border-primary/50 shadow-[0_0_15px_rgba(0,229,153,0.1)] bg-primary-container/5"
                      : "border-outline-variant/30"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-on-surface">
                            #{b.id.slice(-8).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            isAccepted
                              ? "bg-primary/20 text-primary border-primary/40"
                              : isPending
                              ? "bg-secondary/15 text-secondary border-secondary/30"
                              : isWithdrawn
                              ? "bg-error/15 text-error border-error/30"
                              : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                          {b.listing?.societyName || b.listing?.society || "Housing Society Rooftop"}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-on-surface-variant/70" />
                          <span>{b.listing?.location || "Mumbai MMR Circle"}</span>
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10px] text-outline uppercase block">Offered Tariff</span>
                        <strong className="text-base font-extrabold text-primary">
                          ₹{b.amount?.toFixed(2)} / kWh
                        </strong>
                      </div>
                    </div>

                    {/* Specifications Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-outline block">Array Size</span>
                        <strong className="text-secondary">{b.kwp} kWp</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline block">Model</span>
                        <span className="text-on-surface truncate block">{b.proposalType || "RESCO_LEASE"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline block">Submitted</span>
                        <span className="text-on-surface block">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-xs">
                    <span className="text-[11px] font-mono text-outline flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> SGX Enclave Sealed
                    </span>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          type="button"
                          disabled={withdrawingId === b.id}
                          onClick={() => handleWithdrawBid(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-error/90 hover:text-error hover:bg-error/10 border border-outline-variant/30 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{withdrawingId === b.id ? "Withdrawing..." : "Withdraw Bid"}</span>
                        </button>
                      )}

                      {isAccepted && (
                        <Link
                          href="/vendor/audit"
                          className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Audit Watch Desk (V-10)</span>
                        </Link>
                      )}

                      <Link
                        href={`/vendor/marketplace/${b.listingId}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        Inspect Rooftop
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
