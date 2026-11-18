"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  Mail,
  Phone,
  Landmark,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Bell,
  FileText,
  KeyRound,
} from "lucide-react";

export default function RwaAccountSettingsPage() {
  const [societyName, setSocietyName] = useState("Palm Meadows Co-op Housing Society Ltd");
  const [registrationNo, setRegistrationNo] = useState("MUM/W-K/HSG/TC/1204/2014");
  const [secretaryEmail, setSecretaryEmail] = useState("admin@palmmeadows.rwa.org");
  const [phone, setPhone] = useState("+91 98200 44211");
  const [bankAccount, setBankAccount] = useState("918273645012");
  const [bankIfsc, setBankIfsc] = useState("HDFC0000240");
  const [bankName, setBankName] = useState("HDFC Bank — Kandivali East Branch");
  const [discomCaNo, setDiscomCaNo] = useState("102938475");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          if (data.user.name) setSocietyName(data.user.name);
          if (data.user.email) setSecretaryEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: societyName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Society Profile & Account Settings">
      <div className="max-w-4xl space-y-6">
        {/* Header Protocol Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                R-13 · RWA GOVERNANCE &amp; SETTINGS
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Society Entity
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              Housing Society Account Settings
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Manage committee registration credentials, escrow bank coordinates for lease disbursements, and DISCOM accounts.
            </p>
          </div>

          <Link
            href="/dashboard/rwa"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all self-start md:self-auto"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings and society banking coordinates updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Society Legal Entity */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Cooperative Society Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Official Registered Society Name
                </label>
                <input
                  type="text"
                  required
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Co-op Societies Act Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Authorized Secretary / Committee Email
                </label>
                <input
                  type="email"
                  disabled
                  value={secretaryEmail}
                  className="w-full bg-surface-container/60 px-3.5 py-2.5 rounded-lg border border-outline-variant/20 text-on-surface-variant font-mono text-xs cursor-not-allowed"
                />
                <span className="text-[10px] text-outline mt-1 block">
                  Primary login email cannot be edited directly.
                </span>
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Official Society Phone Helpline
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payout Escrow Bank Account */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                <Landmark className="w-4 h-4 text-secondary" />
                Sinking Fund &amp; Lease Payout Escrow Account
              </h3>
              <span className="text-[10px] font-mono text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                Direct ACH / NEFT Payouts
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Monthly solar lease revenues earned from the 25-year RESCO developer are disbursed automatically into this account.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Bank &amp; Branch Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: DISCOM Metering & Alerts */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Bell className="w-4 h-4 text-tertiary" />
              DISCOM Account &amp; Notification Triggers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Common Area Electricity Consumer No. (CA No.)
                </label>
                <input
                  type="text"
                  value={discomCaNo}
                  onChange={(e) => setDiscomCaNo(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded border-outline-variant/40 bg-surface-container text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Dispatch SMS alerts to Secretary on inverter degradation &gt;10%</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monthlyReports}
                    onChange={(e) => setMonthlyReports(e.target.checked)}
                    className="rounded border-outline-variant/40 bg-surface-container text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Email monthly clean generation &amp; AGM carbon offset summary</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-glow disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Society Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
