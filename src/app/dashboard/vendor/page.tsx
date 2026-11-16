"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Sun,
  Zap,
  Lock,
  ShieldCheck,
  Building2,
  MapPin,
  RotateCw,
  Clock,
  ArrowUpRight,
  Eye,
  X,
  ExternalLink,
  FileText,
  Check,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Layers,
  Grid,
  List,
  Sparkles,
  SlidersHorizontal,
  Search,
  Key,
  BadgeCheck,
  AlertCircle,
  TrendingUp,
  Receipt,
  Trash2,
} from "lucide-react";

interface Listing {
  id: string;
  society: string;
  locality: string;
  city: string;
  usableArea: number;
  sunlight: number;
  capacityKwp: number;
  shadowAssessment: number;
  discomTariff: number;
  targetRescoMin: number;
  targetRescoMax: number;
  engineeringNote: string;
  verificationBadge: string;
  hasBid: boolean;
  bidTariff?: number;
  bidTime?: string;
  bidStatus?: string;
}

export default function VendorDashboardPage() {
  // View mode: Grid vs List
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("Mira Road West, Thane");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("5000-10000");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Proposal Drawer state
  const [selectedListingForBid, setSelectedListingForBid] = useState<Listing | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [commercialStructure, setCommercialStructure] = useState("resco");
  const [proposedTariff, setProposedTariff] = useState("3.25");
  const [proposedKwp, setProposedKwp] = useState(75);
  const [executionTimeline, setExecutionTimeline] = useState("4w");
  const [hardwareNotes, setHardwareNotes] = useState(
    "Tier-1 540Wp bifacial solar panels, SMA Sunny Tripower string inverter with 10-year warranty, automated robotic cleaning schedule included."
  );
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Receipt Modal state
  const [receiptListing, setReceiptListing] = useState<Listing | null>(null);

  // Listings mock data
  const [listings, setListings] = useState<Listing[]>([
    {
      id: "#RF-9042",
      society: "Shree Ganesh CHS",
      locality: "Mira Road West, Thane (MMR)",
      city: "Thane",
      usableArea: 8400,
      sunlight: 1750,
      capacityKwp: 75,
      shadowAssessment: 98.2,
      discomTariff: 7.8,
      targetRescoMin: 3.1,
      targetRescoMax: 3.4,
      engineeringNote:
        "Flat concrete roof, zero shadow obstruction between 09:00–17:00. Dedicated cable risers to LT panel.",
      verificationBadge: "Google Maps Solar Verified",
      hasBid: false,
    },
    {
      id: "#RF-8821",
      society: "Green Meadows CHS",
      locality: "Tower A & B, Mira Road (E), Thane",
      city: "Thane",
      usableArea: 12400,
      sunlight: 1820,
      capacityKwp: 110,
      shadowAssessment: 99.1,
      discomTariff: 7.8,
      targetRescoMin: 3.1,
      targetRescoMax: 3.4,
      engineeringNote:
        "RCC parapet with dual elevator machine room clearance. Verified structural load bearing: 180 kg/m².",
      verificationBadge: "RWA Self-Reported & Drone Verified",
      hasBid: true,
      bidTariff: 3.25,
      bidTime: "Submitted 2 days ago",
      bidStatus: "PENDING",
    },
    {
      id: "#RF-9104",
      society: "Sagar Deep Co-Op Society",
      locality: "Vashi Sector 17, Navi Mumbai",
      city: "Navi Mumbai",
      usableArea: 6200,
      sunlight: 1720,
      capacityKwp: 55,
      shadowAssessment: 97.4,
      discomTariff: 8.1,
      targetRescoMin: 3.2,
      targetRescoMax: 3.5,
      engineeringNote:
        "Minimal east shadow till 08:30, unobstructed 09:00–17:30. Adani Net-meter feeder ready on 3rd floor shaft.",
      verificationBadge: "Google Maps Solar Verified",
      hasBid: false,
    },
    {
      id: "#RF-9218",
      society: "Sea Breeze CHS",
      locality: "Bandra West, Mumbai Coastal",
      city: "Mumbai",
      usableArea: 15200,
      sunlight: 1840,
      capacityKwp: 135,
      shadowAssessment: 98.9,
      discomTariff: 8.4,
      targetRescoMin: 3.3,
      targetRescoMax: 3.6,
      engineeringNote:
        "High-wind maritime load reinforced parapet. Dual 63A interconnection sanction letter approved by Adani Electricity.",
      verificationBadge: "Adani Feasibility Pre-Sanctioned",
      hasBid: false,
    },
    {
      id: "#RF-9280",
      society: "Palm Grove Enclave",
      locality: "Ghodbunder Road, Thane West",
      city: "Thane",
      usableArea: 9800,
      sunlight: 1760,
      capacityKwp: 85,
      shadowAssessment: 96.8,
      discomTariff: 7.9,
      targetRescoMin: 3.15,
      targetRescoMax: 3.45,
      engineeringNote:
        "3 interconnected wing terraces with dedicated internal staircase access and earthing pit provision.",
      verificationBadge: "DISCOM Form 1 Vetted",
      hasBid: false,
    },
    {
      id: "#RF-9345",
      society: "Galaxy Heights",
      locality: "Kharghar Sector 20, Navi Mumbai",
      city: "Navi Mumbai",
      usableArea: 11000,
      sunlight: 1790,
      capacityKwp: 95,
      shadowAssessment: 97.9,
      discomTariff: 8.0,
      targetRescoMin: 3.2,
      targetRescoMax: 3.5,
      engineeringNote:
        "Unobstructed hill-facing terrace with high solar irradiance index. MSEDCL express net-metering line ready.",
      verificationBadge: "Google Maps Solar Verified",
      hasBid: false,
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleOpenBidDrawer = (listing: Listing) => {
    setSelectedListingForBid(listing);
    setProposedKwp(listing.capacityKwp);
    setProposedTariff(((listing.targetRescoMin + listing.targetRescoMax) / 2).toFixed(2));
    setBidSuccess(false);
    setIsDrawerOpen(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForBid) return;

    setIsSubmittingBid(true);

    setTimeout(() => {
      // Mark listing as having a bid
      setListings((prev) =>
        prev.map((l) =>
          l.id === selectedListingForBid.id
            ? {
                ...l,
                hasBid: true,
                bidTariff: parseFloat(proposedTariff),
                bidTime: "Just now",
                bidStatus: "PENDING",
              }
            : l
        )
      );

      setIsSubmittingBid(false);
      setBidSuccess(true);

      setTimeout(() => {
        setIsDrawerOpen(false);
        setBidSuccess(false);
      }, 1200);
    }, 1100);
  };

  const handleWithdrawBid = (id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              hasBid: false,
              bidTariff: undefined,
              bidTime: undefined,
              bidStatus: undefined,
            }
          : l
      )
    );
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.society.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === "All Cities" || l.city === selectedCity;

    let matchesArea = true;
    if (selectedAreaFilter === "under-8000") {
      matchesArea = l.usableArea < 8000;
    } else if (selectedAreaFilter === "5000-10000") {
      matchesArea = l.usableArea >= 5000 && l.usableArea <= 10000;
    } else if (selectedAreaFilter === "above-10000") {
      matchesArea = l.usableArea > 10000;
    }

    return matchesSearch && matchesCity && matchesArea;
  });

  return (
    <DashboardLayout
      title="Solar EPC Vendor Terminal"
      subtitle="SunPower Tech Pvt Ltd — MMR Grid Allocation Desk (ID: EPC-9942)"
    >
      <div className="flex flex-col gap-6 relative">
        {/* Subtle Ambient Background Radiance */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[320px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-96 right-10 w-[450px] h-[300px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* 1. TOP IDENTITY & PROCUREMENT METRICS BAND */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel-l1 p-5 rounded-xl border border-outline-variant/30 shadow-md">
          {/* Identity Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
                EPC Terminal • V-05 / V-06 / V-07
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Empanelled Tier-1 EPC Vendor #EPC-9942
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                SunPower Tech Pvt Ltd
              </h1>
              <span className="font-mono text-xs text-on-surface-variant">
                MMR Grid Allocation Desk
              </span>
            </div>
          </div>

          {/* Quick Action Right Group */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-on-surface-variant leading-none uppercase">
                  SGX Enclave
                </span>
                <span className="font-mono text-xs text-secondary font-bold leading-tight">
                  ACTIVE • SECURED
                </span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <RotateCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Pool</span>
            </button>
          </div>
        </div>

        {/* 2. QUICK STATS RIBBON (4 FINANCIAL & OPERATIONAL TILES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Live Verified Listings */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Live Verified Listings
              </span>
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">
                14
              </span>
              <span className="font-mono text-xs text-primary uppercase font-semibold">
                Available
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>MMR Region Target</span>
              <span className="text-primary font-medium">96.4% Geo-Audited</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
          </div>

          {/* Stat 2: Active Blind Bids */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Active Blind Bids
              </span>
              <Lock className="w-4 h-4 text-secondary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-secondary tracking-tight">
                3
              </span>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">
                In Enclave
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Lead Portfolio Avg</span>
              <span className="text-on-surface font-semibold">₹3.25/kWh</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-secondary/5 group-hover:bg-secondary/10 transition-colors pointer-events-none" />
          </div>

          {/* Stat 3: DISCOM Sanction Time */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                DISCOM Sanction Time
              </span>
              <Zap className="w-4 h-4 text-tertiary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-tertiary tracking-tight">
                8.4
              </span>
              <span className="font-mono text-xs text-tertiary uppercase font-semibold">
                Days Avg
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Adani / MSEDCL SLA</span>
              <span className="text-tertiary font-medium">Fast-Track PPA</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-tertiary/5 group-hover:bg-tertiary/10 transition-colors pointer-events-none" />
          </div>

          {/* Stat 4: Enclave Security */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
                Enclave Security
              </span>
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-primary tracking-tight">
                256-Bit SGX
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Cryptographic State</span>
              <span className="text-primary font-medium">Sealed &amp; Timelocked</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
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
                placeholder="Search by city, locality, or society name..."
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/40 placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary shadow-inner"
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
            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              {/* City Filter */}
              <div className="flex-1 min-w-[130px]">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="All Cities">City: All Cities</option>
                  <option value="Thane">City: Thane</option>
                  <option value="Mumbai">City: Mumbai</option>
                  <option value="Navi Mumbai">City: Navi Mumbai</option>
                </select>
              </div>

              {/* Min Area Filter */}
              <div className="flex-1 min-w-[150px]">
                <select
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary/15 text-primary text-xs border border-primary/30 focus:outline-none focus:border-primary font-medium cursor-pointer"
                >
                  <option value="all">Area: All Sizes</option>
                  <option value="under-8000">Area: &lt; 8,000 sq.ft</option>
                  <option value="5000-10000">Area: 5,000–10,000 sq.ft</option>
                  <option value="above-10000">Area: &gt; 10,000 sq.ft</option>
                </select>
              </div>

              {/* Commercial Model Filter */}
              <div className="flex-1 min-w-[140px]">
                <select className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer">
                  <option>All Models (RESCO/Capex)</option>
                  <option>RESCO PPA Model</option>
                  <option>Capex Turnkey Model</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Status Counter & View Toggles */}
          <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-on-surface-variant">
                Showing <strong className="text-on-surface font-semibold">{filteredListings.length} High-Yield Rooftop Opportunities</strong> • MMR North &amp; West Circle
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="flex items-center p-0.5 rounded-lg bg-surface-container border border-outline-variant/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-surface-bright text-primary font-semibold shadow-sm border border-primary/30"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  type="button"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-surface-bright text-primary font-semibold shadow-sm border border-primary/30"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  type="button"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
              <span className="font-mono text-[11px] text-on-surface-variant/60">Updated 4m ago</span>
            </div>
          </div>
        </div>

        {/* 4. MARKETPLACE LISTING CONTAINER (GRID OR LIST VIEW) */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredListings.map((listing) => (
              <article
                key={listing.id}
                className="rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-xl p-5 flex flex-col justify-between gap-4 hover:border-outline-variant/60 hover:shadow-2xl transition-all"
              >
                {/* Top Status Bar & Identity */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[11px] uppercase font-semibold tracking-wider ${
                        listing.hasBid ? "text-secondary" : "text-primary"
                      }`}
                    >
                      Listing {listing.id}
                    </span>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                        listing.hasBid
                          ? "bg-secondary-container/20 text-secondary border border-secondary/30"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          listing.hasBid ? "bg-secondary animate-pulse" : "bg-primary animate-ping"
                        }`}
                      />
                      <span>{listing.hasBid ? "BID SUBMITTED — IN REVIEW" : "LIVE — Open for Bids"}</span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-on-surface tracking-tight">
                        {listing.society}
                      </h2>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                        <span>{listing.locality}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-on-surface border border-outline-variant/20">
                      {listing.city}
                    </span>
                  </div>
                </div>

                {/* Satellite Imagery Visual Box with HUD Tags */}
                <div className="w-full h-44 rounded-lg overflow-hidden relative group bg-surface-container-lowest border border-outline-variant/30">
                  {/* High tech abstract blueprint / roof graphic */}
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-[#081822] flex items-center justify-center">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-4 left-6 right-6 bottom-4 border border-dashed border-primary/30 rounded" />
                      <div className="absolute top-10 left-12 w-24 h-16 bg-surface-container-highest/60 rounded" />
                      <div className="absolute bottom-8 right-12 w-28 h-20 bg-surface-container-highest/60 rounded" />
                    </div>
                  </div>

                  {/* Verification Tag Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/85 backdrop-blur-md border border-outline-variant/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-[10px] text-primary font-medium uppercase tracking-wider">
                      {listing.verificationBadge}
                    </span>
                  </div>

                  {/* Usable Area Pin Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-surface-container-lowest/85 backdrop-blur-md font-mono text-[10px] text-on-surface flex items-center gap-1.5 border border-outline-variant/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Shadow Assessment: {listing.shadowAssessment}%</span>
                  </div>
                </div>

                {/* 3-Box Metric Highlights Grid */}
                <div className="grid grid-cols-3 gap-1 p-2 rounded-lg bg-surface-container border border-outline-variant/20 text-center">
                  <div className="flex flex-col py-1">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">Usable Area</span>
                    <span className="font-mono text-base font-bold text-on-surface mt-0.5">
                      {listing.usableArea.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">sq. ft.</span>
                  </div>
                  <div className="flex flex-col py-1 border-x border-outline-variant/20">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">Sunlight</span>
                    <span className="font-mono text-base font-bold text-secondary mt-0.5">
                      {listing.sunlight.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">kWh/m²</span>
                  </div>
                  <div className="flex flex-col py-1">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">Est. Capacity</span>
                    <span className="font-mono text-base font-bold text-primary mt-0.5">
                      {listing.capacityKwp}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">kWp</span>
                  </div>
                </div>

                {/* Structural Shade Note */}
                <div className="p-2.5 rounded-lg bg-surface-container-high/60 border border-outline-variant/20 flex items-start gap-2 text-xs">
                  <Sun className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <p className="text-on-surface-variant leading-snug">{listing.engineeringNote}</p>
                </div>

                {/* Benchmark Economics */}
                <div className="flex items-center justify-between text-on-surface-variant font-mono text-xs pt-1">
                  <span>DISCOM Grid: <strong className="text-on-surface">₹{listing.discomTariff.toFixed(2)}/kWh</strong></span>
                  <span>Target RESCO: <strong className="text-primary font-semibold">₹{listing.targetRescoMin.toFixed(2)} – ₹{listing.targetRescoMax.toFixed(2)}/kWh</strong></span>
                </div>

                {/* Conditional Actions based on Bid Status */}
                {listing.hasBid ? (
                  /* [V-09] Submitted Bid View Module */
                  <div className="p-3 rounded-lg bg-surface-container border border-secondary/30 flex flex-col gap-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase font-medium">
                        My Submitted Bid
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary font-mono text-[10px] uppercase font-bold border border-secondary/30">
                        {listing.bidStatus}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-on-surface-variant">RESCO Tariff</span>
                        <span className="font-heading text-lg font-bold text-on-surface">
                          ₹{listing.bidTariff?.toFixed(2)}{" "}
                          <span className="font-mono text-xs text-on-surface-variant font-normal">/ kWh</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-on-surface-variant">Enclave State</span>
                        <p className="font-mono text-xs text-secondary font-medium">{listing.bidTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 font-mono text-xs">
                      <button
                        onClick={() => handleWithdrawBid(listing.id)}
                        className="text-error hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Withdraw Bid</span>
                      </button>
                      <button
                        onClick={() => setReceiptListing(listing)}
                        className="text-primary hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>View Encrypted Receipt</span>
                      </button>
                    </div>

                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-lg bg-surface-container-high text-on-surface-variant font-heading text-xs font-semibold flex items-center justify-center gap-2 border border-outline-variant/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      <span>You Already Bid — Locked in SGX</span>
                    </button>
                  </div>
                ) : (
                  /* Standard Proposal Trigger */
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="px-2.5 py-1.5 rounded bg-surface-container flex items-center justify-center gap-1.5 text-on-surface-variant font-mono text-[10px] border border-outline-variant/20">
                      <Lock className="w-3 h-3 text-secondary" />
                      <span>Committee contact details revealed upon bid acceptance.</span>
                    </div>

                    <button
                      onClick={() => handleOpenBidDrawer(listing)}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on font-heading text-xs font-bold flex items-center justify-center gap-2 shadow-glow hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Submit Blind Proposal</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-xl glass-panel-l2 border border-outline-variant/30 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-container font-mono text-[11px] text-outline uppercase border-b border-outline-variant/20">
                  <tr>
                    <th className="p-3.5">Listing ID &amp; Society</th>
                    <th className="p-3.5">City / Locality</th>
                    <th className="p-3.5">Usable Area</th>
                    <th className="p-3.5">Capacity</th>
                    <th className="p-3.5">DISCOM Grid</th>
                    <th className="p-3.5">Target RESCO</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {filteredListings.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-on-surface">{l.society}</span>
                          <span className="font-mono text-[10px] text-primary">{l.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-on-surface-variant">{l.locality}</td>
                      <td className="p-3.5 font-mono">{l.usableArea.toLocaleString()} sq.ft</td>
                      <td className="p-3.5 font-mono text-primary font-bold">{l.capacityKwp} kWp</td>
                      <td className="p-3.5 font-mono">₹{l.discomTariff.toFixed(2)}/kWh</td>
                      <td className="p-3.5 font-mono text-secondary">
                        ₹{l.targetRescoMin.toFixed(2)} - ₹{l.targetRescoMax.toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                            l.hasBid
                              ? "bg-secondary/15 text-secondary border border-secondary/30"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {l.hasBid ? "Bid Submitted" : "Open for Bids"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {l.hasBid ? (
                          <button
                            onClick={() => setReceiptListing(l)}
                            className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-highest text-secondary text-xs font-mono font-medium border border-outline-variant/30"
                          >
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenBidDrawer(l)}
                            className="px-3 py-1.5 rounded bg-primary text-primary-on hover:brightness-110 text-xs font-mono font-bold shadow-sm"
                          >
                            Bid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. BLIND PROPOSAL SLIDE-OVER DRAWER ([V-07]) */}
      <aside
        aria-label="Submit Blind Proposal Drawer"
        className={`fixed inset-y-0 right-0 w-full max-w-xl z-50 bg-surface-container-lowest/95 backdrop-blur-2xl border-l border-outline-variant/40 shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-surface-container-low border-b border-outline-variant/30 flex items-start justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest">
                Enclave Encrypted Submission
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-on-surface tracking-tight">
              Submit Blind Bid for Listing {selectedListingForBid?.id}
            </h3>
            <p className="text-xs text-on-surface-variant font-sans">
              {selectedListingForBid?.society} • {selectedListingForBid?.usableArea.toLocaleString()} sq.ft Usable Terrace • {selectedListingForBid?.capacityKwp} kWp Target
            </p>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmitBid} className="p-6 flex flex-col gap-5 flex-1 text-xs">
          {/* 1. Commercial Structure */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-on-surface uppercase font-semibold text-[11px] tracking-wider">
              1. Proposal Commercial Structure
            </label>
            <select
              value={commercialStructure}
              onChange={(e) => setCommercialStructure(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary cursor-pointer shadow-inner"
            >
              <option value="resco">RESCO Revenue Share (Zero Capex for Society)</option>
              <option value="capex">Capex Purchase (Direct EPC Turnkey Contract)</option>
              <option value="subscription">Subscription Model (Fixed Solar Monthly Rental)</option>
            </select>
            <span className="text-[11px] text-on-surface-variant">
              Recommended for Thane &amp; MMR RWA societies seeking instant power bill waiver.
            </span>
          </div>

          {/* 2. Proposed Commercial Tariff Rate */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-on-surface uppercase font-semibold text-[11px] tracking-wider">
                2. Proposed Commercial Tariff Rate
              </label>
              <span className="font-mono text-[11px] text-secondary">
                DISCOM Benchmark: ₹{selectedListingForBid?.discomTariff.toFixed(2)}/kWh
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.05"
                min="2.0"
                max="6.0"
                value={proposedTariff}
                onChange={(e) => setProposedTariff(e.target.value)}
                className="w-full pl-3 pr-28 py-2.5 rounded-lg bg-surface-container text-on-surface font-mono text-sm border border-outline-variant/40 focus:outline-none focus:border-primary shadow-inner tracking-wide"
              />
              <span className="absolute right-3 font-mono text-[10px] text-primary uppercase font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                Sealed Term (₹/kWh)
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Proposed fixed PPA rate to society for 25-year tenure with 2% annual escalation index.
            </p>
          </div>

          {/* 3. Proposed System Size & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-on-surface uppercase font-semibold text-[11px] tracking-wider">
                3. Proposed System Size
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={proposedKwp}
                  onChange={(e) => setProposedKwp(Number(e.target.value))}
                  className="w-full pl-3 pr-12 py-2.5 rounded-lg bg-surface-container text-on-surface font-mono text-sm border border-outline-variant/40 focus:outline-none focus:border-primary shadow-inner"
                />
                <span className="absolute right-3 font-mono text-xs text-on-surface-variant pointer-events-none">
                  kWp
                </span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">
                Tier-1 Mono-PERC Modules
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-on-surface uppercase font-semibold text-[11px] tracking-wider">
                4. Execution Timeline
              </label>
              <select
                value={executionTimeline}
                onChange={(e) => setExecutionTimeline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary cursor-pointer shadow-inner"
              >
                <option value="2w">2 Weeks (Fast Track)</option>
                <option value="4w">4 Weeks (Standard DISCOM)</option>
                <option value="8w">8 Weeks (Extended Grid Work)</option>
              </select>
              <span className="font-mono text-[10px] text-on-surface-variant">
                Including net-meter testing
              </span>
            </div>
          </div>

          {/* 5. Technical Note */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-on-surface uppercase font-semibold text-[11px] tracking-wider">
              5. Technical Architecture &amp; Hardware Note
            </label>
            <textarea
              rows={3}
              value={hardwareNotes}
              onChange={(e) => setHardwareNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/40 leading-relaxed focus:outline-none focus:border-primary shadow-inner resize-none text-xs font-sans"
            />
            <span className="text-[11px] text-on-surface-variant">
              Visible in committee review dossier along with your EPC ISO certifications.
            </span>
          </div>

          {/* Confidentiality Guaranteed Enclave Card */}
          <div className="p-4 rounded-xl bg-surface-container-high/90 border border-primary/30 shadow-md flex items-start gap-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-xs font-bold text-primary">
                Confidentiality Guaranteed
              </span>
              <p className="text-[11px] text-on-surface leading-relaxed">
                Your commercial terms are encrypted in an SGX Hardware Enclave and are completely invisible to rival vendors. Only the verified housing committee can decrypt your bid once the tender window concludes.
              </p>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingBid}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on text-xs font-bold flex items-center justify-center gap-2 shadow-glow hover:brightness-110 transition-all cursor-pointer"
            >
              {isSubmittingBid ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Encrypting Enclave Payload...</span>
                </>
              ) : bidSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bid Sealed &amp; Anchored!</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Submit Confidential Bid</span>
                </>
              )}
            </button>
          </div>
        </form>
      </aside>

      {/* Backdrop Veil for Drawer */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* MODAL: ENCRYPTED BID RECEIPT */}
      {receiptListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-bold text-base text-on-surface">
                  SGX Enclave Cryptographic Bid Receipt
                </h3>
              </div>
              <button
                onClick={() => setReceiptListing(null)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-mono flex flex-col gap-2.5">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Listing Target:</span>
                <strong className="text-on-surface">{receiptListing.society} ({receiptListing.id})</strong>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Vendor Identity:</span>
                <strong className="text-on-surface">SunPower Tech Pvt Ltd (#EPC-9942)</strong>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Sealed Commercial Rate:</span>
                <strong className="text-secondary">₹{receiptListing.bidTariff?.toFixed(2)} / kWh (RESCO)</strong>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant">Enclave Timelock Status:</span>
                <strong className="text-primary">SEALED (Closes in 3 Days)</strong>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] text-outline uppercase">SHA-256 Enclave Verification Hash:</span>
                <span className="p-2 bg-surface-container-lowest rounded text-[10px] text-primary break-all border border-outline-variant/20">
                  0x8f3c71a92e4b016d9482ca5e01b79412f8a42bc7d10e8549fca31792bc4a89e1
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setReceiptListing(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
