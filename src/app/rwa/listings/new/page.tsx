"use client";

import React, { useState, useEffect } from "react";
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
  RotateCw,
  Compass,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";

export default function ListNewRooftopPage() {
  const [societyName, setSocietyName] = useState("Emerald Heights CHS");
  const [location, setLocation] = useState("Kandivali West, Mumbai, MH");
  const [latitude, setLatitude] = useState("19.2045");
  const [longitude, setLongitude] = useState("72.8376");
  const [manualFallback, setManualFallback] = useState(false);
  const [rooftopArea, setRooftopArea] = useState("14,500");
  const [sanctionedLoad, setSanctionedLoad] = useState("180");
  const [discomCircle, setDiscomCircle] = useState("Adani Electricity - Mumbai Suburban");
  const [estimatedCapacity, setEstimatedCapacity] = useState("116");
  const [isFetchingSolar, setIsFetchingSolar] = useState(false);
  const [solarData, setSolarData] = useState<any>(null);
  const [solarNotice, setSolarNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Fetch solar insights from /api/solar
  const handleFetchSolarData = async (forceFallback = manualFallback) => {
    setIsFetchingSolar(true);
    setSolarNotice(null);

    try {
      const lat = parseFloat(latitude) || 19.2045;
      const lng = parseFloat(longitude) || 72.8376;

      const res = await fetch(`/api/solar?lat=${lat}&lng=${lng}&fallback=${forceFallback}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch solar data");
      }

      setSolarData(data.solarData);

      // Auto-populate form fields from Google Maps Solar API / Engine
      if (data.solarData?.usableRoofAreaSqFt) {
        setRooftopArea(data.solarData.usableRoofAreaSqFt.toLocaleString());
      }
      if (data.solarData?.solarPotentialKwp) {
        setEstimatedCapacity(data.solarData.solarPotentialKwp.toString());
      }

      if (data.fallback) {
        setSolarNotice(
          `Data generated via ${data.solarData?.dataSource || "High-Precision Fallback Engine"} (${data.fallbackReason || "Fallback mode active"})`
        );
      } else {
        setSolarNotice("Successfully fetched live building insights from Google Maps Solar API!");
      }
    } catch (err: any) {
      console.error("Solar potential fetch error:", err);
      setSolarNotice(`Error: ${err.message}. Using default regional baseline.`);
    } finally {
      setIsFetchingSolar(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    handleFetchSolarData(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const cleanArea = parseFloat(rooftopArea.replace(/,/g, "")) || 14500;

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societyName,
          area: cleanArea,
          location,
          city: "Mumbai",
          status: "ACTIVE",
          societyDetails: `Sanctioned Load: ${sanctionedLoad} kVA, DISCOM: ${discomCircle}, Solar Potential: ${estimatedCapacity} kWp`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      setCreatedListingId(data.listing?.id || "RT-4032");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Listing creation error:", err);
      setSubmitError(err.message || "Failed to register rooftop listing");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* GOOGLE MAPS SOLAR API INTEGRATION CALLOUT CARD */}
        <div className="glass-panel-l2 rounded-xl p-5 border border-primary/30 shadow-md flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface flex items-center gap-2">
                  Google Maps Solar API Feasibility Check
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    buildingInsights:findClosest
                  </span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Calculates rooftop boundary polygons, irradiance, and peak system capacity (kWp).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const newFallback = !manualFallback;
                  setManualFallback(newFallback);
                  handleFetchSolarData(newFallback);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  manualFallback
                    ? "bg-secondary/20 text-secondary border-secondary/40 font-bold"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface"
                }`}
              >
                {manualFallback ? "Manual Fallback: ON" : "Manual Fallback: OFF"}
              </button>
              <button
                type="button"
                onClick={() => handleFetchSolarData(manualFallback)}
                disabled={isFetchingSolar}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-on text-xs font-bold flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isFetchingSolar ? "animate-spin" : ""}`} />
                <span>{isFetchingSolar ? "Querying..." : "Scan Coordinates"}</span>
              </button>
            </div>
          </div>

          {/* Coordinates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase">
                Latitude Coordinates
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 19.2045"
                className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase">
                Longitude Coordinates
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 72.8376"
                className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {solarNotice && (
            <div className="text-[11px] font-mono text-primary flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{solarNotice}</span>
            </div>
          )}

          {/* Solar Metrics Grid from API */}
          {solarData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 font-mono text-xs">
              <div>
                <span className="text-[10px] text-outline uppercase block">Usable Roof Area</span>
                <span className="font-bold text-on-surface">{solarData.usableRoofAreaSqFt?.toLocaleString()} sq.ft</span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Peak System Capacity</span>
                <span className="font-bold text-secondary">{solarData.solarPotentialKwp} kWp</span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Annual Sunshine</span>
                <span className="font-bold text-on-surface">{solarData.maxSunshineHoursPerYear} hrs/yr</span>
              </div>
              <div>
                <span className="text-[10px] text-outline uppercase block">Annual CO2 Offset</span>
                <span className="font-bold text-primary">~{(solarData.carbonOffsetKgPerYear / 1000).toFixed(1)} Tons</span>
              </div>
            </div>
          )}
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
              Your rooftop listing <code className="text-primary font-mono font-bold">#{createdListingId}</code> has been synced with PostgreSQL and broadcast to empanelled EPC contractors across the MMR grid circle.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/dashboard/rwa"
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5"
              >
                View RWA Dashboard <ArrowRight className="w-3.5 h-3.5" />
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
            {submitError && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
                {submitError.toLowerCase().includes("authentication") && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-on rounded-md font-sans text-xs font-bold hover:brightness-110 shrink-0"
                  >
                    Sign In or Create Account &rarr;
                  </Link>
                )}
              </div>
            )}

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
                  Location &amp; PIN Code
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
                Upload Structural Fitness Certificate &amp; Electricity Bill (PDF/JPG)
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
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-glow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Registering Rooftop...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Rooftop to Blind Auction</span>
                    <ArrowRight className="w-4 h-4" />
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
