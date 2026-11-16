"use client";

import React, { useState } from "react";
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
  RefreshCw,
  Clock,
  MapPin,
  RotateCw,
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
  Scale,
  Filter,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

interface VendorApplication {
  id: string;
  companyName: string;
  tradingName: string;
  region: string;
  city: string;
  discomCircle: string;
  mnreLicense: string;
  gstin: string;
  trackRecordMwp: number;
  solvencyCr: number;
  submittedTime: string;
  slaRemaining: string;
  slaUrgent: boolean;
  status: "Pending Review" | "Approved" | "Rejected";
  rejectionReason?: string;
  clearanceHash?: string;
  documents: {
    mnreCertificate: boolean;
    gstClearance: boolean;
    solvencyLetter: boolean;
    directorKyc: boolean;
  };
}

export default function AdminVerificationQueuePage() {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending Review" | "Approved" | "Rejected">("All");
  const [discomFilter, setDiscomFilter] = useState("All Circles");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [inspectedApp, setInspectedApp] = useState<VendorApplication | null>(null);
  const [rejectingApp, setRejectingApp] = useState<VendorApplication | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("GSTIN filing mismatch with Maharashtra state tax registry");
  const [auditReportModalOpen, setAuditReportModalOpen] = useState(false);

  // Mock Vendor Applications
  const [applications, setApplications] = useState<VendorApplication[]>([
    {
      id: "#APP-8841",
      companyName: "Apex CleanEnergy Infrastructure LLP",
      tradingName: "Apex Solar MMR",
      region: "Mira-Bhayandar Cluster",
      city: "Thane",
      discomCircle: "Adani Suburban",
      mnreLicense: "MNRE-IN-2024-9982",
      gstin: "27AABCA4219B1Z4",
      trackRecordMwp: 4.8,
      solvencyCr: 5.5,
      submittedTime: "2 hours ago",
      slaRemaining: "22h Left",
      slaUrgent: false,
      status: "Pending Review",
      documents: {
        mnreCertificate: true,
        gstClearance: true,
        solvencyLetter: true,
        directorKyc: true,
      },
    },
    {
      id: "#APP-8842",
      companyName: "Maharashtra Soltech EPC Solutions Ltd",
      tradingName: "Soltech Bharat",
      region: "Vashi Industrial Sector",
      city: "Navi Mumbai",
      discomCircle: "MSEDCL Grid",
      mnreLicense: "MNRE-MH-2023-7140",
      gstin: "27AABCS9821K1Z2",
      trackRecordMwp: 8.2,
      solvencyCr: 12.0,
      submittedTime: "4 hours ago",
      slaRemaining: "20h Left",
      slaUrgent: false,
      status: "Pending Review",
      documents: {
        mnreCertificate: true,
        gstClearance: true,
        solvencyLetter: true,
        directorKyc: true,
      },
    },
    {
      id: "#APP-8843",
      companyName: "Zenith Rooftop Power Developers",
      tradingName: "Zenith Solar Hub",
      region: "Bandra Kurla Complex",
      city: "Mumbai",
      discomCircle: "Tata Power Net-Meter",
      mnreLicense: "MNRE-IN-2024-1104",
      gstin: "27AACZ8810P1Z9",
      trackRecordMwp: 14.5,
      solvencyCr: 25.0,
      submittedTime: "18 hours ago",
      slaRemaining: "6h Left",
      slaUrgent: true,
      status: "Pending Review",
      documents: {
        mnreCertificate: true,
        gstClearance: true,
        solvencyLetter: true,
        directorKyc: true,
      },
    },
    {
      id: "#APP-8839",
      companyName: "SolarGrid India Private Limited",
      tradingName: "SolarGrid Ops",
      region: "Ghodbunder Road Corridor",
      city: "Thane",
      discomCircle: "Adani & MSEDCL",
      mnreLicense: "MNRE-MH-2022-4019",
      gstin: "27AABCS1429B1Z4",
      trackRecordMwp: 28.0,
      solvencyCr: 45.0,
      submittedTime: "Yesterday",
      slaRemaining: "Completed",
      slaUrgent: false,
      status: "Approved",
      clearanceHash: "0x7fa940e8a2b3...3b92",
      documents: {
        mnreCertificate: true,
        gstClearance: true,
        solvencyLetter: true,
        directorKyc: true,
      },
    },
    {
      id: "#APP-8835",
      companyName: "Vidyut Greenpower Contracting Co",
      tradingName: "Vidyut Solar",
      region: "Kalyan-Dombivli Belt",
      city: "Thane",
      discomCircle: "MSEDCL Grid",
      mnreLicense: "MNRE-EXP-2021-0941",
      gstin: "27AAACV7710R1Z5",
      trackRecordMwp: 1.2,
      solvencyCr: 0.8,
      submittedTime: "2 days ago",
      slaRemaining: "Expired",
      slaUrgent: false,
      status: "Rejected",
      rejectionReason: "MNRE Empanelment Certificate expired on 31-Aug-2024; Insolvent bank guarantee < ₹2.0 Cr threshold.",
      documents: {
        mnreCertificate: false,
        gstClearance: true,
        solvencyLetter: false,
        directorKyc: true,
      },
    },
    {
      id: "#APP-8844",
      companyName: "Surya Urja Green Infra Pvt Ltd",
      tradingName: "SuryaUrja PM-Ghar",
      region: "Kothrud & Hinjawadi",
      city: "Pune",
      discomCircle: "MSEDCL Pune Urban",
      mnreLicense: "MNRE-MH-2024-5519",
      gstin: "27AABCS3310M1Z8",
      trackRecordMwp: 6.4,
      solvencyCr: 8.5,
      submittedTime: "5 hours ago",
      slaRemaining: "19h Left",
      slaUrgent: false,
      status: "Pending Review",
      documents: {
        mnreCertificate: true,
        gstClearance: true,
        solvencyLetter: true,
        directorKyc: true,
      },
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleApprove = (id: string) => {
    const randomHash = `0x${Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}...verified`;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: "Approved",
              clearanceHash: randomHash,
              slaRemaining: "Approved Just Now",
              slaUrgent: false,
            }
          : app
      )
    );
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === rejectingApp.id
          ? {
              ...app,
              status: "Rejected",
              rejectionReason: rejectionReasonInput,
              slaRemaining: "Rejected",
              slaUrgent: false,
            }
          : app
      )
    );

    setRejectingApp(null);
  };

  // Metrics computation
  const pendingCount = applications.filter((a) => a.status === "Pending Review").length;
  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tradingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mnreLicense.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const matchesDiscom = discomFilter === "All Circles" || app.discomCircle.includes(discomFilter);

    return matchesSearch && matchesStatus && matchesDiscom;
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

        {/* 1. TOP IDENTITY & CLEARANCE AUTHORITY BAND */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel-l1 p-5 rounded-xl border border-outline-variant/30 shadow-md">
          {/* Identity Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-[10px] text-tertiary uppercase tracking-widest font-semibold">
                Platform Admin • Clearance Authority v4.2
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                DISCOM Master Oversight Enclave Active
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                State Solar Empanelment Clearance Desk
              </h1>
              <span className="font-mono text-xs text-on-surface-variant">
                MEDA &amp; Central DISCOM Registry
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
              <span>Vendor Directory</span>
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
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
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
                Pending Vendor Applications
              </span>
              <Clock className="w-4 h-4 text-tertiary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-tertiary tracking-tight">
                {pendingCount}
              </span>
              <span className="font-mono text-xs text-tertiary uppercase font-semibold">
                In Review
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Underwriting Queue</span>
              <span className="text-secondary font-medium">1 P1 Priority</span>
            </div>
          </div>

          {/* Card 2: Approved EPC Vendors */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Approved EPC Developers
              </span>
              <BadgeCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-primary tracking-tight">
                {approvedCount + 41}
              </span>
              <span className="font-mono text-xs text-primary uppercase font-semibold">
                Empanelled
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>State Grid Reliability</span>
              <span className="text-primary font-medium">99.2% Compliant</span>
            </div>
          </div>

          {/* Card 3: Rejected / Blocked */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Compliance Disqualifications
              </span>
              <ShieldAlert className="w-4 h-4 text-error" />
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
              <span className="text-error font-medium">GSTIN / Expired MNRE</span>
            </div>
          </div>

          {/* Card 4: Avg Audit SLA */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Average Review SLA
              </span>
              <Zap className="w-4 h-4 text-secondary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-secondary tracking-tight">
                18.4
              </span>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">
                Hours Avg
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Target Benchmark: &lt; 24h</span>
              <span className="text-primary font-medium">98.7% On-Time</span>
            </div>
          </div>
        </div>

        {/* 3. FILTER & SEARCH CONTROLS BAR */}
        <div className="p-4 rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-sm flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, GSTIN, MNRE license, or city..."
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

            {/* Filter Dropdowns */}
            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex-1 min-w-[140px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-tertiary cursor-pointer"
                >
                  <option value="All">Status: All Statuses</option>
                  <option value="Pending Review">Status: Pending Review</option>
                  <option value="Approved">Status: Approved</option>
                  <option value="Rejected">Status: Rejected</option>
                </select>
              </div>

              {/* DISCOM Circle Filter */}
              <div className="flex-1 min-w-[150px]">
                <select
                  value={discomFilter}
                  onChange={(e) => setDiscomFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-tertiary cursor-pointer"
                >
                  <option value="All Circles">DISCOM: All Circles</option>
                  <option value="Adani">Adani Electricity Suburban</option>
                  <option value="Tata Power">Tata Power Net-Meter</option>
                  <option value="MSEDCL">MSEDCL Grid (Thane/Navi Mumbai/Pune)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Counter */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <p className="text-on-surface-variant">
                Displaying <strong className="text-on-surface font-semibold">{filteredApps.length} Vendor Underwriting Dossiers</strong> • MEDA Maharashtra State Queue
              </p>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant/60">Updated Live</span>
          </div>
        </div>

        {/* 4. MAIN DATA TABLE: VENDOR APPLICATIONS QUEUE */}
        <div className="rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-surface-container font-mono text-[11px] text-outline uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="p-3.5">Application &amp; Company</th>
                  <th className="p-3.5">Credentials &amp; DISCOM</th>
                  <th className="p-3.5">Track Record</th>
                  <th className="p-3.5">Audit Documents</th>
                  <th className="p-3.5">SLA / Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-container-high/40 transition-colors">
                    {/* Col 1: Application ID & Company */}
                    <td className="p-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading font-bold text-sm text-on-surface">
                          {app.companyName}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-tertiary font-semibold">{app.id}</span>
                          <span className="text-outline-variant">•</span>
                          <span className="text-on-surface-variant">{app.region}, {app.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Credentials & DISCOM */}
                    <td className="p-3.5">
                      <div className="flex flex-col font-mono text-[11px] gap-0.5">
                        <span className="text-on-surface font-semibold">{app.mnreLicense}</span>
                        <span className="text-on-surface-variant text-[10px]">GSTIN: {app.gstin}</span>
                        <span className="text-primary text-[10px]">{app.discomCircle}</span>
                      </div>
                    </td>

                    {/* Col 3: Track Record */}
                    <td className="p-3.5 font-mono">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-on-surface font-semibold">{app.trackRecordMwp} MWp</span>
                        <span className="text-secondary text-[10px]">Solvency: ₹{app.solvencyCr} Cr</span>
                      </div>
                    </td>

                    {/* Col 4: Audit Documents */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            app.documents.mnreCertificate
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-error/10 text-error border-error/30"
                          }`}
                        >
                          MNRE
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            app.documents.gstClearance
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-error/10 text-error border-error/30"
                          }`}
                        >
                          GST
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            app.documents.solvencyLetter
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-error/10 text-error border-error/30"
                          }`}
                        >
                          Bank
                        </span>
                      </div>
                    </td>

                    {/* Col 5: SLA / Time */}
                    <td className="p-3.5 font-mono text-xs">
                      <div className="flex flex-col">
                        <span className={app.slaUrgent ? "text-error font-bold" : "text-on-surface"}>
                          {app.slaRemaining}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{app.submittedTime}</span>
                      </div>
                    </td>

                    {/* Col 6: Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          app.status === "Approved"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : app.status === "Rejected"
                            ? "bg-error/10 text-error border-error/30"
                            : "bg-secondary/15 text-secondary border-secondary/30"
                        }`}
                      >
                        {app.status === "Approved" && <Check className="w-3 h-3" />}
                        {app.status === "Rejected" && <X className="w-3 h-3" />}
                        {app.status === "Pending Review" && <Clock className="w-3 h-3" />}
                        <span>{app.status}</span>
                      </span>
                    </td>

                    {/* Col 7: Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectedApp(app)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface border border-outline-variant/30 transition-colors"
                          title="Inspect Full Dossier"
                          type="button"
                        >
                          <Eye className="w-3.5 h-3.5 text-tertiary" />
                        </button>

                        {app.status === "Pending Review" && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on font-heading font-bold text-xs flex items-center gap-1 shadow-glow hover:brightness-110 transition-all cursor-pointer"
                              type="button"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectingApp(app);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-error font-heading font-semibold text-xs flex items-center gap-1 border border-error/30 transition-all cursor-pointer"
                              type="button"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {app.status === "Approved" && (
                          <span className="font-mono text-[10px] text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">
                            Clearance #0x7f...
                          </span>
                        )}

                        {app.status === "Rejected" && (
                          <span className="font-mono text-[10px] text-error px-2 py-1 rounded bg-error/10 border border-error/20">
                            Declined
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: INSPECT VENDOR DOSSIER */}
      {inspectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-tertiary" />
                <div className="flex flex-col">
                  <h3 className="font-heading font-bold text-lg text-on-surface">
                    {inspectedApp.companyName}
                  </h3>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Application ID: {inspectedApp.id} • Registered in {inspectedApp.city}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedApp(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">MNRE Accreditation Number</span>
                <span className="text-on-surface font-bold">{inspectedApp.mnreLicense}</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">GSTIN Identification</span>
                <span className="text-on-surface font-bold">{inspectedApp.gstin}</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">Verified Cumulative Track Record</span>
                <span className="text-primary font-bold">{inspectedApp.trackRecordMwp} Megawatts Peak (MWp)</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase">Certified Bank Solvency</span>
                <span className="text-secondary font-bold">₹{inspectedApp.solvencyCr} Crores (Scheduled Bank)</span>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col gap-2.5 text-xs">
              <span className="font-mono text-[10px] text-outline uppercase font-semibold">
                Document Verification Checklist (State DISCOM Protocol):
              </span>
              <div className="flex items-center justify-between text-on-surface">
                <span>1. MNRE PM Surya Ghar Channel Partner Certificate:</span>
                <span className={inspectedApp.documents.mnreCertificate ? "text-primary font-bold" : "text-error font-bold"}>
                  {inspectedApp.documents.mnreCertificate ? "✓ Verified (Active)" : "✗ Expired / Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface">
                <span>2. 3-Year Audited Balance Sheet &amp; GST Clearance:</span>
                <span className={inspectedApp.documents.gstClearance ? "text-primary font-bold" : "text-error font-bold"}>
                  {inspectedApp.documents.gstClearance ? "✓ 27AABCS... Clean" : "✗ Tax Mismatch"}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface">
                <span>3. Bank Solvency Certificate for Warranty Escrow:</span>
                <span className={inspectedApp.documents.solvencyLetter ? "text-primary font-bold" : "text-error font-bold"}>
                  {inspectedApp.documents.solvencyLetter ? "✓ ₹5.0 Cr+ Bank Guarantee" : "✗ Insufficient Funds"}
                </span>
              </div>
            </div>

            {inspectedApp.rejectionReason && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-xs text-error font-mono">
                <strong>Disqualification Audit Log:</strong> {inspectedApp.rejectionReason}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setInspectedApp(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface font-semibold"
              >
                Close Dossier
              </button>
              {inspectedApp.status === "Pending Review" && (
                <>
                  <button
                    onClick={() => {
                      const id = inspectedApp.id;
                      setInspectedApp(null);
                      handleApprove(id);
                    }}
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
      )}

      {/* MODAL 2: REJECT REASON MODAL */}
      {rejectingApp && (
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
                onClick={() => setRejectingApp(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="flex flex-col gap-3 text-xs">
              <p className="text-on-surface-variant">
                Select or specify the regulatory reason for rejecting <strong className="text-on-surface">{rejectingApp.companyName}</strong>. This audit notice is permanently signed into the regulatory ledger.
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
                  <option value="Inadequate Bank Solvency Guarantee (< ₹2.0 Cr threshold)">
                    Inadequate Bank Solvency Guarantee (&lt; ₹2.0 Cr threshold)
                  </option>
                  <option value="Blacklisted or flagged by state DISCOM compliance board">
                    Blacklisted or flagged by state DISCOM compliance board
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-error text-background font-bold"
                >
                  Confirm Disqualification
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
                <strong className="text-primary">{approvedCount + 41} Tier-1 Developers</strong>
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
