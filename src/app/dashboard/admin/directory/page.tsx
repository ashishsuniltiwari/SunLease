"use client";

import React, { useState, useEffect } from "react";
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
  RotateCw,
  Check,
  X,
  FileText,
  Clock,
  AlertTriangle,
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

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<LiveVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/verify?status=ALL");
      const data = await res.json();
      if (res.ok && data.vendors) {
        setVendors(data.vendors);
      } else {
        throw new Error(data.error || "Failed to load vendor directory");
      }
    } catch (err: any) {
      console.error("fetchVendors error:", err);
      setActionError(err.message || "Failed to load directory");
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

  // Functional Suspend Action: Locks marketplace access & cancels pending bids
  const handleSuspend = async (vendorId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to suspend "${companyName}"? All active bids in live auctions will be automatically withdrawn.`)) {
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

      setActionSuccess(`Vendor "${companyName}" suspended. Bidding privileges revoked and pending bids withdrawn.`);
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Failed to suspend vendor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Functional Reactivate Action: Restores marketplace access
  const handleReactivate = async (vendorId: string, companyName: string) => {
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

      setActionSuccess(`Vendor "${companyName}" reactivated. Empanelled bidding status restored.`);
      await fetchVendors();
    } catch (err: any) {
      setActionError(err.message || "Failed to reactivate vendor");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const company = v.vendorProfile?.companyName || v.name || "";
    const email = v.email || "";
    const id = v.id || "";

    const matchesSearch =
      company.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Empanelled EPC Vendor Directory">
      <div className="space-y-6">
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

        {/* Top Header Card */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-tertiary/10 text-tertiary border border-tertiary/30">
                GOVERNANCE DIRECTORY • M-04
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> Live Database Synced
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Empanelled Solar EPC Vendor Directory
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Verified engineering contractors holding state DISCOM compliance status. Manage empanelment clearance and administrative account suspension.
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

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              type="button"
            >
              <RotateCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder="Search company name, email, vendor ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-tertiary/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary/60 cursor-pointer"
            >
              <option value="ALL">All Contractor Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="SUSPENDED">Suspended Only</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Grid of Vendors */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant font-mono text-xs">
            <RotateCw className="w-6 h-6 animate-spin text-tertiary" />
            <span>Loading contractor directory from database...</span>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-mono text-xs glass-panel-l1 rounded-xl border border-outline-variant/20">
            No registered vendors found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => {
              const companyName =
                vendor.vendorProfile?.companyName || vendor.name || "EPC Contractor";
              const panDoc = vendor.vendorDocuments.find((d) => d.docType === "PAN");
              const gstDoc = vendor.vendorDocuments.find((d) => d.docType === "GST");
              const discomDoc = vendor.vendorDocuments.find((d) => d.docType === "DISCOM");

              return (
                <div
                  key={vendor.id}
                  className={`glass-panel-l1 rounded-xl p-5 border transition-all flex flex-col justify-between ${
                    vendor.status === "SUSPENDED"
                      ? "border-error/40 bg-error/5"
                      : vendor.status === "APPROVED"
                      ? "border-outline-variant/30 hover:border-tertiary/40"
                      : "border-outline-variant/30"
                  }`}
                >
                  <div>
                    {/* Header bar */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold border border-outline-variant/40">
                            {vendor.id}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 uppercase ${
                              vendor.status === "APPROVED"
                                ? "bg-primary/10 text-primary border-primary/30"
                                : vendor.status === "SUSPENDED"
                                ? "bg-error/20 text-error border-error/40"
                                : vendor.status === "REJECTED"
                                ? "bg-error/10 text-error border-error/30"
                                : "bg-secondary/15 text-secondary border-secondary/30"
                            }`}
                          >
                            {vendor.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                            {vendor.status === "SUSPENDED" && <ShieldAlert className="w-3 h-3" />}
                            {vendor.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {vendor.status === "REJECTED" && <X className="w-3 h-3" />}
                            <span>{vendor.status}</span>
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-sm text-on-surface">
                          {companyName}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          {vendor.email}
                          {vendor.phone && ` • ${vendor.phone}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-primary">
                          {vendor._count?.bids || 0} Bids
                        </span>
                        <p className="text-[10px] text-on-surface-variant">Auctions Entered</p>
                      </div>
                    </div>

                    {/* Statutory Documents Strip */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/20 text-xs text-center font-mono">
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase block">PAN Card</span>
                        <span className={`text-[11px] font-bold ${panDoc ? "text-primary" : "text-error"}`}>
                          {panDoc ? "✓ Verified" : "✗ Missing"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase block">GST Reg</span>
                        <span className={`text-[11px] font-bold ${gstDoc ? "text-primary" : "text-error"}`}>
                          {gstDoc ? "✓ Verified" : "✗ Missing"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase block">DISCOM Order</span>
                        <span className={`text-[11px] font-bold ${discomDoc ? "text-primary" : "text-error"}`}>
                          {discomDoc ? "✓ Verified" : "✗ Missing"}
                        </span>
                      </div>
                    </div>

                    {/* Suspension Notice if Suspended */}
                    {vendor.status === "SUSPENDED" && (
                      <div className="p-2.5 rounded-lg bg-error/15 border border-error/30 text-error font-mono text-[11px] mb-3 flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Contractor account suspended. Bidding disabled and all active bids cancelled.</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                    <Link
                      href="/dashboard/admin/verification"
                      className="text-tertiary hover:underline font-medium flex items-center gap-1 font-mono text-xs"
                    >
                      <span>Inspect Dossier (M-02)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {vendor.status === "APPROVED" && (
                        <button
                          onClick={() => handleSuspend(vendor.id, companyName)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error/20 text-error border border-error/30 font-heading font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Suspend vendor and withdraw all pending bids"
                          type="button"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspend Vendor</span>
                        </button>
                      )}

                      {vendor.status === "SUSPENDED" && (
                        <button
                          onClick={() => handleReactivate(vendor.id, companyName)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-heading font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Reactivate vendor and restore bidding access"
                          type="button"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Reactivate Vendor</span>
                        </button>
                      )}
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
