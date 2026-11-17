"use client";

import React, { useState, useRef } from "react";
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
  RotateCw,
  Check,
  AlertCircle,
} from "lucide-react";

export default function VendorVerificationPage() {
  const [reuploading, setReuploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    filename: string;
    url: string;
    originalName: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedFile({
        filename: data.filename,
        url: data.url,
        originalName: data.originalName,
      });
      setUploadSuccess(`Certificate "${data.originalName}" uploaded and saved to enclave!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

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
              DISCOM Empanelment &amp; Licensing Credentials
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Your company credentials have been attested by Platform Admin &amp; verified in the SGX enclave.
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
                  MSEDCL &amp; Adani Circle Clearance
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> GST &amp; State Tax Current
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
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-heading font-bold text-sm text-on-surface">
              Need to submit updated solvency or MNRE renewals?
            </h4>
            <p className="text-xs text-on-surface-variant">
              Upload fresh certificates directly to the Platform Admin Verification Enclave via /api/upload.
            </p>
            {uploadedFile && (
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
              >
                <Check className="w-3.5 h-3.5" /> Latest file: {uploadedFile.originalName}
              </a>
            )}
            {uploadSuccess && (
              <p className="text-xs font-mono text-primary mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {uploadSuccess}
              </p>
            )}
            {uploadError && (
              <p className="text-xs font-mono text-error mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploading ? "Uploading..." : "Upload Certificate"}</span>
            </button>
            <button
              onClick={() => setReuploading(!reuploading)}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest flex items-center gap-1.5 shrink-0"
            >
              {reuploading ? "Close Dropzone" : "Open Dropzone"}
            </button>
          </div>
        </div>

        {reuploading && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/50 hover:border-primary rounded-xl p-8 text-center bg-surface-container-lowest/50 space-y-2 cursor-pointer transition-all"
          >
            <Upload className="w-8 h-8 mx-auto text-primary" />
            <p className="text-xs text-on-surface font-semibold">
              Click to select or drop renewed MNRE certificates or PDF documents here
            </p>
            <p className="text-[11px] text-on-surface-variant font-mono">
              Supported: PDF, JPG, PNG up to 25MB • Automatically sent to /api/upload
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
