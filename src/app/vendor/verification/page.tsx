"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Upload,
  ExternalLink,
  Award,
  Zap,
} from "lucide-react";

export default function VendorVerificationPage() {
  const [reuploading, setReuploading] = useState(false);

  return (
    <DashboardLayout title="DISCOM & MNRE Empanelment Status">
      <div className="max-w-4xl space-y-6">
        {/* Banner */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> TIER-1 ACTIVE EPC
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Vendor ID: #EPC-9942 (SunPower Tech Pvt Ltd)
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              DISCOM Empanelment & Licensing Credentials
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Your company credentials have been attested by Platform Admin & verified in the SGX enclave.
            </p>
          </div>

          <Link
            href="/dashboard/admin/verification"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            Platform Admin Queue <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Verification Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Valid
                </span>
                <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                  MNRE RTS Phase-II License
                </h3>
                <p className="text-xs text-on-surface-variant">MNRE-MH-2024-9942</p>
              </div>
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 font-mono">
              Expiry: Dec 2028 • Capacity Authorized: Up to 50 MWp
            </div>
          </div>

          <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Grid Interconnection Cleared
                </span>
                <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                  MSEDCL & Adani Circle Clearance
                </h3>
                <p className="text-xs text-on-surface-variant">Circle ID: MMR-DIST-8821</p>
              </div>
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 font-mono">
              Net Metering Certified • Bi-directional Sync Active
            </div>
          </div>

          <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bank Solvency Guaranteed
                </span>
                <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                  HDFC Escrow Solvency Letter
                </h3>
                <p className="text-xs text-on-surface-variant">₹12.50 Crores Working Capital</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-tertiary" />
            </div>
            <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 font-mono">
              Audited by SGX Enclave • Hash: 0x8841...7a9f
            </div>
          </div>

          <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GST & State Tax Current
                </span>
                <h3 className="font-heading font-bold text-sm text-on-surface mt-1">
                  GSTIN Compliance Attestation
                </h3>
                <p className="text-xs text-on-surface-variant">27AAACS1429B1Z8 (Maharashtra)</p>
              </div>
              <FileText className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 font-mono">
              GSTR-3B filings verified through Q3 2026
            </div>
          </div>
        </div>

        {/* Upload Updates */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-sm text-on-surface">
              Need to submit updated solvency or MNRE renewals?
            </h4>
            <p className="text-xs text-on-surface-variant">
              Upload fresh certificates directly to the Platform Admin Verification Enclave.
            </p>
          </div>
          <button
            onClick={() => setReuploading(!reuploading)}
            className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" /> {reuploading ? "Cancel Upload" : "Upload Documents"}
          </button>
        </div>

        {reuploading && (
          <div className="border border-dashed border-primary/50 rounded-xl p-6 text-center bg-surface-container-lowest/50 space-y-2">
            <Upload className="w-8 h-8 mx-auto text-primary" />
            <p className="text-xs text-on-surface font-semibold">Drop renewed certificates or PDF documents here</p>
            <p className="text-[11px] text-on-surface-variant">Supported: PDF, JPG, PNG up to 25MB</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
