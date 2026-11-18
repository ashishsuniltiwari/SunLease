"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  RefreshCw,
  ArrowRight,
  XCircle,
  Store,
} from "lucide-react";

export default function VendorVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("UNSUBMITTED");
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Form State for V-02 (Upload Documents)
  const [companyName, setCompanyName] = useState("");
  const [panFile, setPanFile] = useState<{ name: string; url: string } | null>(null);
  const [gstFile, setGstFile] = useState<{ name: string; url: string } | null>(null);
  const [discomFile, setDiscomFile] = useState<{ name: string; url: string } | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [submittingDossier, setSubmittingDossier] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vendor/verification");
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status || "UNSUBMITTED");
        setProfile(data.profile);
        setDocuments(data.documents || []);
        setRejectionReason(data.rejectionReason);
        if (data.profile?.companyName) {
          setCompanyName(data.profile.companyName);
        }
      }
    } catch (err) {
      console.error("Fetch verification status error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Upload a specific document via /api/upload
  const handleUploadFile = async (
    docType: "PAN" | "GST" | "DISCOM",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docType);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed");
      }

      const fileData = { name: data.originalName, url: data.url };
      if (docType === "PAN") setPanFile(fileData);
      else if (docType === "GST") setGstFile(fileData);
      else if (docType === "DISCOM") setDiscomFile(fileData);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file");
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = "";
    }
  };

  // Submit complete 3-document dossier
  const handleSubmitDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panFile || !gstFile || !discomFile) {
      setErrorMsg("Please upload all 3 mandatory compliance documents (PAN, GST, and DISCOM Letter).");
      return;
    }

    setSubmittingDossier(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/vendor/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          panUrl: panFile.url,
          gstUrl: gstFile.url,
          discomUrl: discomFile.url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit dossier");
      }

      await fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit verification dossier");
    } finally {
      setSubmittingDossier(false);
    }
  };

  // V-04 Upload Again Action
  const handleResetForReupload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/verification", { method: "PATCH" });
      if (res.ok) {
        setPanFile(null);
        setGstFile(null);
        setDiscomFile(null);
        await fetchStatus();
      }
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="DISCOM & MNRE Empanelment Desk">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-secondary" />
          <span>Checking DISCOM licensing status and SGX compliance dossier...</span>
        </div>
      </DashboardLayout>
    );
  }

  const upperStatus = status.toUpperCase();

  return (
    <DashboardLayout title="DISCOM & MNRE Empanelment Desk">
      <div className="max-w-4xl space-y-6">
        {/* Top Protocol Header */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                VENDOR COMPLIANCE GATE
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                upperStatus === "APPROVED"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : upperStatus === "PENDING"
                  ? "bg-secondary/15 text-secondary border-secondary/30"
                  : upperStatus === "REJECTED"
                  ? "bg-error/15 text-error border-error/30"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
              }`}>
                {upperStatus}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              DISCOM Empanelment &amp; Licensing Credentials
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Statutory verification required to participate in sealed residential blind bidding rounds.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {upperStatus === "APPROVED" && (
              <Link
                href="/dashboard/vendor"
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Go to Marketplace</span>
              </Link>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 1: V-04 (APPLICATION REJECTED SCREEN) */}
        {/* ========================================================================= */}
        {upperStatus === "REJECTED" && (
          <div className="glass-panel-l1 rounded-2xl p-8 border border-error/40 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-error tracking-wider">
                  V-04 · Verification Decision
                </span>
                <h2 className="text-xl font-heading font-bold text-on-surface">
                  Empanelment Application Rejected
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your contractor compliance dossier was reviewed by Platform Administration and did not meet empanelment requirements.
                </p>
              </div>
            </div>

            {/* Mandatory Rejection Reason Callout */}
            <div className="p-4 rounded-xl bg-error/10 border border-error/30 space-y-1.5">
              <span className="font-mono text-[11px] text-error font-bold uppercase block">
                Official Administrative Rejection Reason:
              </span>
              <p className="text-xs text-on-surface font-sans font-medium">
                &ldquo;{rejectionReason || "DISCOM empanelment license expired or GSTIN mismatch with registered company entity."}&rdquo;
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">
                You may correct the deficiencies and resubmit updated certificates.
              </span>
              <button
                onClick={handleResetForReupload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-glow cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Again &amp; Resubmit Dossier</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: V-03 (PENDING REVIEW SCREEN) */}
        {/* ========================================================================= */}
        {upperStatus === "PENDING" && (
          <div className="glass-panel-l1 rounded-2xl p-8 border border-secondary/40 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-secondary tracking-wider">
                  V-03 · Under Review
                </span>
                <h2 className="text-xl font-heading font-bold text-on-surface">
                  Compliance Dossier Awaiting Platform Review
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your 3 statutory documents have been encrypted and submitted to the Platform Admin Verification Desk.
                </p>
              </div>
            </div>

            {/* Submitted Docs Preview */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-heading font-bold text-on-surface block">
                Submitted Verification Documents:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {documents.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-secondary" />
                      <span className="font-bold text-on-surface">{d.docType || d.type} Certificate</span>
                    </div>
                    {d.fileKey || d.fileUrl ? (
                      <a
                        href={d.fileKey || d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-secondary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-secondary font-semibold">Under Review</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <strong className="text-on-surface block">Estimated Turnaround: 24 to 48 Hours</strong>
                <span className="text-on-surface-variant">Our compliance officers are verifying your credentials with the state DISCOM registry.</span>
              </div>
              <Link href="/contact" className="text-secondary hover:underline font-semibold shrink-0">
                Contact Verification Officer &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: APPROVED SCREEN */}
        {/* ========================================================================= */}
        {upperStatus === "APPROVED" && (
          <div className="glass-panel-l1 rounded-2xl p-8 border border-primary/40 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                  Empanelled EPC Developer
                </span>
                <h2 className="text-xl font-heading font-bold text-on-surface">
                  Full Auction Bidding Clearance Granted
                </h2>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your credentials and DISCOM net-metering clearances have been attested by Platform Admin. You have unrestricted access to submit sealed blind bids.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono p-4 rounded-xl bg-surface-container border border-outline-variant/20">
              <div>
                <span className="text-[10px] text-outline uppercase block">Tier Classification</span>
                <strong className="text-primary text-sm block mt-0.5">Tier-1 Commercial EPC</strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Attestation Status</span>
                <strong className="text-on-surface text-sm block mt-0.5">SGX Enclave Verified</strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Marketplace Status</span>
                <strong className="text-primary text-sm block mt-0.5">Active Bidding Enabled</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link
                href="/dashboard/vendor"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
              >
                <span>Browse Live Society Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 4: V-02 (UPLOAD 3 DEDICATED DOCUMENTS FORM) */}
        {/* ========================================================================= */}
        {upperStatus === "UNSUBMITTED" && (
          <form onSubmit={handleSubmitDossier} className="glass-panel-l1 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-secondary font-bold uppercase">
                V-02 · Compliance Submission
              </span>
              <h2 className="text-xl font-heading font-bold text-on-surface mt-1">
                Submit 3 Mandatory Compliance Documents
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                All 3 documents must be submitted in PDF or JPG format before your account is cleared for blind bidding.
              </p>
            </div>

            {/* Company Legal Name */}
            <div>
              <label className="block text-on-surface-variant font-mono uppercase mb-1.5 font-semibold text-xs">
                Company Registered Legal Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SolarGrid Clean Energy Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-secondary font-sans"
                />
              </div>
            </div>

            {/* 3 Dedicated Upload Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Doc 1: PAN Card */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-on-surface font-semibold">1. Company PAN Card</strong>
                    {panFile && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Government issued Corporate PAN certificate.
                  </p>
                </div>
                <label className="w-full py-2 px-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-center text-xs font-mono font-semibold cursor-pointer hover:bg-surface-container-highest transition-colors block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUploadFile("PAN", e)}
                    className="hidden"
                  />
                  {uploadingDoc === "PAN" ? "Uploading..." : panFile ? `✓ ${panFile.name.slice(0, 16)}...` : "Select PAN File"}
                </label>
              </div>

              {/* Doc 2: GST Registration */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-on-surface font-semibold">2. GST Certificate</strong>
                    {gstFile && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Form GST REG-06 registration certificate.
                  </p>
                </div>
                <label className="w-full py-2 px-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-center text-xs font-mono font-semibold cursor-pointer hover:bg-surface-container-highest transition-colors block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUploadFile("GST", e)}
                    className="hidden"
                  />
                  {uploadingDoc === "GST" ? "Uploading..." : gstFile ? `✓ ${gstFile.name.slice(0, 16)}...` : "Select GST File"}
                </label>
              </div>

              {/* Doc 3: DISCOM Empanelment Letter */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-on-surface font-semibold">3. DISCOM Empanelment</strong>
                    {discomFile && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Valid MSEDCL / Adani / Tata Power letter.
                  </p>
                </div>
                <label className="w-full py-2 px-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-center text-xs font-mono font-semibold cursor-pointer hover:bg-surface-container-highest transition-colors block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUploadFile("DISCOM", e)}
                    className="hidden"
                  />
                  {uploadingDoc === "DISCOM" ? "Uploading..." : discomFile ? `✓ ${discomFile.name.slice(0, 16)}...` : "Select DISCOM Letter"}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>Encrypted into SGX enclave for admin verification.</span>
              </div>
              <button
                type="submit"
                disabled={submittingDossier || !panFile || !gstFile || !discomFile || !companyName.trim()}
                className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submittingDossier ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Dossier...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Dossier for Review</span>
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
