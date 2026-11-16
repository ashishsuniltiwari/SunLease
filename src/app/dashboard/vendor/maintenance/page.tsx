"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Sun,
  Zap,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Wrench,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Terminal,
  History,
  Wifi,
  WifiOff,
  Save,
  Send,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Sliders,
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  FileText,
  Layers,
  Power,
  Filter,
  ArrowUpRight,
  UserCheck,
  X,
  ChevronDown,
  Check,
  TrendingUp,
  Radio,
  Gauge,
  Thermometer,
  ShieldCheck,
  Share2,
} from "lucide-react";

interface SiteProfile {
  id: string;
  name: string;
  capacity: string;
  client: string;
  location: string;
  contact: string;
  liveOutput: string;
  maxOutput: string;
  voltage: string;
  current: string;
  efficiency: string;
  hasFault: boolean;
  faultDesc?: string;
}

export default function VendorMaintenanceDeskPage() {
  // Monitored Sites
  const sites: SiteProfile[] = [
    {
      id: "#RF-8821",
      name: "Green Meadows Tower A",
      capacity: "50 kWp Rooftop Grid-Tie",
      client: "Green Meadows RWA",
      location: "Mira Road West, Thane (MMR)",
      contact: "+91 98200-XXXXX (Mr. R. Sharma, Secretary)",
      liveOutput: "42.6",
      maxOutput: "50 kW",
      voltage: "415 V",
      current: "59.2 A",
      efficiency: "97.8%",
      hasFault: true,
      faultDesc: "0.0 kW output anomaly detected during Peak Daylight window (GFDI Trip).",
    },
    {
      id: "#RF-9042",
      name: "Shree Ganesh CHS",
      capacity: "75 kWp Rooftop Grid-Tie",
      client: "Shree Ganesh Committee",
      location: "Mira Road West, Thane",
      contact: "+91 98199-XXXXX (Secretary Office)",
      liveOutput: "68.2",
      maxOutput: "75 kW",
      voltage: "415 V",
      current: "94.8 A",
      efficiency: "98.4%",
      hasFault: false,
    },
    {
      id: "#RF-9104",
      name: "Sagar Deep Co-Op Society",
      capacity: "55 kWp Commercial Rooftop",
      client: "Sagar Deep RWA",
      location: "Vashi Sector 17, Navi Mumbai",
      contact: "+91 97022-XXXXX (Facilities Mgr)",
      liveOutput: "49.1",
      maxOutput: "55 kW",
      voltage: "415 V",
      current: "68.5 A",
      efficiency: "97.6%",
      hasFault: false,
    },
    {
      id: "#RF-9218",
      name: "Sea Breeze CHS",
      capacity: "135 kWp High-Rise Array",
      client: "Sea Breeze Society Board",
      location: "Bandra West, Mumbai",
      contact: "+91 98210-XXXXX (Hon. Secretary)",
      liveOutput: "124.5",
      maxOutput: "135 kW",
      voltage: "415 V",
      current: "173.2 A",
      efficiency: "98.1%",
      hasFault: false,
    },
  ];

  const [selectedSiteId, setSelectedSiteId] = useState<string>("#RF-8821");
  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Segment Filter Tab state
  const [segmentFilter, setSegmentFilter] = useState<"all" | "faults" | "maintenance">("faults");

  // Telemetry Timeframe
  const [timeframe, setTimeframe] = useState<string>("Live 5s");

  // Remote Control Operating Regime
  const [operatingRegime, setOperatingRegime] = useState<"ONLINE" | "MAINTENANCE">("ONLINE");

  // Breaker Disconnect State
  const [isBreakerUnlocked, setIsBreakerUnlocked] = useState<boolean>(false);
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);
  const [mfaCode, setMfaCode] = useState<string>("");

  // Configuration Notes state
  const [configNotes, setConfigNotes] = useState<string>(
    "Inverter firmware updated to v2.4. Scheduled monthly cleaning on 20th Nov. String 2 pyranometer calibration completed."
  );
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Active Ticket Resolution State
  const [ticketResolved, setTicketResolved] = useState<boolean>(false);

  // Modals
  const [inverterLogModalOpen, setInverterLogModalOpen] = useState<boolean>(false);
  const [consoleModalOpen, setConsoleModalOpen] = useState<boolean>(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(false);
  const [dispatchTechName, setDispatchTechName] = useState<string>("Ajay Verma (Lead Field Tech)");
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);

  // Live Refresh & MQTT states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [mqttPingStatus, setMqttPingStatus] = useState<string>("Active");
  const [isPingingMqtt, setIsPingingMqtt] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handlePingBroker = () => {
    setIsPingingMqtt(true);
    setTimeout(() => {
      setIsPingingMqtt(false);
      setMqttPingStatus("Latency: 94ms • TLS 1.3 OK");
    }, 700);
  };

  const handleSaveNote = () => {
    setIsSavingNote(true);
    setTimeout(() => {
      setIsSavingNote(false);
      setNoteSavedFeedback(true);
      setTimeout(() => {
        setNoteSavedFeedback(false);
      }, 2500);
    }, 600);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length >= 4) {
      setIsBreakerUnlocked(true);
      setMfaModalOpen(false);
      setMfaCode("");
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchModalOpen(false);
      setDispatchedSuccess(false);
    }, 1500);
  };

  return (
    <DashboardLayout
      title="Fleet Command & Maintenance Desk"
      subtitle="SunPower Tech Pvt Ltd — Real-time Inverter Telemetry & Fault Dispatch (MMR Region)"
    >
      <div className="flex flex-col gap-6 relative">
        {/* Subtle Ambient Background Radiance */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[340px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-96 right-10 w-[480px] h-[300px] bg-error-container/5 rounded-full blur-[160px] pointer-events-none -z-10" />

        {/* 1. COMMAND BAR & FLEET CONTROLS */}
        <div className="p-4 rounded-xl glass-panel-l1 border border-outline-variant/30 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Monitored Rooftop Site Switcher & Status */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Site Dropdown Selector */}
            <div className="relative">
              <div className="flex items-center gap-3 bg-surface-container-high px-3.5 py-2 rounded-lg border border-outline-variant/40 shadow-sm">
                <Sun className="w-5 h-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">
                    Monitored Rooftop Site
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="bg-transparent font-heading text-sm font-bold text-on-surface focus:outline-none cursor-pointer pr-4"
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.id} className="bg-surface-container text-on-surface">
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                    <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                      {currentSite.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Fleet Health Pill */}
            <div className="flex items-center gap-2.5 bg-surface-container px-3.5 py-2 rounded-full border border-outline-variant/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ticketResolved ? "bg-primary" : "bg-error"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ticketResolved ? "bg-primary" : "bg-error"}`} />
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-on-surface">
                <span className="text-primary font-semibold">{ticketResolved ? "14 Online" : "13 Online"}</span>
                <span className="text-outline-variant">/</span>
                <span className={`font-semibold ${ticketResolved ? "text-primary" : "text-error"}`}>
                  {ticketResolved ? "0 Faults" : "1 Fault Alert"}
                </span>
              </div>
            </div>

            {/* Real-time MQTT stream telemetry badge */}
            <div className="hidden xl:flex items-center gap-2.5 bg-surface-container-low px-3.5 py-2 rounded-lg border border-outline-variant/20 font-mono text-xs">
              <Radio className="w-4 h-4 text-tertiary" />
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">MQTT Stream:</span>
                <span className="text-primary font-semibold">{mqttPingStatus}</span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant">Protocol:</span>
                <span className="text-tertiary font-semibold">v2.4 TLS</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Segment Filter Controls */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="flex items-center p-1 bg-surface-container-low rounded-lg border border-outline-variant/30 text-xs">
              <button
                onClick={() => setSegmentFilter("all")}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  segmentFilter === "all"
                    ? "bg-surface-container-highest text-on-surface font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                type="button"
              >
                All Sites (14)
              </button>
              <button
                onClick={() => setSegmentFilter("faults")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold ${
                  segmentFilter === "faults"
                    ? "bg-error-container text-on-error-container shadow-sm"
                    : "text-error hover:bg-error-container/30"
                }`}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span>Faults Only ({ticketResolved ? "0" : "1"})</span>
              </button>
              <button
                onClick={() => setSegmentFilter("maintenance")}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  segmentFilter === "maintenance"
                    ? "bg-surface-container-highest text-on-surface font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                type="button"
              >
                Maintenance (2)
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface border border-outline-variant/30 transition-colors flex items-center justify-center cursor-pointer"
              title="Refresh Live Feeds"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 2. FLEET KPI SUMMARY STRIP (4-COLUMNS GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Fleet Underwriting */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase text-on-surface-variant tracking-wider font-medium">
                Total Fleet Underwriting
              </span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">1.2</span>
              <span className="font-heading text-lg text-primary font-semibold">MWp</span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span>14 Active Rooftops</span>
              <span className="text-tertiary">MMR Region</span>
            </div>
          </div>

          {/* Card 2: Current Aggregate Output */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase text-on-surface-variant tracking-wider font-medium">
                Current Aggregate Output
              </span>
              <div className="flex items-center gap-1 text-primary font-mono text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+6.4%</span>
              </div>
            </div>
            <div className="my-2 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">842</span>
                <span className="font-heading text-lg text-primary font-semibold">kW</span>
              </div>
              {/* Mini Sparkline */}
              <div className="w-20 h-6 flex items-center">
                <svg className="w-full h-full overflow-visible text-primary" fill="none" viewBox="0 0 100 30">
                  <path
                    d="M0,25 Q15,22 30,18 T60,10 T80,14 T100,6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                  <circle cx="100" cy="6" fill="currentColor" r="3" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span>Target Peak: 950 kW</span>
              <span className="text-primary font-medium">88.6% Saturation</span>
            </div>
          </div>

          {/* Card 3: Active Fault Tickets */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[11px] uppercase font-semibold tracking-wider ${ticketResolved ? "text-primary" : "text-error"}`}>
                {ticketResolved ? "All Faults Cleared" : "Active Fault Tickets"}
              </span>
              {ticketResolved ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-error animate-bounce" />
              )}
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className={`font-heading text-3xl font-bold tracking-tight ${ticketResolved ? "text-primary" : "text-error"}`}>
                {ticketResolved ? "0" : "1"}
              </span>
              <span className={`font-heading text-sm font-semibold ${ticketResolved ? "text-primary" : "text-error"}`}>
                {ticketResolved ? "System Optimal" : "P1 High Alert"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span className={`px-2 py-0.5 rounded text-[11px] ${ticketResolved ? "bg-primary/10 text-primary" : "bg-error-container/40 text-on-error-container"}`}>
                {ticketResolved ? "All SLAs Met" : "#TK-402 Peak Drop"}
              </span>
              <span className={ticketResolved ? "text-primary" : "text-error"}>
                {ticketResolved ? "Status: Green" : "SLA: 28m Left"}
              </span>
            </div>
          </div>

          {/* Card 4: Fleet Performance Index */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase text-on-surface-variant tracking-wider font-medium">
                Fleet Performance Ratio (PR)
              </span>
              <Zap className="w-4 h-4 text-secondary" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">98.2%</span>
              <span className="font-heading text-lg text-secondary font-semibold">PR</span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span>Avg Inverter Efficiency:</span>
              <span className="text-primary font-semibold">97.8%</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN WORKSPACE SPLIT (75% LEFT TELEMETRY + 25% RIGHT CONTROLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Site Telemetry Dashboard [V-12] (8 of 12 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Selected Site Profile Banner */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-heading text-lg sm:text-xl font-bold text-on-surface">
                      {currentSite.name}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">
                      {currentSite.id}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                      {currentSite.capacity}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-tertiary" />
                      Client: {currentSite.client}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      {currentSite.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {currentSite.contact}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-auto text-xs">
                  <button
                    onClick={() => setInverterLogModalOpen(true)}
                    className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-lg border border-outline-variant/30 flex items-center gap-1.5 transition-all font-mono"
                    type="button"
                  >
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Inverter Log</span>
                  </button>
                  <button
                    onClick={() => setConsoleModalOpen(true)}
                    className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-lg border border-outline-variant/30 flex items-center gap-1.5 transition-all font-mono"
                    type="button"
                  >
                    <Terminal className="w-3.5 h-3.5 text-tertiary" />
                    <span>Inverter Console</span>
                  </button>
                </div>
              </div>

              {/* Quick Live Telemetry Badges Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest/80 p-3.5 rounded-lg border border-outline-variant/20 font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase">LIVE OUTPUT</span>
                  <span className="text-lg font-bold text-primary">
                    {ticketResolved ? "48.2" : currentSite.liveOutput} <span className="text-xs font-normal text-on-surface-variant">/ {currentSite.maxOutput}</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase">VOLTAGE (AC)</span>
                  <span className="text-lg font-bold text-on-surface">{currentSite.voltage}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase">CURRENT (AC)</span>
                  <span className="text-lg font-bold text-on-surface">{currentSite.current}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase">INVERTER EFFICIENCY</span>
                  <span className="text-lg font-bold text-tertiary">{currentSite.efficiency}</span>
                </div>
              </div>
            </div>

            {/* Peak Daylight Auto-Alert Banner (Active Fault State) */}
            {!ticketResolved && currentSite.hasFault ? (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl border border-error/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md relative overflow-hidden animate-fade-in">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-error/20 border border-error/30 flex items-center justify-center shrink-0 text-error">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-on-error-container">
                        Peak Daylight Anomaly Triggered
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-error text-background font-bold uppercase tracking-wider">
                        Critical P1
                      </span>
                    </div>
                    <p className="text-xs text-on-error-container/90 mt-0.5 leading-relaxed font-sans">
                      0.0 kW output detected at <span className="font-mono font-semibold">13:42 IST</span> during mandatory Peak Solar Window (09:00 – 16:00). Automated diagnostic ticket <strong className="underline cursor-pointer" onClick={() => setInverterLogModalOpen(true)}>#TK-402</strong> initiated.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
                  <button
                    onClick={() => setInverterLogModalOpen(true)}
                    className="px-3.5 py-1.5 bg-on-error-container text-error-container hover:opacity-90 font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    type="button"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Inspect Inverter Log</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Resolved Green State Banner */
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 shadow-sm text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-primary">All Telemetry In Bounds</span>
                    <p className="text-on-surface-variant text-[11px]">
                      Array output synchronizing normally with Adani Net-meter feeder at 50.0 Hz.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-primary uppercase font-bold bg-primary/20 px-2 py-1 rounded">
                  System Nominal
                </span>
              </div>
            )}

            {/* Secondary Diagnostic / Connectivity Notice */}
            <div className="bg-secondary/10 p-3.5 rounded-xl border border-secondary/30 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-secondary shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-secondary">MQTT Broker Latency Notice</span>
                  <p className="text-[11px] text-on-surface-variant">
                    Last raw packet received 12 mins ago. Inverter string #2 bypass mode diagnostic completed.
                  </p>
                </div>
              </div>
              <button
                onClick={handlePingBroker}
                className="px-3 py-1 bg-surface-container-high hover:bg-surface-bright text-secondary text-xs rounded-lg font-mono border border-secondary/30 shrink-0 transition-colors flex items-center gap-1"
                type="button"
              >
                <RefreshCw className={`w-3 h-3 ${isPingingMqtt ? "animate-spin" : ""}`} />
                <span>{isPingingMqtt ? "Pinging..." : "Ping Broker"}</span>
              </button>
            </div>

            {/* Dual Y-Axis Live Telemetry Graph */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-heading text-base font-semibold text-on-surface">
                    Dual-Axis Power Generation &amp; Solar Irradiance
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Real-time edge telemetry mapped to rooftop pyranometer readings
                  </span>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center p-1 bg-surface-container rounded-lg border border-outline-variant/30 font-mono text-xs">
                  {["Live 5s", "1 Hour", "Today", "7 Days"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        timeframe === tf
                          ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-1 bg-primary rounded-full" />
                  <span className="text-on-surface font-medium">kW Generation (Real-time 5s stream)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-0.5 border-t border-dashed border-secondary" />
                  <span className="text-on-surface-variant font-mono">Solar Irradiance (W/m²)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 bg-secondary/15 rounded border border-secondary/30" />
                  <span className="text-on-surface-variant text-xs">Peak Window (09:00–16:00)</span>
                </div>
              </div>

              {/* SVG Telemetry Graph Canvas */}
              <div className="relative w-full h-80 bg-surface-container-lowest rounded-lg p-3 overflow-hidden flex flex-col justify-between border border-outline-variant/30">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-25">
                  <div className="w-full border-b border-outline-variant" />
                  <div className="w-full border-b border-outline-variant" />
                  <div className="w-full border-b border-outline-variant" />
                  <div className="w-full border-b border-outline-variant" />
                  <div className="w-full border-b border-outline-variant" />
                </div>

                {/* Shaded Peak Daylight Window */}
                <div className="absolute top-6 bottom-8 left-[15%] right-[20%] bg-secondary/5 pointer-events-none rounded border-x border-secondary/10" />

                {/* SVG Visualizer */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                  <defs>
                    <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.35" />
                      <stop offset="80%" stopColor="#4edea3" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="crimsonGlow" width="140%" height="140%" x="-20%" y="-20%">
                      <feDropShadow dx="0" dy="0" floodColor="#ffb4ab" stdDeviation="3" />
                    </filter>
                  </defs>

                  {/* Irradiance Reference Curve (Amber dashed) */}
                  <path
                    d="M 50,270 C 180,240 280,70 500,50 C 650,50 820,180 950,280"
                    fill="none"
                    stroke="#ffb95f"
                    strokeDasharray="5,5"
                    strokeOpacity="0.7"
                    strokeWidth="2"
                  />

                  {/* Generation Area Fill */}
                  <path
                    d={
                      ticketResolved
                        ? "M 50,275 C 180,245 280,80 500,65 C 650,68 820,185 950,280 L 950,290 L 50,290 Z"
                        : "M 50,275 C 180,245 280,80 480,75 L 560,78 L 575,275 L 590,82 C 680,85 820,190 950,280 L 950,290 L 50,290 Z"
                    }
                    fill="url(#primaryAreaGrad)"
                  />

                  {/* Generation Line (Emerald solid with sharp dip at fault if not resolved) */}
                  <path
                    d={
                      ticketResolved
                        ? "M 50,275 C 180,245 280,80 500,65 C 650,68 820,185 950,280"
                        : "M 50,275 C 180,245 280,80 480,75 L 560,78 L 575,275 L 590,82 C 680,85 820,190 950,280"
                    }
                    fill="none"
                    stroke="#4edea3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />

                  {/* Fault Anomaly Line at 13:42 (x=575) */}
                  {!ticketResolved && (
                    <g>
                      <line x1="575" y1="40" x2="575" y2="280" stroke="#ffb4ab" strokeDasharray="4,3" strokeWidth="2" filter="url(#crimsonGlow)" />
                      <circle cx="575" cy="275" r="5" fill="#ffb4ab" />
                    </g>
                  )}

                  {/* Crosshair at 13:30 (x=540) */}
                  <line x1="540" y1="50" x2="540" y2="280" stroke="#dae2fd" strokeDasharray="2,2" strokeOpacity="0.4" strokeWidth="1" />
                  <circle cx="540" cy="76" r="4.5" fill="#4edea3" stroke="#0b1326" strokeWidth="2" />
                </svg>

                {/* Pre-Fault Normal Tooltip */}
                <div className="absolute top-10 left-[51%] transform -translate-x-1/2 bg-surface-container-high/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl pointer-events-none border border-outline-variant/40">
                  <div className="font-mono text-[10px] text-on-surface-variant font-semibold">13:30 IST — PRE-FAULT NORMAL</div>
                  <div className="flex items-center gap-3 font-mono text-[11px] mt-0.5">
                    <span className="text-primary font-bold">kW Output: 42.6 kW</span>
                    <span className="text-secondary font-bold">Irradiance: 850 W/m²</span>
                  </div>
                </div>

                {/* Fault Callout Marker at 13:42 */}
                {!ticketResolved && (
                  <div className="absolute top-7 left-[58%] bg-error-container text-on-error-container px-2.5 py-1 rounded shadow-lg pointer-events-none border border-error/30">
                    <span className="font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                      Anomaly Trigger: 0.0 kW
                    </span>
                  </div>
                )}

                {/* Time Axis Labels */}
                <div className="w-full flex justify-between font-mono text-[10px] text-on-surface-variant px-4 pt-1">
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span className={ticketResolved ? "text-primary font-bold" : "text-error font-bold"}>
                    {ticketResolved ? "13:42 (Resolved)" : "13:42 (Dip)"}
                  </span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
              </div>

              {/* Quick Telemetry Footnote */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-on-surface-variant gap-2 pt-1 font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Automated calibration sync with DISCOM meter feeder #MMR-DL-82
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>SMA Sunny Tripower 50-STP</span>
                  <span className="text-outline-variant">•</span>
                  <span>String 1: Active | String 2: {ticketResolved ? "Active (Restored)" : "Bypass Mode"}</span>
                </div>
              </div>
            </div>

            {/* Inverter Diagnostics & String Health Breakdown (2 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* String 1: South Roof Array */}
              <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-on-surface">
                    String 1 (South Roof Array)
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-semibold">
                    NORMAL
                  </span>
                </div>

                <div className="my-3 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">DC Voltage</span>
                    <span className="text-sm text-on-surface block font-bold mt-0.5">590 V</span>
                  </div>
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">DC Current</span>
                    <span className="text-sm text-primary block font-bold mt-0.5">36.1 A</span>
                  </div>
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">Power</span>
                    <span className="text-sm text-on-surface block font-bold mt-0.5">21.3 kW</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span>MPPT: Tracking</span>
                  <span className="text-primary">Temp: 44.2°C</span>
                </div>
              </div>

              {/* String 2: West Roof Array */}
              <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-semibold text-on-surface">
                    String 2 (West Roof Array)
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                      ticketResolved
                        ? "bg-primary/10 border border-primary/20 text-primary"
                        : "bg-error-container text-on-error-container border border-error/30"
                    }`}
                  >
                    {ticketResolved ? "RESTORED" : "BYPASS / FAULT"}
                  </span>
                </div>

                <div className="my-3 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">DC Voltage</span>
                    <span className={`text-sm block font-bold mt-0.5 ${ticketResolved ? "text-on-surface" : "text-error"}`}>
                      {ticketResolved ? "585 V" : "12 V"}
                    </span>
                  </div>
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">DC Current</span>
                    <span className={`text-sm block font-bold mt-0.5 ${ticketResolved ? "text-primary" : "text-error"}`}>
                      {ticketResolved ? "35.8 A" : "0.0 A"}
                    </span>
                  </div>
                  <div className="bg-surface-container p-2 rounded border border-outline-variant/20">
                    <span className="text-[10px] text-on-surface-variant">Power</span>
                    <span className={`text-sm block font-bold mt-0.5 ${ticketResolved ? "text-on-surface" : "text-error"}`}>
                      {ticketResolved ? "20.9 kW" : "0.0 kW"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
                  <span className={ticketResolved ? "text-primary" : "text-error font-medium"}>
                    {ticketResolved ? "GFDI Cleared" : "GFDI Trip Interrupted"}
                  </span>
                  <span className={ticketResolved ? "text-primary" : "text-error font-semibold"}>
                    {ticketResolved ? "Temp: 46.1°C" : "Temp: 58.9°C (Alert)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Vendor Controls & Associated Tickets Desk [V-13] (4 of 12 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Module 1: Remote Site Control & Disconnect Lock */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Power className="w-4 h-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-on-surface">Remote Control</span>
                </div>
                <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  DISCOM-SYNC
                </span>
              </div>

              {/* Operating Regime Toggle */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">OPERATING REGIME</span>
                <div className="grid grid-cols-2 gap-1.5 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
                  <button
                    onClick={() => setOperatingRegime("ONLINE")}
                    className={`py-1.5 px-2 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      operatingRegime === "ONLINE"
                        ? "bg-primary text-primary-on shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse" />
                    <span>ONLINE</span>
                  </button>
                  <button
                    onClick={() => setOperatingRegime("MAINTENANCE")}
                    className={`py-1.5 px-2 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      operatingRegime === "MAINTENANCE"
                        ? "bg-secondary text-secondary-on shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                    type="button"
                  >
                    <span>MAINTENANCE</span>
                  </button>
                </div>
              </div>

              {/* Emergency Inverter Kill Breaker */}
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-error">
                    <Power className="w-4 h-4" />
                    <span className="font-semibold text-on-surface">Emergency Inverter Kill</span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant font-mono text-[10px]">
                    {isBreakerUnlocked ? (
                      <span className="text-primary flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Console Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-tertiary" /> Safety Locked
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Requires cryptographic MFA passkey token before executing remote breaker trip.
                </p>

                <button
                  onClick={() => {
                    if (isBreakerUnlocked) {
                      setIsBreakerUnlocked(false);
                    } else {
                      setMfaModalOpen(true);
                    }
                  }}
                  className={`mt-1 w-full py-2 rounded text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isBreakerUnlocked
                      ? "bg-error text-surface font-bold hover:opacity-90"
                      : "bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30"
                  }`}
                  type="button"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isBreakerUnlocked ? "Execute Breaker Kill (ARMED)" : "Unlock Breaker Console"}</span>
                </button>
              </div>
            </div>

            {/* Module 2: Vendor Configuration Note Editor */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-3">
              <div className="flex flex-col">
                <span className="font-heading text-sm font-bold text-on-surface">Vendor Configuration Notes</span>
                <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                  Logged permanently to audit ledger &amp; synced with RWA
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={configNotes}
                  onChange={(e) => setConfigNotes(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface text-xs rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[10px] text-on-surface-variant">SHA-256 Hash pinned</span>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
                    noteSavedFeedback
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-primary text-primary-on hover:brightness-110"
                  }`}
                  type="button"
                >
                  {isSavingNote ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Hashing...</span>
                    </>
                  ) : noteSavedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pinned to Ledger!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Module 3: Associated Site Tickets Desk [V-13] */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-error" />
                  <span className="font-heading text-sm font-bold text-on-surface">Active Faults &amp; Tickets</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                  {ticketResolved ? "0 ACTIVE" : "1 ACTIVE"}
                </span>
              </div>

              {/* Ticket Card #TK-402 (Active High Priority) */}
              {!ticketResolved ? (
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-error/30 flex flex-col gap-3 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-heading text-xs font-bold text-error">
                        #TK-402 — Zero output peak daylight
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">
                        Opened by: SYSTEM (AI Diagnostics) • 14:02 IST
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-error text-background font-mono text-[10px] font-bold">
                      HIGH (P1)
                    </span>
                  </div>

                  {/* Assignee Pill */}
                  <div className="flex items-center gap-2 bg-surface-container px-2.5 py-1.5 rounded-md border border-outline-variant/20">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-on-surface-variant uppercase">ASSIGNEE</span>
                      <span className="text-xs font-semibold text-on-surface">{dispatchTechName}</span>
                    </div>
                  </div>

                  {/* Diagnostics snippet */}
                  <div className="bg-surface-container-high/40 p-2.5 rounded-lg border border-outline-variant/20 text-xs">
                    <span className="font-mono text-[10px] text-secondary font-semibold uppercase block">
                      Telemetry Root Cause:
                    </span>
                    <p className="text-on-surface-variant mt-0.5 text-[11px] leading-relaxed">
                      Ground fault detection interrupter (GFDI) trip suspected on SMA Sunny Tripower string inverter. String 2 voltage collapsed from 610V to 12V.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
                    <button
                      onClick={() => setTicketResolved(true)}
                      className="flex-1 py-2 bg-primary hover:bg-primary-container text-primary-on font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      type="button"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve &amp; Notify RWA</span>
                    </button>
                    <button
                      onClick={() => setDispatchModalOpen(true)}
                      className="px-3.5 py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface font-medium rounded-lg border border-outline-variant/30 transition-all flex items-center justify-center gap-1"
                      type="button"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Ticket Cleared State */
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold">#TK-402 Resolved</span>
                    <p className="text-[11px] text-on-surface-variant">RWA Committee notified via automated escrow ping.</p>
                  </div>
                </div>
              )}

              {/* Historical / Recent Ticket Preview */}
              <div className="flex flex-col gap-1.5 pt-1 text-xs">
                <span className="font-mono text-[10px] uppercase text-on-surface-variant">
                  Recent Resolved Ticket
                </span>
                <div className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/20 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface text-xs">
                      #TK-388 — Pyranometer dust sensor drift
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      Technician: R. Kulkarni • Yesterday 16:40
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                    RESOLVED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: INVERTER LOGS INSPECTION */}
      {inverterLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-base text-on-surface">
                  SMA Sunny Tripower 50-STP Diagnostic Log
                </h3>
              </div>
              <button
                onClick={() => setInverterLogModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 font-mono text-xs text-on-surface flex flex-col gap-2 max-h-80 overflow-y-auto">
              <div className="text-secondary font-bold">[13:42:11.082] EVENT: GFDI BREAKER TRIP DETECTED ON STRING #2</div>
              <div className="text-on-surface-variant">[13:42:10.950] String 2 DC Voltage: 12.4V (Drop from 612.0V baseline)</div>
              <div className="text-on-surface-variant">[13:42:10.900] String 2 DC Current: 0.00A</div>
              <div className="text-error">[13:42:11.120] ERROR CODE: STP-ERR-09412 - GROUND IMPEDANCE FAULT &lt; 20k OHM</div>
              <div className="text-primary">[13:42:11.200] Automated Safemode Engaged: String 1 operating in bypass isolation (21.3 kW active)</div>
              <div className="text-on-surface-variant">[13:42:12.000] DISCOM Inverter Heartbeat dispatched via MQTT telemetry broker</div>
              <div className="text-secondary">[14:02:00.000] System AI Engine triggered automatic maintenance ticket #TK-402</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setInverterLogModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INVERTER CONSOLE TERMINAL CLI */}
      {consoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-tertiary" />
                <h3 className="font-heading font-bold text-base text-on-surface">
                  Direct Inverter Shell Terminal (SSH / Modbus TCP)
                </h3>
              </div>
              <button
                onClick={() => setConsoleModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#050b14] rounded-xl border border-outline-variant/40 font-mono text-xs text-primary flex flex-col gap-1.5 h-64 overflow-y-auto shadow-inner">
              <p className="text-on-surface-variant">Connecting to 192.168.10.42:502 via Secure TLS Gateway...</p>
              <p className="text-primary">Authenticated: SunPower EPC Private Token Verified [RSA-4096]</p>
              <p className="text-on-surface">&gt; sma-diag --status --all-strings</p>
              <p className="text-on-surface-variant">Inverter Model: STP 50-40 (Serial: 300492194)</p>
              <p className="text-on-surface-variant">Firmware: v2.4.12-PROD</p>
              <p className="text-primary">String 1: 590V | 36.1A | 21.3kW | Status: OK</p>
              <p className="text-error">String 2: 12V | 0.0A | 0.0kW | Status: GFDI TRIP [ERR-09412]</p>
              <p className="text-on-surface">&gt; telemetry-ping --mqtt</p>
              <p className="text-tertiary">MQTT Broker response: 140ms round-trip. Enclave payload verified.</p>
              <div className="flex items-center gap-1 text-on-surface mt-2">
                <span>sunpower@gateway:~$</span>
                <span className="w-2 h-4 bg-primary animate-pulse" />
              </div>
            </div>

            <div className="flex justify-end pt-2 text-xs">
              <button
                onClick={() => setConsoleModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
              >
                Disconnect Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BREAKER UNLOCK MFA */}
      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-bold text-base text-on-surface">Emergency Breaker Authorization</h3>
              </div>
              <button onClick={() => setMfaModalOpen(false)} className="text-on-surface-variant hover:text-on-surface text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleMfaSubmit} className="flex flex-col gap-3 text-xs">
              <p className="text-on-surface-variant leading-relaxed">
                Enter your 6-digit EPC Lead Operator MFA passkey to disengage safety locks on site #RF-8821.
              </p>
              <div>
                <label className="font-mono text-[10px] text-on-surface-variant uppercase block mb-1">
                  MFA Passkey Token
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter token (e.g. 849201)"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/40 font-mono tracking-widest text-center text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfaModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-on font-semibold"
                >
                  Unlock Breaker Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DISPATCH TECHNICIAN */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-base text-on-surface">Dispatch Field Technician</h3>
              </div>
              <button onClick={() => setDispatchModalOpen(false)} className="text-on-surface-variant hover:text-on-surface text-sm">
                ✕
              </button>
            </div>

            {dispatchedSuccess ? (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-xs text-primary">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">Work Order #WO-8910 Dispatched</span>
                  <p className="text-on-surface-variant text-[11px]">Field technician ETA: 35 mins. RWA security alerted.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDispatchSubmit} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase block mb-1">
                    Select Lead Technician
                  </label>
                  <select
                    value={dispatchTechName}
                    onChange={(e) => setDispatchTechName(e.target.value)}
                    className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary"
                  >
                    <option value="Ajay Verma (Lead Field Tech - Mira Road Cluster)">
                      Ajay Verma (Lead Field Tech - Mira Road Cluster)
                    </option>
                    <option value="R. Kulkarni (Inverter Specialist - Thane Team)">
                      R. Kulkarni (Inverter Specialist - Thane Team)
                    </option>
                    <option value="Suresh Patil (Rapid Response Unit)">
                      Suresh Patil (Rapid Response Unit)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] text-on-surface-variant uppercase block mb-1">
                    Dispatch Priority / SLA
                  </label>
                  <div className="p-2.5 bg-surface-container rounded-lg border border-outline-variant/30 text-[11px] text-secondary font-mono">
                    Target On-Site ETA: 45 Minutes (P1 Emergency Protocol)
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDispatchModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-on font-semibold"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
