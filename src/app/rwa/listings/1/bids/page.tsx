"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function RwaBlindBidsPage() {
  const [unsealed, setUnsealed] = useState(false);

  return (
    <DashboardLayout title="Encrypted Blind Bids - Listing #RT-4029">
      <div className="space-y-6">
        {/* Enclave Status Header */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                BLIND AUCTION ENCLAVE
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-secondary" /> Anti-Collusion Protocol Active
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Palm Meadows CHS — 120 kWp Rooftop Lease
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              3 verified Tier-1 EPC bids received. Prices are cryptographically sealed in Intel SGX hardware.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setUnsealed(!unsealed)}
              className="px-3.5 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Key className="w-3.5 h-3.5" /> {unsealed ? "Re-seal Enclave" : "Simulate Enclave Reveal"}
            </button>
            <Link
              href="/dashboard/rwa"
              className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all"
            >
              Back to Overview
            </Link>
          </div>
        </div>

        {/* Auction Timer / State Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase block">Enclave Window</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-lg font-mono font-bold text-on-surface">04h : 22m : 18s</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Reveals Nov 17, 2026 12:00 IST</span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase block">Received Bids</span>
            <div className="flex items-center gap-2 mt-1">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <span className="text-lg font-mono font-bold text-primary">3 Sealed Bids</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">All Tier-1 MNRE empanelled</span>
          </div>

          <div className="glass-panel-l1 rounded-xl p-4 border border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase block">Reserve Lease Floor</span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-tertiary" />
              <span className="text-lg font-mono font-bold text-on-surface">₹2.80 / kWh</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Guaranteed minimum payment</span>
          </div>
        </div>

        {/* Bids Table */}
        <div className="glass-panel-l1 rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-on-surface">
              Sealed Contractor Bids ({unsealed ? "Revealed" : "Encrypted State"})
            </h3>
            <span className="text-[11px] font-mono text-primary flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Hardware SGX Verified
            </span>
          </div>

          <div className="divide-y divide-outline-variant/20 text-xs">
            {/* Bid 1 */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-container-high/30 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface font-mono">#BID-9941</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                    Tier-1 Empanelled
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Apex CleanEnergy MMR</span>
                </div>
                <div className="text-[11px] font-mono text-on-surface-variant mt-1">
                  Commitment Hash: <code className="text-on-surface">0x4a9f...e81c</code> • Timestamp: 14:22 IST
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Lease Offer</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {unsealed ? "₹3.45 / kWh" : "•••••••• (Encrypted)"}
                  </span>
                </div>
                {unsealed && (
                  <button className="px-3 py-1.5 rounded bg-primary text-primary-on text-xs font-semibold hover:bg-primary/90">
                    Accept Bid
                  </button>
                )}
              </div>
            </div>

            {/* Bid 2 */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-container-high/30 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface font-mono">#BID-9942</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                    Tier-1 Empanelled
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Soltech Bharat Renewables</span>
                </div>
                <div className="text-[11px] font-mono text-on-surface-variant mt-1">
                  Commitment Hash: <code className="text-on-surface">0x7c2b...3f90</code> • Timestamp: 15:08 IST
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Lease Offer</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {unsealed ? "₹3.30 / kWh" : "•••••••• (Encrypted)"}
                  </span>
                </div>
                {unsealed && (
                  <button className="px-3 py-1.5 rounded bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">
                    Review
                  </button>
                )}
              </div>
            </div>

            {/* Bid 3 */}
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-container-high/30 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface font-mono">#BID-9943</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                    Tier-2 Empanelled
                  </span>
                  <span className="text-[11px] text-on-surface-variant">SunPower Tech Pvt Ltd</span>
                </div>
                <div className="text-[11px] font-mono text-on-surface-variant mt-1">
                  Commitment Hash: <code className="text-on-surface">0x18d3...aa71</code> • Timestamp: 16:40 IST
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Lease Offer</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {unsealed ? "₹3.20 / kWh" : "•••••••• (Encrypted)"}
                  </span>
                </div>
                {unsealed && (
                  <button className="px-3 py-1.5 rounded bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">
                    Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
