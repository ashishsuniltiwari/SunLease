"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  MapPin,
  Zap,
  Award,
  Filter,
  UserCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface EmpanelledVendor {
  id: string;
  name: string;
  tradingName: string;
  tier: "Tier-1 Empanelled" | "Tier-2 Empanelled";
  circle: string;
  city: string;
  installedCapacityMwp: number;
  activeSites: number;
  clearanceHash: string;
  enclaveApprovedDate: string;
  mnreLicense: string;
  solvencyCr: number;
  rating: number;
}

const MOCK_VENDORS: EmpanelledVendor[] = [
  {
    id: "EPC-9942",
    name: "SunPower Tech Pvt Ltd",
    tradingName: "SunPower MMR Grid Desk",
    tier: "Tier-1 Empanelled",
    circle: "MSEDCL - Mumbai Metropolitan",
    city: "Mumbai, MH",
    installedCapacityMwp: 14.8,
    activeSites: 18,
    clearanceHash: "0x7a8f9b...3c21",
    enclaveApprovedDate: "2026-09-12",
    mnreLicense: "MNRE-MH-2024-8841",
    solvencyCr: 12.5,
    rating: 4.9,
  },
  {
    id: "EPC-8841",
    name: "Apex CleanEnergy Infrastructure LLP",
    tradingName: "Apex Solar MMR",
    tier: "Tier-1 Empanelled",
    circle: "MSEDCL - Thane Circle",
    city: "Thane, MH",
    installedCapacityMwp: 8.4,
    activeSites: 12,
    clearanceHash: "0x3e4f1a...9b82",
    enclaveApprovedDate: "2026-10-04",
    mnreLicense: "MNRE-MH-2024-8841",
    solvencyCr: 8.5,
    rating: 4.8,
  },
  {
    id: "EPC-7719",
    name: "Soltech Bharat Renewables Ltd",
    tradingName: "Soltech Commercial Fleet",
    tier: "Tier-1 Empanelled",
    circle: "Adani Electricity - Suburban Mumbai",
    city: "Navi Mumbai, MH",
    installedCapacityMwp: 19.2,
    activeSites: 24,
    clearanceHash: "0x91c4d2...5e70",
    enclaveApprovedDate: "2026-08-20",
    mnreLicense: "MNRE-MH-2023-7719",
    solvencyCr: 15.0,
    rating: 4.95,
  },
  {
    id: "EPC-6502",
    name: "SuryaUrja Infra Projects",
    tradingName: "SuryaUrja Sol",
    tier: "Tier-2 Empanelled",
    circle: "MSEDCL - Pune Rural & Urban",
    city: "Pune, MH",
    installedCapacityMwp: 4.2,
    activeSites: 7,
    clearanceHash: "0x11b5e3...8a4f",
    enclaveApprovedDate: "2026-11-01",
    mnreLicense: "MNRE-MH-2024-6502",
    solvencyCr: 3.2,
    rating: 4.6,
  },
];

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [filterCircle, setFilterCircle] = useState("All");

  const filteredVendors = MOCK_VENDORS.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchesCircle = filterCircle === "All" || v.circle.includes(filterCircle);
    return matchesSearch && matchesCircle;
  });

  return (
    <DashboardLayout title="Empanelled EPC Vendor Directory">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-tertiary/10 text-tertiary border border-tertiary/30">
                GOVERNANCE DIRECTORY
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> 42 Empanelled EPCs State-Wide
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Empanelled Solar EPC Vendor Directory
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Verified Tier-1 & Tier-2 engineering contractors holding active MNRE state licenses and SGX clearance hashes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/dashboard/admin/verification"
              className="px-3.5 py-2 rounded-lg bg-tertiary text-tertiary-on text-xs font-semibold hover:bg-tertiary/90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Verification Queue
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder="Search vendor name, EPC ID, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={filterCircle}
              onChange={(e) => setFilterCircle(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary/60"
            >
              <option value="All">All DISCOM Circles</option>
              <option value="MSEDCL">MSEDCL</option>
              <option value="Adani">Adani Electricity</option>
            </select>
          </div>
        </div>

        {/* Grid of Vendors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 hover:border-tertiary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold border border-outline-variant/40">
                        {vendor.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {vendor.tier}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-on-surface">{vendor.name}</h3>
                    <p className="text-[11px] text-on-surface-variant">{vendor.tradingName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-secondary">★ {vendor.rating}</span>
                    <p className="text-[10px] text-on-surface-variant">Audit Rating</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase block">Installed Fleet</span>
                    <span className="font-bold text-on-surface font-mono">{vendor.installedCapacityMwp} MWp</span>
                    <span className="text-[10px] text-on-surface-variant block">across {vendor.activeSites} live sites</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase block">Solvency Clearance</span>
                    <span className="font-bold text-primary font-mono">₹{vendor.solvencyCr} Cr</span>
                    <span className="text-[10px] text-on-surface-variant block">Bank guaranteed</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-on-surface-variant mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-on-surface-variant/70 shrink-0" />
                    <span>{vendor.circle} ({vendor.city})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-secondary shrink-0" />
                    <span>MNRE License: <code className="font-mono text-on-surface">{vendor.mnreLicense}</code></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-[10px] font-mono text-on-surface-variant">
                  <span>Enclave Hash:</span>
                  <code className="text-primary">{vendor.clearanceHash}</code>
                </div>
                <Link
                  href="/dashboard/admin/verification"
                  className="text-tertiary hover:underline font-medium flex items-center gap-1"
                >
                  View Enclave Dossier <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
