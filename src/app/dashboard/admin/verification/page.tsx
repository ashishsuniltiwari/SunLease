"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Building2,
  FileText,
  ExternalLink,
  Download,
  RotateCw,
  Clock,
  MapPin,
  Eye,
  Check,
  X,
  Key,
  Layers,
  Activity,
  FileCheck2,
  UserCheck,
  BadgeCheck,
  Award,
  Filter,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";

interface LiveVendor {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  vendorProfile: {
    id: string;
    companyName: string;
    status: string;
    rejectionReason: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
  } | null;
  vendorDocuments: Array<{
    id: string;
    docType: "PAN" | "GST" | "DISCOM";
    fileKey: string;
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    uploadedAt: string;
  }>;
  _count?: {
    bids: number;
  };
}

export default function AdminVerificationQueuePage() {
  const [vendors, setVendors] = useState<LiveVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED">("ALL");

  // Modals state
  const [inspectedVendor, setInspectedVendor] = useState<LiveVendor | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<LiveVendor | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState(
    "GSTIN filing mismatch with Maharashtra state tax registry"
  );
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [auditReportModalOpen, setAuditReportModalOpen] = useState(false);

  // Fetch live vendor queue from /api/admin/verify
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/verify?status=ALL");
      const data = await res.json();
      if (res.ok && data.vendors) {
        setVendors(data.vendors);
      } else {
        throw new Error(data.error || "Failed to load verification queue");
      }
    } catch (err: any) {
      console.error("fetchVendors error:", err);
      setActionError(err.message || "Failed to fetch verification queue");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setActionSuccess(null);
    setActionError(null);
    fetchVendors();
  };

  // Admin action: APPROVE
  const handleApprove = async (vendorId: string) => {
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      setActionSuccess("Vendor empanelment approved. Full auction bidding privileges granted.");
      if (inspectedVendor?.id === vendorId) {
        setInspectedVendor(null);
      }
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Approval failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Admin action: REJECT (with mandatory reason)
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingVendor) return;

    const reason =
      rejectionReasonInput === "OTHER"
        ? customRejectionReason.trim()
        : rejectionReasonInput.trim();

    if (!reason) {
      setActionError("A formal disqualification reason is strictly required.");
      return;
    }

    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: rejectingVendor.id,
          action: "REJECT",
          rejectionReason: reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disqualification failed");

      setActionSuccess(`Vendor rejected. Disqualification recorded: "${reason}"`);
      setRejectingVendor(null);
      if (inspectedVendor?.id === rejectingVendor.id) {
        setInspectedVendor(null);
      }
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Rejection failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Admin action: SUSPEND
  const handleSuspend = async (vendorId: string) => {
    if (!confirm("Are you sure you want to suspend this vendor? All active bids will be permanently withdrawn from live auctions.")) {
      return;
    }

    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, action: "SUSPEND" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suspension failed");

      setActionSuccess("Vendor account suspended and active bids withdrawn.");
      if (inspectedVendor?.id === vendorId) {
        setInspectedVendor(null);
      }
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Suspension failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Admin action: REACTIVATE
  const handleReactivate = async (vendorId: string) => {
    setIsProcessing(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, action: "REACTIVATE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reactivation failed");

      setActionSuccess("Vendor account restored and reactivated.");
      if (inspectedVendor?.id === vendorId) {
        setInspectedVendor(null);
      }
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Reactivation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics computation
  const pendingCount = vendors.filter((v) => v.status === "PENDING").length;
  const approvedCount = vendors.filter((v) => v.status === "APPROVED").length;
  const rejectedCount = vendors.filter((v) => v.status === "REJECTED").length;
  const suspendedCount = vendors.filter((v) => v.status === "SUSPENDED").length;

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    const company = v.vendorProfile?.companyName || v.name || "";
    const email = v.email || "";
    const phone = v.phone || "";
    const id = v.id || "";

    const matchesSearch =
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Platform Governance & Verification Queue"
      subtitle="State Regulatory Oversight — PM Surya Ghar & DISCOM Empanelment Audit (MMR Circle)"
    >
      <div className="flex flex-col gap-6 relative">
        {/* Subtle Ambient Background Radiance */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[340px] bg-tertiary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-96 right-10 w-[450px] h-[300px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* Action feedback banners */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-mono flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-primary hover:underline">
              ✕
            </button>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-error hover:underline">
              ✕
            </button>
          </div>
        )}

        {/* 1. TOP IDENTITY & CLEARANCE AUTHORITY BAND */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel-l1 p-5 rounded-xl border border-outline-variant/30 shadow-md">
          {/* Identity Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-[10px] text-tertiary uppercase tracking-widest font-semibold">
                Platform Admin • M-01 / M-02
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                Live Database Verification Pipeline Active
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                State Solar Empanelment Clearance Desk
              </h1>
              <span className="font-mono text-xs text-on-surface-variant">
                MEDA &amp; Central DISCOM Regulatory Pipeline
              </span>
            </div>
          </div>

          {/* Quick Action Right Group */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-on-surface-variant leading-none uppercase">
                  Audit Enclave
                </span>
                <span className="font-mono text-xs text-primary font-bold leading-tight">
                  256-BIT • ONLINE
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/admin/directory"
              className="px-3.5 py-2 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Vendor Directory (M-04)</span>
            </Link>

            <button
              onClick={() => setAuditReportModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-secondary" />
              <span>Audit Report</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              type="button"
            >
              <RotateCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* 2. KPI METRICS RIBBON (4 SUMMARY TILES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending Applications */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Pending Verification
              </span>
              <Clock className="w-4 h-4 text-secondary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-secondary tracking-tight">
                {pendingCount}
              </span>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">
                In Review
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Underwriting Queue</span>
              <span className="text-secondary font-medium">Action Required</span>
            </div>
          </div>

          {/* Card 2: Approved EPC Developers */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Approved Developers
              </span>
              <BadgeCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-primary tracking-tight">
                {approvedCount}
              </span>
              <span className="font-mono text-xs text-primary uppercase font-semibold">
                Empanelled
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Marketplace Active</span>
              <span className="text-primary font-medium">Bidding Enabled</span>
            </div>
          </div>

          {/* Card 3: Rejected / Disqualified */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Disqualifications
              </span>
              <XCircle className="w-4 h-4 text-error" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-error tracking-tight">
                {rejectedCount}
              </span>
              <span className="font-mono text-xs text-error uppercase font-semibold">
                Rejected
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Audit Discrepancies</span>
              <span className="text-error font-medium">Re-upload Allowed</span>
            </div>
          </div>

          {/* Card 4: Suspended Accounts */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Suspended EPCs
              </span>
              <ShieldAlert className="w-4 h-4 text-error" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-error tracking-tight">
                {suspendedCount}
              </span>
              <span className="font-mono text-xs text-error uppercase font-semibold">
                Locked
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Bidding Locked</span>
              <span className="text-on-surface-variant font-medium">Bids Cancelled</span>
            </div>
          </div>
        </div>

        {/* 3. FILTER & SEARCH CONTROLS BAR */}
        <div className="p-4 rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-sm flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-7 relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor legal name, email, phone, or vendor ID..."
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/40 placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Granular Filter Selects */}
            <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
              <div className="flex-1">
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/40 focus:outline-none focus:border-tertiary cursor-pointer"
                >
                  <option value="ALL">Status: All Contractors</option>
                  <option value="PENDING">Status: Pending Review Only</option>
                  <option value="APPROVED">Status: Approved Only</option>
                  <option value="REJECTED">Status: Rejected Only</option>
                  <option value="SUSPENDED">Status: Suspended Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Counter */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <p className="text-on-surface-variant">
                Displaying{" "}
                <strong className="text-on-surface font-semibold">
                  {filteredVendors.length} EPC Contractor Dossiers
                </strong>{" "}
                • Live State Verification Queue
              </p>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant/60">
              Live DB Synced
            </span>
          </div>
        </div>

        {/* 4. MAIN DATA TABLE: VENDOR APPLICATIONS QUEUE */}
        <div className="rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant font-mono text-xs">
              <RotateCw className="w-6 h-6 animate-spin text-tertiary" />
              <span>Querying Platform Verification Queue...</span>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant font-mono text-xs">
              No vendor applications matching the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-container font-mono text-[11px] text-outline uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="p-3.5">Company &amp; Contact</th>
                    <th className="p-3.5">Compliance Docs</th>
                    <th className="p-3.5">Auction Activity</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Clearance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {filteredVendors.map((vendor) => {
                    const company =
                      vendor.vendorProfile?.companyName || vendor.name || "EPC Contractor";
                    const panDoc = vendor.vendorDocuments.find((d) => d.docType === "PAN");
                    const gstDoc = vendor.vendorDocuments.find((d) => d.docType === "GST");
                    const discomDoc = vendor.vendorDocuments.find((d) => d.docType === "DISCOM");

                    return (
                      <tr
                        key={vendor.id}
                        className="hover:bg-surface-container-high/40 transition-colors"
                      >
                        {/* Col 1: Company & Contact */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-heading font-bold text-sm text-on-surface">
                              {company}
                            </span>
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span className="text-tertiary font-semibold">{vendor.id}</span>
                              <span className="text-outline-variant">•</span>
                              <span className="text-on-surface-variant">{vendor.email}</span>
                              {vendor.phone && (
                                <>
                                  <span className="text-outline-variant">•</span>
                                  <span className="text-on-surface-variant">{vendor.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Col 2: Compliance Docs (PAN, GST, DISCOM) */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                                panDoc
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-error/10 text-error border-error/30"
                              }`}
                              title={panDoc?.fileName || "PAN Missing"}
                            >
                              PAN {panDoc ? "✓" : "✗"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                                gstDoc
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-error/10 text-error border-error/30"
                              }`}
                              title={gstDoc?.fileName || "GST Missing"}
                            >
                              GST {gstDoc ? "✓" : "✗"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                                discomDoc
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-error/10 text-error border-error/30"
                              }`}
                              title={discomDoc?.fileName || "DISCOM Missing"}
                            >
                              DISCOM {discomDoc ? "✓" : "✗"}
                            </span>
                          </div>
                        </td>

                        {/* Col 3: Auction Activity */}
                        <td className="p-3.5 font-mono">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-on-surface font-semibold">
                              {vendor._count?.bids || 0} Bids Placed
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              Blind Enclave Isolation
                            </span>
                          </div>
                        </td>

                        {/* Col 4: Registered */}
                        <td className="p-3.5 font-mono text-xs text-on-surface-variant">
                          {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Col 5: Status */}
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                              vendor.status === "APPROVED"
                                ? "bg-primary/10 text-primary border-primary/30"
                                : vendor.status === "REJECTED"
                                ? "bg-error/10 text-error border-error/30"
                                : vendor.status === "SUSPENDED"
                                ? "bg-error/20 text-error border-error/40"
                                : "bg-secondary/15 text-secondary border-secondary/30"
                            }`}
                          >
                            {vendor.status === "APPROVED" && <Check className="w-3 h-3" />}
                            {vendor.status === "REJECTED" && <X className="w-3 h-3" />}
                            {vendor.status === "SUSPENDED" && <ShieldAlert className="w-3 h-3" />}
                            {vendor.status === "PENDING" && <Clock className="w-3 h-3" />}
                            <span>{vendor.status}</span>
                          </span>
                        </td>

                        {/* Col 6: Clearance Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Dossier (M-02) */}
                            <button
                              onClick={() => setInspectedVendor(vendor)}
                              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
                              title="Inspect Full Dossier (M-02)"
                              type="button"
                            >
                              <Eye className="w-3.5 h-3.5 text-tertiary" />
                            </button>

                            {vendor.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(vendor.id)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on font-heading font-bold text-xs flex items-center gap-1 shadow-glow hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                                  type="button"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  onClick={() => setRejectingVendor(vendor)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error font-heading font-semibold text-xs flex items-center gap-1 border border-error/30 transition-all cursor-pointer disabled:opacity-50"
                                  type="button"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {vendor.status === "APPROVED" && (
                              <button
                                onClick={() => handleSuspend(vendor.id)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-error/20 text-error border border-error/30 font-heading font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                title="Suspend Vendor & Withdraw Active Bids"
                                type="button"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </button>
                            )}

                            {vendor.status === "SUSPENDED" && (
                              <button
                                onClick={() => handleReactivate(vendor.id)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-heading font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                type="button"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </button>
                            )}

                            {vendor.status === "REJECTED" && (
                              <button
                                onClick={() => handleApprove(vendor.id)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary/20 text-on-surface border border-outline-variant/30 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                type="button"
                              >
                                <span>Re-evaluate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INSPECT VENDOR DOSSIER (M-02) */}
      {/* ========================================================================= */}
      {inspectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-tertiary" />
                <div className="flex flex-col">
                  <h3 className="font-heading font-bold text-lg text-on-surface">
                    {inspectedVendor.vendorProfile?.companyName || inspectedVendor.name || "EPC Contractor"}
                  </h3>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Vendor ID: {inspectedVendor.id} • Registered: {inspectedVendor.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedVendor(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Profile Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">Contractor Status</span>
                <span className="text-on-surface font-bold uppercase">{inspectedVendor.status}</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">Contact Phone</span>
                <span className="text-on-surface font-bold">{inspectedVendor.phone || "Not Provided"}</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">Submitted Documents</span>
                <span className="text-primary font-bold">
                  {inspectedVendor.vendorDocuments.length} of 3 Files
                </span>
              </div>
            </div>

            {/* M-02 Dedicated Document Viewer */}
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <span className="font-mono text-[10px] text-outline uppercase font-semibold">
                  Statutory Compliance Documents (State DISCOM Protocol):
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  {inspectedVendor.vendorDocuments.length} Uploaded
                </span>
              </div>

              {/* Document 1: PAN Card */}
              {(() => {
                const doc = inspectedVendor.vendorDocuments.find((d) => d.docType === "PAN");
                return (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 ${doc ? "text-primary" : "text-error"}`} />
                      <div className="flex flex-col">
                        <strong className="text-on-surface text-xs">1. Company PAN Card</strong>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {doc?.fileName || "Government issued corporate PAN certificate"}
                        </span>
                      </div>
                    </div>
                    <div>
                      {doc ? (
                        <a
                          href={doc.fileKey}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                        >
                          <span>View PAN</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/30 text-[10px] font-mono font-bold">
                          Missing / Not Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Document 2: GST Registration */}
              {(() => {
                const doc = inspectedVendor.vendorDocuments.find((d) => d.docType === "GST");
                return (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 ${doc ? "text-primary" : "text-error"}`} />
                      <div className="flex flex-col">
                        <strong className="text-on-surface text-xs">2. GST Registration Certificate</strong>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {doc?.fileName || "Form GST REG-06 registration certificate"}
                        </span>
                      </div>
                    </div>
                    <div>
                      {doc ? (
                        <a
                          href={doc.fileKey}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                        >
                          <span>View GST</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/30 text-[10px] font-mono font-bold">
                          Missing / Not Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Document 3: DISCOM Empanelment */}
              {(() => {
                const doc = inspectedVendor.vendorDocuments.find((d) => d.docType === "DISCOM");
                return (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 ${doc ? "text-primary" : "text-error"}`} />
                      <div className="flex flex-col">
                        <strong className="text-on-surface text-xs">3. DISCOM Empanelment Order</strong>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {doc?.fileName || "State DISCOM rooftop net-metering empanelment order"}
                        </span>
                      </div>
                    </div>
                    <div>
                      {doc ? (
                        <a
                          href={doc.fileKey}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                        >
                          <span>View Empanelment</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/30 text-[10px] font-mono font-bold">
                          Missing / Not Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Rejection Log Notice if rejected */}
            {inspectedVendor.vendorProfile?.rejectionReason && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-xs text-error font-mono">
                <strong>Disqualification Audit Log:</strong>{" "}
                {inspectedVendor.vendorProfile.rejectionReason}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center gap-2 pt-2 text-xs">
              <div>
                {inspectedVendor.status === "APPROVED" && (
                  <button
                    onClick={() => handleSuspend(inspectedVendor.id)}
                    className="px-3 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 font-semibold"
                  >
                    Suspend Contractor
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedVendor(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-semibold"
                >
                  Close Dossier
                </button>

                {inspectedVendor.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        const target = inspectedVendor;
                        setRejectingVendor(target);
                      }}
                      className="px-4 py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error font-semibold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Application</span>
                    </button>
                    <button
                      onClick={() => handleApprove(inspectedVendor.id)}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed-dim text-primary-on font-bold flex items-center gap-1 shadow-glow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Empanelment</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT REASON MODAL (Mandatory Reason Requirement) */}
      {/* ========================================================================= */}
      {rejectingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base text-on-surface">
                  Decline Vendor Application
                </h3>
              </div>
              <button
                onClick={() => setRejectingVendor(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="flex flex-col gap-3 text-xs">
              <p className="text-on-surface-variant">
                Select or specify the regulatory reason for rejecting{" "}
                <strong className="text-on-surface">
                  {rejectingVendor.vendorProfile?.companyName || rejectingVendor.name || rejectingVendor.email}
                </strong>
                . This audit notice is permanently recorded in the database.
              </p>

              <div>
                <label className="font-mono text-[10px] text-on-surface-variant uppercase block mb-1">
                  Reason for Rejection
                </label>
                <select
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-error text-xs"
                >
                  <option value="GSTIN filing mismatch with Maharashtra state tax registry">
                    GSTIN filing mismatch with Maharashtra state tax registry
                  </option>
                  <option value="Expired MNRE PM Surya Ghar Empanelment License">
                    Expired MNRE PM Surya Ghar Empanelment License
                  </option>
                  <option value="Missing or illegible DISCOM Empanelment Letter">
                    Missing or illegible DISCOM Empanelment Letter
                  </option>
                  <option value="Blacklisted or flagged by state DISCOM compliance board">
                    Blacklisted or flagged by state DISCOM compliance board
                  </option>
                  <option value="Incomplete compliance dossier: statutory documents missing">
                    Incomplete compliance dossier: statutory documents missing
                  </option>
                  <option value="OTHER">Other / Custom Reason...</option>
                </select>
              </div>

              {rejectionReasonInput === "OTHER" && (
                <div>
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase block mb-1">
                    Custom Audit Notice (Required)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    placeholder="Enter explicit statutory audit reason for rejection..."
                    className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-error text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingVendor(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-error text-background font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Disqualification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AUDIT CLEARANCE REPORT */}
      {auditReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-bold text-base text-on-surface">
                  State Regulatory Audit Dossier
                </h3>
              </div>
              <button
                onClick={() => setAuditReportModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-xs font-mono flex flex-col gap-2.5">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Regulatory Body:</span>
                <strong className="text-on-surface">Maharashtra Energy Dev. Agency (MEDA)</strong>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Active Empanelled EPCs:</span>
                <strong className="text-primary">{approvedCount} Tier-1 Developers</strong>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Pending Turnaround SLA:</span>
                <strong className="text-secondary">98.7% Within 24 Hours</strong>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] text-outline uppercase">State Blockchain Anchor Hash:</span>
                <span className="p-2 bg-surface-container rounded text-[10px] text-tertiary break-all border border-outline-variant/20">
                  0x4a91fbc8201de398a120c94821a840e791b01c38fa298104ec8301729bca1942
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setAuditReportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
