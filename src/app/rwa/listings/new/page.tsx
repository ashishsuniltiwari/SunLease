"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Sparkles,
  AlertCircle,
  BookmarkCheck,
  Info,
  BadgeAlert,
} from "lucide-react";

export default function ListNewRooftopPage() {
  const router = useRouter();

  // Basic Information
  const [societyName, setSocietyName] = useState("Emerald Heights CHS");
  const [location, setLocation] = useState("Kandivali West, Mumbai, MH");
  const [latitude, setLatitude] = useState("19.2045");
  const [longitude, setLongitude] = useState("72.8376");
  const [manualFallback, setManualFallback] = useState(false);

  // Specifications
  const [rooftopArea, setRooftopArea] = useState("14,500");
  const [sanctionedLoad, setSanctionedLoad] = useState("180");
  const [discomCircle, setDiscomCircle] = useState("Adani Electricity - Mumbai Suburban");
  const [estimatedCapacity, setEstimatedCapacity] = useState("116");

  // Track initial Solar API baseline to detect manual society overrides
  const [apiScannedArea, setApiScannedArea] = useState<string>("14,500");
  const [apiScannedCapacity, setApiScannedCapacity] = useState<string>("116");
  const [areaOverridden, setAreaOverridden] = useState(false);
  const [capacityOverridden, setCapacityOverridden] = useState(false);

  // API State
  const [isFetchingSolar, setIsFetchingSolar] = useState(false);
  const [solarData, setSolarData] = useState<any>(null);
  const [solarNotice, setSolarNotice] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [createdStatus, setCreatedStatus] = useState<"DRAFT" | "LIVE">("LIVE");
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
        const areaStr = data.solarData.usableRoofAreaSqFt.toLocaleString();
        setRooftopArea(areaStr);
        setApiScannedArea(areaStr);
        setAreaOverridden(false);
      }
      if (data.solarData?.solarPotentialKwp) {
        const capStr = data.solarData.solarPotentialKwp.toString();
        setEstimatedCapacity(capStr);
        setApiScannedCapacity(capStr);
        setCapacityOverridden(false);
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

  useEffect(() => {
    handleFetchSolarData(false);
  }, []);

  // Detect manual overrides
  const handleAreaChange = (val: string) => {
    setRooftopArea(val);
    setAreaOverridden(val.trim() !== apiScannedArea.trim());
  };

  const handleCapacityChange = (val: string) => {
    setEstimatedCapacity(val);
    setCapacityOverridden(val.trim() !== apiScannedCapacity.trim());
  };

  // Submit Listing as either DRAFT or LIVE
  const handleFormSubmit = async (targetStatus: "DRAFT" | "LIVE") => {
    setIsSubmitting(true);
    setSubmitError(null);

    const cleanAreaSqFt = parseFloat(rooftopArea.replace(/,/g, "")) || 14500;
    const cleanAreaSqm = Math.round(cleanAreaSqFt * 0.092903 * 10) / 10;
    const cleanKw = parseFloat(estimatedCapacity) || Math.round(cleanAreaSqFt / 115);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societyName,
          area: cleanAreaSqFt,
          usable_area_sqm: cleanAreaSqm,
          sunlight_hours_yr: solarData?.maxSunshineHoursPerYear || 1780,
          estimated_kw: cleanKw,
          data_source: areaOverridden || capacityOverridden ? "MANUAL_OVERRIDE" : "GOOGLE_SOLAR",
          location,
          city: "Mumbai",
          status: targetStatus,
          societyDetails: `Sanctioned Load: ${sanctionedLoad} kVA, DISCOM: ${discomCircle}, Solar Potential: ${estimatedCapacity} kWp`,
          shade_note: areaOverridden ? "Rooftop area manually customized by Society RWA." : "Standard shadow profile verified via satellite imaging.",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      setCreatedListingId(data.listing?.id || "RT-4032");
      setCreatedStatus(targetStatus);
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
                R-02 · RWA ROOFTOP ONBOARDING
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
              {createdStatus === "DRAFT"
                ? "Rooftop Listing Saved as Private Draft!"
                : "Rooftop Successfully Published to Live Blind Auction!"}
            </h2>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Listing <code className="text-primary font-mono font-bold">#{createdListingId}</code> has been saved with status{" "}
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                createdStatus === "DRAFT" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
              }`}>
                {createdStatus}
              </span>.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href={`/rwa/listings/${createdListingId}`}
                className="px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-glow"
              >
                <span>Manage Listing (R-04)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/rwa"
                className="px-4 py-2 rounded-lg bg-surface-container-high text-xs text-on-surface font-semibold hover:bg-surface-container-highest"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:text-on-surface"
              >
                Register Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit("LIVE"); }} className="glass-panel-l1 rounded-xl p-6 border border-outline-variant/30 space-y-6">
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
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5 font-semibold">
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
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5 font-semibold">
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

              {/* Usable Area with Manual Override Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-on-surface-variant font-semibold">
                    Usable Rooftop Area (Sq Ft)
                  </label>
                  {areaOverridden && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
                      <BadgeAlert className="w-3 h-3" />
                      Entered by the society
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={rooftopArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none font-mono border ${
                    areaOverridden ? "border-secondary/60 focus:border-secondary" : "border-outline-variant/30 focus:border-primary"
                  }`}
                />
                <span className="text-[10px] text-outline mt-1 block">
                  Scanned baseline: {apiScannedArea} sq.ft
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5 font-semibold">
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
                <label className="block text-xs font-mono text-on-surface-variant mb-1.5 font-semibold">
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

              {/* Target Capacity with Manual Override Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-on-surface-variant font-semibold">
                    Target Capacity (kWp)
                  </label>
                  {capacityOverridden && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
                      <BadgeAlert className="w-3 h-3" />
                      Entered by the society
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={estimatedCapacity}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none font-mono border ${
                      capacityOverridden ? "border-secondary/60 focus:border-secondary" : "border-outline-variant/30 focus:border-primary"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-outline mt-1 block">
                  Scanned baseline: {apiScannedCapacity} kWp
                </span>
              </div>
            </div>

            {/* R-03: ESTIMATE REVIEW CARD */}
            <div className="rounded-xl p-4 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  R-03 · Estimate Review &amp; Underwriting Audit
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  Source:{" "}
                  <strong className={areaOverridden || capacityOverridden ? "text-secondary" : "text-primary"}>
                    {areaOverridden || capacityOverridden ? "Manual Override" : "Google Solar API"}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-surface-container/40 p-3 rounded-lg border border-outline-variant/20">
                <div>
                  <span className="text-[10px] text-outline uppercase block">Gross Area</span>
                  <span className="font-bold text-on-surface">{rooftopArea} sq.ft</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Est. kWp</span>
                  <span className="font-bold text-secondary">{estimatedCapacity} kWp</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Annual Sunshine</span>
                  <span className="font-bold text-on-surface">{solarData?.maxSunshineHoursPerYear || 1780} hrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Est. Lease Earnings</span>
                  <span className="font-bold text-primary">₹{(Math.round(parseFloat(estimatedCapacity || "116") * 3200) / 100000).toFixed(1)} Lakhs/yr</span>
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

            {/* Action Bar: Save Draft vs Publish Live */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant self-start sm:self-auto">
                <Sun className="w-4 h-4 text-primary" />
                <span>Zero society capex; 25-year indexed lease.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Save Draft Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFormSubmit("DRAFT")}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <BookmarkCheck className="w-4 h-4 text-warning" />
                  <span>Save Draft</span>
                </button>

                {/* Publish Live Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Publish Live to Blind Auction</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
