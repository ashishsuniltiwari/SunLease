"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Award,
  Building2,
  Mail,
  Phone,
  Landmark,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Cpu,
  BadgeCheck,
  MapPin,
} from "lucide-react";

export default function VendorAccountSettingsPage() {
  const [companyName, setCompanyName] = useState("SolarGrid Clean Energy Pvt Ltd");
  const [gstin, setGstin] = useState("27AABCS1429B1Z8");
  const [pan, setPan] = useState("AABCS1429B");
  const [empanelmentNo, setEmpanelmentNo] = useState("MNRE-MH-2024-T1-8821");
  const [email, setEmail] = useState("vendor@solargrid.in");
  const [phone, setPhone] = useState("+91 98200 99421");
  const [officeAddress, setOfficeAddress] = useState("Unit 402, Quantum Solar Park, MIDC Andheri East, Mumbai, MH 400093");
  const [bankAccount, setBankAccount] = useState("00293847561029");
  const [bankIfsc, setBankIfsc] = useState("ICIC0000029");
  const [inverterBrands, setInverterBrands] = useState("SMA, Sungrow, Growatt, SolarEdge, Enphase");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          if (data.user.name) setCompanyName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch((err) => console.error("Error loading vendor profile:", err))
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
          name: companyName,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update vendor settings");
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
    <DashboardLayout title="Vendor Profile & EPC Company Settings">
      <div className="max-w-4xl space-y-6">
        {/* Header Protocol Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/10 text-secondary border border-secondary/30">
                V-14 · CONTRACTOR SETTINGS
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Tier-1 Empanelled EPC
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-on-surface">
              EPC Contractor Corporate Profile
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Manage corporate licensing details, supported inverter brands, and billing bank coordinates.
            </p>
          </div>

          <Link
            href="/dashboard/vendor"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all self-start md:self-auto"
          >
            Back to Marketplace
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
            <span>Company profile and hardware capabilities updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Corporate Legal Identity */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" />
              Corporate Statutory Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Company Registered Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  MNRE / DISCOM Empanelment License No.
                </label>
                <input
                  type="text"
                  required
                  value={empanelmentNo}
                  onChange={(e) => setEmpanelmentNo(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Corporate GSTIN
                </label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Company PAN
                </label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Official Tender Notification Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-surface-container/60 px-3.5 py-2.5 rounded-lg border border-outline-variant/20 text-on-surface-variant font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Engineering Operations Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                Headquarters Office Address
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-secondary font-sans text-xs"
              />
            </div>
          </div>

          {/* Section 2: Inverter Hardware Capabilities */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Supported Inverter Hardware &amp; Telemetry Gateways
            </h3>

            <div>
              <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                Qualified Hardware OEM Manufacturers
              </label>
              <input
                type="text"
                value={inverterBrands}
                onChange={(e) => setInverterBrands(e.target.value)}
                placeholder="SMA, Sungrow, Growatt, SolarEdge, Enphase"
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
              />
              <span className="text-[10px] text-outline mt-1 block">
                Comma-separated OEM hardware partners approved for automated Modbus / RS-485 edge logging.
              </span>
            </div>
          </div>

          {/* Section 3: Billing & Escrow Coordinates */}
          <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
              <Landmark className="w-4 h-4 text-tertiary" />
              Corporate Escrow Bank Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                  Corporate Bank Account Number
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
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-on font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Contractor Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
