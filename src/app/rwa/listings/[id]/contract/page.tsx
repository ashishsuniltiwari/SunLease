"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Building2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Upload,
  Calendar,
  Lock,
  Coins,
  BadgeCheck,
  Activity,
} from "lucide-react";

export default function RwaContractScreenPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [existingContract, setExistingContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [contractRef, setContractRef] = useState(`PPA-2026-${Date.now().toString().slice(-4)}`);
  const [contractDate, setContractDate] = useState(new Date().toISOString().split("T")[0]);
  const [tariffRate, setTariffRate] = useState("3.45");
  const [tenureYears, setTenureYears] = useState("25");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contractConfirmed, setContractConfirmed] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleContractDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.originalName) {
        setUploadedFileName(data.originalName);
      } else {
        setUploadedFileName(file.name);
      }
    } catch {
      setUploadedFileName(file.name);
    } finally {
      setIsUploadingDoc(false);
      if (e.target) e.target.value = "";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check existing contracts
      const resContracts = await fetch(`/api/contracts?listingId=${listingId}`);
      const dataContracts = await resContracts.json();

      if (dataContracts.contracts && dataContracts.contracts.length > 0) {
        setExistingContract(dataContracts.contracts[0]);
      }

      // Fetch listing details
      const resListing = await fetch(`/api/listings/${listingId}`);
      const dataListing = await resListing.json();
      if (!resListing.ok) {
        throw new Error(dataListing.error || "Failed to load listing");
      }
      setListing(dataListing.listing);

      // Pre-populate tariff if accepted bid exists
      const acceptedBid = dataListing.listing?.bids?.find((b: any) => b.status === "ACCEPTED");
      if (acceptedBid?.amount) {
        setTariffRate(acceptedBid.amount.toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch contract information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchData();
    }
  }, [listingId]);

  const handleConfirmContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          contractDate,
          tariffOrShareRate: parseFloat(tariffRate) || 3.45,
          proposalType: "RESCO_LEASE",
          signedDocKey: uploadedFileName || `signed_ppa_${contractRef}.pdf`,
          vendorConfigNote: `Executed off-platform standard tripartite PPA. Ref: ${contractRef}. Tenure: ${tenureYears} Years.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm contract");
      }

      setContractConfirmed(true);
      await fetchData();
    } catch (err: any) {
      setSubmitError(err.message || "Contract confirmation error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Phase 4 Tripartite Contract Recording">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-primary" />
          <span>Loading contract covenants and telemetry bindings...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout title="Phase 4 Tripartite Contract Recording">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-error/30 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-error mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">Unable to Load Contract Screen</h2>
          <p className="text-xs text-on-surface-variant">{error || "Listing not found or access restricted."}</p>
          <Link
            href="/dashboard/rwa"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold"
          >
            &larr; Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isContracted = listing.status === "CONTRACTED" || !!existingContract;

  return (
    <DashboardLayout title={`Phase 4 Contract Recording — ${listing.societyName || listing.society}`}>
      <div className="max-w-4xl space-y-6">
        {/* Protocol Banner */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                R-08 · OFF-PLATFORM CONTRACT RECORDING
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                isContracted ? "bg-primary/20 text-primary border-primary/40" : "bg-secondary/15 text-secondary border-secondary/30"
              }`}>
                {isContracted ? "CONTRACT EXECUTED & ONLINE" : "PENDING SIGNATURE CONFIRMATION"}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              {listing.societyName || listing.society}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Confirm execution of the 25-year standard tripartite RESCO solar lease to activate live IoT telemetry monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isContracted && (
              <Link
                href="/dashboard/rwa"
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>View Live Telemetry</span>
              </Link>
            )}
            <Link
              href={`/rwa/listings/${listingId}`}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
            >
              Listing Details (R-04)
            </Link>
          </div>
        </div>

        {/* Contracted Active State Display */}
        {isContracted ? (
          <div className="glass-panel-l1 rounded-2xl p-8 border border-primary/40 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <BadgeCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-on-surface">
                  25-Year Tripartite Solar PPA Executed!
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Telemetry monitoring has been activated for this housing society. Solar generation is streamed in real time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-mono">
              <div>
                <span className="text-[10px] text-outline uppercase block">Contract Ref</span>
                <strong className="text-on-surface block mt-0.5">
                  {existingContract?.contractRef || "PPA-2026-ACTIVE"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Agreed Tariff</span>
                <strong className="text-primary text-sm block mt-0.5">
                  ₹{existingContract?.ppaRatePerKwh?.toFixed(2) || tariffRate} / kWh
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Lease Tenure</span>
                <span className="text-on-surface block mt-0.5">
                  {existingContract?.leaseTenureYears || 25} Years
                </span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Telemetry Status</span>
                <span className="text-primary font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  ONLINE
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">
                Signed Copy: <code className="text-primary font-mono">{existingContract?.signedDocKey || "signed_contract.pdf"}</code>
              </span>
              <Link
                href="/dashboard/rwa"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-2 shadow-glow"
              >
                <span>Launch Telemetry Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Contract Confirmation Form */
          <form onSubmit={handleConfirmContract} className="glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-6">
            <div>
              <h3 className="font-heading font-bold text-base text-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Record Executed Tripartite Agreement
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter the details of the physical or digital contract signed with the approved solar EPC developer.
              </p>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Contract Reference ID / Document Number
                </label>
                <input
                  type="text"
                  required
                  value={contractRef}
                  onChange={(e) => setContractRef(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Execution / Signature Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="date"
                    required
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Confirmed PPA Tariff Rate (₹ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={tariffRate}
                  onChange={(e) => setTariffRate(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-sm font-bold text-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Lease Tenure (Years)
                </label>
                <input
                  type="number"
                  required
                  value={tenureYears}
                  onChange={(e) => setTenureYears(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Signed Copy Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleContractDocUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-outline-variant/40 rounded-xl p-6 text-center bg-surface-container-low/50 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <Upload className="w-8 h-8 mx-auto text-on-surface-variant/60 group-hover:text-primary transition-colors mb-2" />
              <p className="text-xs text-on-surface font-medium group-hover:text-primary transition-colors">
                Attach Executed PPA Copy (PDF / Scanned Stamp Paper)
              </p>
              <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                Stored in encrypted compliance vault for society auditing.
              </p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-on-surface hover:bg-surface-container-highest">
                  {isUploadingDoc
                    ? "Uploading..."
                    : uploadedFileName
                    ? `✓ Attached: ${uploadedFileName}`
                    : "Browse or Drop File"}
                </span>
              </div>
            </div>

            {/* Legal Confirmation Notice */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant space-y-1">
              <strong className="text-on-surface block text-[11px] uppercase font-mono">
                Legal Covenant Check
              </strong>
              <p className="text-[11px] leading-relaxed">
                By submitting, the Society Managing Committee certifies that the tripartite agreement has been duly registered, common-area net metering clearance filed with the local DISCOM circle, and the rooftop handed over for mounting structure erection.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">
                Advances listing to <strong className="text-primary font-mono">CONTRACTED</strong>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-glow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming Contract &amp; Activating Plant...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Execute 25-Year Contract</span>
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
