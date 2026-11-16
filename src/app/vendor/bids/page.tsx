"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function VendorBidsPage() {
  const [bids] = useState([
    {
      id: "BID-8841",
      listingId: "RT-4029",
      society: "Palm Meadows CHS",
      location: "Kandivali West, Mumbai",
      capacityKwp: 120,
      myBidOffer: "₹3.35 / kWh",
      enclaveStatus: "Sealed in Enclave",
      revealTime: "Nov 17, 2026 12:00 IST",
      commitmentHash: "0x7f8a9b...11c2",
    },
    {
      id: "BID-8839",
      listingId: "RT-4018",
      society: "Green Heights CHS",
      location: "Thane West, MMR",
      capacityKwp: 90,
      myBidOffer: "₹3.42 / kWh",
      enclaveStatus: "Auction Won (Contract Awarded)",
      revealTime: "Completed",
      commitmentHash: "0x3e1d4c...99a0",
    },
    {
      id: "BID-8820",
      listingId: "RT-3990",
      society: "Sea Breeze Towers",
      location: "Worli, Mumbai",
      capacityKwp: 160,
      myBidOffer: "₹3.20 / kWh",
      enclaveStatus: "Outbid by Lower Tariff",
      revealTime: "Closed",
      commitmentHash: "0x88f2b1...33d4",
    },
  ]);

  return (
    <DashboardLayout title="My Submitted Bids & Active Auctions">
      <div className="space-y-6">
        {/* Banner */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                EPC BIDDING TERMINAL
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-secondary" /> Intel SGX Enclave Sealed
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Submitted Blind Auction Bids
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Track your firm tariff commitments across housing society rooftop leasing auctions.
            </p>
          </div>

          <Link
            href="/dashboard/vendor"
            className="px-3.5 py-2 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 self-start md:self-auto shadow-sm"
          >
            Explore Live Rooftops
          </Link>
        </div>

        {/* Bids Table */}
        <div className="glass-panel-l1 rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-on-surface">
              Active & Historic Auction Bids
            </h3>
            <span className="text-[11px] font-mono text-on-surface-variant">3 Total Filings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low/80 text-[10px] font-mono text-on-surface-variant uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="p-3.5">Bid ID / Society</th>
                  <th className="p-3.5">Capacity</th>
                  <th className="p-3.5">My Quoted Tariff</th>
                  <th className="p-3.5">Enclave State</th>
                  <th className="p-3.5">Commitment Hash</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {bids.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-on-surface">{b.society}</div>
                      <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {b.listingId} • {b.location}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-on-surface">
                      <div className="flex items-center gap-1 font-bold">
                        <Zap className="w-3.5 h-3.5 text-secondary" /> {b.capacityKwp} kWp
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-primary">
                      {b.myBidOffer}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          b.enclaveStatus.includes("Sealed")
                            ? "bg-secondary/10 text-secondary border-secondary/30"
                            : b.enclaveStatus.includes("Won")
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                        }`}
                      >
                        {b.enclaveStatus}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-on-surface-variant">
                      <code>{b.commitmentHash}</code>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href="/dashboard/vendor"
                        className="text-secondary hover:underline font-medium inline-flex items-center gap-1 text-[11px]"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
