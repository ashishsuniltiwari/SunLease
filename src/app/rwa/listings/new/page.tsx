"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Building2,
  MapPin,
  Upload,
  CheckCircle2,
  Sun,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

export default function ListNewRooftopPage() {
  const [societyName, setSocietyName] = useState("Emerald Heights CHS");
  const [location, setLocation] = useState("Kandivali West, Mumbai, MH");
  const [rooftopArea, setRooftopArea] = useState("14,500");
  const [sanctionedLoad, setSanctionedLoad] = useState("180");
  const [discomCircle, setDiscomCircle] = useState("Adani Electricity - Mumbai Suburban");
  const [estimatedCapacity, setEstimatedCapacity] = useState("145");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <DashboardLayout title="List New Rooftop for Solar Bidding">
      <div className="max-w-4xl space-y-6">
        {/* Protocol Banner */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                RWA ROOFTOP ONBOARDING
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> SGX Encrypted Blind Auction Ready
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              Register New Society Rooftop
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Submit rooftop telemetry and structural parameters to invite verified Tier-1 EPC bids.
            </p>
          </div>

          <Link
            href="/dashboard/rwa"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            Back to Telemetry
          </Link>
        </div>

        {submitted ? (
          <div className="glass-panel-l1 rounded-xl p-8 border border-primary/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-heading font-bold text-on-surface">
              Rooftop Successfully Registered for Blind Auction!
            </h2>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Your rooftop listing <code className="text-primary font-mono">#RT-4032</code> has been created and broadcast to 42 empanelled EPC contractors across the MMR grid circle.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/rwa/listings/1/bids"
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5"
              >
                View Sealed Bids <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-xs text-on-surface font-semibold hover:bg-surface-container-highest"
              >
                Register Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel-l1 rounded-xl p-6 border border-outline-variant/30 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  Housing Society Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="text"
                    required
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  Location & PIN Code
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  Usable Rooftop Area (Sq Ft)
                </label>
                <input
                  type="text"
                  required
                  value={rooftopArea}
                  onChange={(e) => setRooftopArea(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  Sanctioned Common Meter Load (kVA)
                </label>
                <input
                  type="text"
                  required
                  value={sanctionedLoad}
                  onChange={(e) => setSanctionedLoad(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  DISCOM Supply Circle
                </label>
                <select
                  value={discomCircle}
                  onChange={(e) => setDiscomCircle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Adani Electricity - Mumbai Suburban">Adani Electricity - Mumbai Suburban</option>
                  <option value="MSEDCL - MMR Thane/Navi Mumbai">MSEDCL - MMR Thane/Navi Mumbai</option>
                  <option value="Tata Power - Mumbai Distribution">Tata Power - Mumbai Distribution</option>
                  <option value="BEST - Island City">BEST - Island City</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5">
                  Target Capacity (kWp)
                </label>
                <div className="relative">
                  <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={estimatedCapacity}
                    onChange={(e) => setEstimatedCapacity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="border border-dashed border-outline-variant/40 rounded-xl p-5 text-center bg-surface-container-lowest/50 hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-on-surface-variant/60 mb-2" />
              <p className="text-xs text-on-surface font-medium">
                Upload Structural Fitness Certificate & Electricity Bill (PDF/JPG)
              </p>
              <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                Encrypted and securely held in SGX enclave until blind auction closes.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Sun className="w-4 h-4 text-primary" />
                <span>Estimated annual RWA lease yield: <strong className="text-primary font-mono">₹4.2 Lakhs</strong></span>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-glow"
              >
                Submit Rooftop to Blind Auction <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
