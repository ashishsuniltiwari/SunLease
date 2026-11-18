"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react";

export default function VendorAuditWatchDeskPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Visit Note Submission State
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [visitNote, setVisitNote] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/audits");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch audit assignments");
      }
      setAudits(data.audits || []);
    } catch (err: any) {
      setError(err.message || "Failed to load audits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleSaveVisitNote = async (auditId: string) => {
    if (!visitNote.trim()) return;

    setIsSubmitting(true);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/audits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          vendorVisitNote: visitNote.trim(),
          scheduledDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update visit notes");
      }

      setSaveSuccess("Onsite feasibility note recorded and transmitted to Society RWA!");
      setEditingAuditId(null);
      setVisitNote("");
      await fetchAudits();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Audit Watch Desk (V-10)">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-secondary" />
          <span>Fetching awarded auctions and scheduled physical audits...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Audit Watch Desk & Physical Feasibility">
      <div className="space-y-6 max-w-5xl">
        {/* Banner */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                V-10 · AUDIT WATCH DESK
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> RWA Contact Shared Post-Selection
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              Onsite Structural Audits &amp; Contact Desk
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Housing societies where your proposal was accepted. Conduct the physical feasibility walkthrough and submit engineering notes.
            </p>
          </div>

          <Link
            href="/vendor/bids"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest self-start md:self-auto"
          >
            &larr; Back to Bids Desk
          </Link>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {audits.length === 0 ? (
          <div className="glass-panel-l1 rounded-2xl p-12 border border-outline-variant/30 text-center space-y-3 font-mono text-xs text-on-surface-variant">
            <Clock className="w-8 h-8 mx-auto text-secondary" />
            <h3 className="text-base font-heading font-bold text-on-surface">No Awarded Audits Yet</h3>
            <p className="max-w-md mx-auto text-xs">
              When an RWA committee selects your blind bid, their direct contact details and onsite structural audit schedule will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/vendor"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-on font-bold shadow-sm"
              >
                <span>Browse Live Society Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {audits.map((a) => {
              const outcome = a.outcome || "PENDING";
              const rwaUser = a.roof?.user;
              const isEditingThis = editingAuditId === a.id;

              return (
                <div
                  key={a.id}
                  className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-5 shadow-lg"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-lg text-on-surface">
                          {a.roof?.societyName || a.roof?.society}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          outcome === "PASSED"
                            ? "bg-primary/20 text-primary border-primary/40"
                            : outcome === "PENDING"
                            ? "bg-secondary/15 text-secondary border-secondary/30"
                            : "bg-error/15 text-error border-error/30"
                        }`}>
                          Audit: {outcome}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-on-surface-variant/70" />
                        <span>{a.roof?.location || "Mumbai Suburban"}</span>
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-[10px] text-outline uppercase block">Awarded Tariff</span>
                      <strong className="text-primary font-bold text-sm">
                        ₹{a.acceptedBid?.amount?.toFixed(2)} / kWh
                      </strong>
                    </div>
                  </div>

                  {/* Society Committee Contact Dossier */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/20 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-outline uppercase block">Secretary / President</span>
                      <strong className="text-on-surface block mt-0.5">
                        {rwaUser?.name || "Society Managing Committee"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block">Committee Email</span>
                      <span className="text-on-surface flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                        {rwaUser?.email || "secretary@housing.org"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block">Society Phone</span>
                      <span className="text-on-surface flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                        {rwaUser?.phone || "+91 98200 44211"}
                      </span>
                    </div>
                  </div>

                  {/* Current Onsite Visit Notes */}
                  <div className="space-y-2">
                    <span className="text-xs font-heading font-bold text-on-surface flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-secondary" />
                      Recorded Onsite Feasibility Findings:
                    </span>
                    <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface leading-relaxed">
                      {a.vendorVisitNote || (
                        <span className="text-on-surface-variant font-mono text-[11px]">
                          No field notes submitted yet. Conduct the site walkthrough and record structural parameters below.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit / Edit Visit Notes Form */}
                  {isEditingThis ? (
                    <div className="p-4 rounded-xl bg-surface-container border border-secondary/30 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-secondary font-mono uppercase text-[11px]">
                          Enter Field Engineer Inspection Report
                        </strong>
                        <button
                          onClick={() => setEditingAuditId(null)}
                          className="text-on-surface-variant hover:text-on-surface text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                            Visit Date
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full bg-surface-container-low p-2 rounded-lg border border-outline-variant/40 text-on-surface font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                            Engineering Findings &amp; Riser Notes
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Parapet load-bearing certified at 210 kg/m². LT panel riser path verified with building manager."
                            value={visitNote}
                            onChange={(e) => setVisitNote(e.target.value)}
                            className="w-full bg-surface-container-low p-2 rounded-lg border border-outline-variant/40 text-on-surface font-sans"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={isSubmitting || !visitNote.trim()}
                          onClick={() => handleSaveVisitNote(a.id)}
                          className="px-4 py-2 rounded-lg bg-secondary text-secondary-on font-bold hover:brightness-110 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? "Submitting..." : "Transmit Visit Notes to RWA"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-mono text-outline">
                        Phase 3 Feasibility Walkthrough
                      </span>
                      <button
                        onClick={() => {
                          setEditingAuditId(a.id);
                          setVisitNote(a.vendorVisitNote || "");
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-secondary" />
                        <span>{a.vendorVisitNote ? "Update Visit Notes" : "Submit Field Visit Notes"}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
