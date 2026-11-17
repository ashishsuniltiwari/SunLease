"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Building2,
  Sun,
  Zap,
  TrendingUp,
  Leaf,
  Trees,
  Thermometer,
  FileText,
  CheckCircle2,
  Lock,
  Scale,
  Wrench,
  Clock,
  ArrowUpRight,
  Download,
  ExternalLink,
  X,
  Send,
  History,
  ShieldCheck,
  Plus,
  ChevronRight,
  Bot,
  Sparkles,
  BadgeCheck,
  MapPin,
  Check,
  Activity,
  AlertTriangle,
  Flame,
  Gavel,
  Loader2,
  RotateCw,
} from "lucide-react";

interface LiveListing {
  id: string;
  societyName: string;
  society: string;
  location?: string | null;
  city?: string | null;
  area: number;
  status: string;
  createdAt: string;
  _count?: { bids: number };
}

interface LiveBid {
  id: string;
  amount: number;
  kwp: number;
  status: string;
  createdAt: string;
  listing?: {
    id: string;
    societyName: string;
    society: string;
    area: number;
  };
  vendor?: {
    id: string;
    name?: string | null;
    email: string;
  };
}

interface Ticket {
  id: string;
  title: string;
  unit: string;
  time?: string;
  status: string;
  priority: string;
  description?: string | null;
  createdAt?: string;
}

interface TelemetryPoint {
  id?: string;
  time: string;
  kw_generation: number;
  irradiance_potential: number;
}

interface TelemetryState {
  current: {
    kw: number;
    frequency: string;
    temperature: number;
    status: string;
    efficiency: string;
    timestamp: string;
  };
  metrics: {
    totalGenerationKwh: number;
    earningsRupees: number;
    tariffRate: number;
    carbonOffsetKg: number;
    treesEquivalent: number;
    carsOffset: number;
  };
  readings: TelemetryPoint[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  time: string;
  meta?: {
    output?: string;
    tariff?: string;
    corpus?: string;
  };
}

export default function RwaDashboardPage() {
  // Navigation & timeframe state
  const [activeTimeframe, setActiveTimeframe] = useState<string>("Live 5s");

  // Modals & Drawer State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState<boolean>(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState<boolean>(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [isPpaModalOpen, setIsPpaModalOpen] = useState<boolean>(false);

  // Live Listings & Bids State (from /api/listings and /api/bids)
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [bids, setBids] = useState<LiveBid[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(true);
  const [isCreatingListing, setIsCreatingListing] = useState<boolean>(false);
  const [newWing, setNewWing] = useState("Tower C Terrace");
  const [newArea, setNewArea] = useState("9500");
  const [listingError, setListingError] = useState<string | null>(null);
  const [isAiStreaming, setIsAiStreaming] = useState<boolean>(false);

  // Telemetry state & 5s polling
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(true);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);

  // Live Fetch: load listings & bids from backend API
  const fetchLiveRwaData = async () => {
    try {
      setIsLoadingLive(true);
      const [listingsRes, bidsRes] = await Promise.all([
        fetch("/api/listings"),
        fetch("/api/bids"),
      ]);

      if (listingsRes.ok) {
        const data = await listingsRes.json();
        if (data.listings) {
          setListings(data.listings);
        }
      }

      if (bidsRes.ok) {
        const data = await bidsRes.json();
        if (data.bids) {
          setBids(data.bids);
        }
      }
    } catch (err) {
      console.error("Error fetching live RWA listings/bids:", err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Accept Bid & Transition Listing to Contracted
  const handleAcceptBid = async (bidId: string) => {
    try {
      const res = await fetch("/api/bids", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, action: "ACCEPT" }),
      });
      if (res.ok) {
        await fetchLiveRwaData();
      }
    } catch (err) {
      console.error("Error accepting bid:", err);
    }
  };

  // Fetch Telemetry readings
  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/telemetry?limit=25");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTelemetry(data);
        }
      }
    } catch (err) {
      console.error("Telemetry fetch error:", err);
    }
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        if (data.tickets) {
          setTickets(data.tickets);
        }
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchLiveRwaData();
    fetchTickets();
    fetchTelemetry();

    // Poll /api/telemetry every 5 seconds
    const telemetryInterval = setInterval(() => {
      fetchTelemetry();
    }, 5000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // New Ticket Form State
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketUnit, setNewTicketUnit] = useState("SMA Sunny Tripower unit #01");
  const [newTicketPriority, setNewTicketPriority] = useState<"Low" | "Medium" | "High">("Medium");

  // AI Copilot Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "user",
      text: "How does our society receive the monthly lease payout?",
      time: "10:14 AM",
    },
    {
      id: "2",
      sender: "copilot",
      text: "Green Meadows RWA receives automated monthly payments directly from SolarGrid India via tripartite escrow on the 5th of each month.",
      time: "10:14 AM",
      meta: {
        output: "18.4 kW Output",
        tariff: "₹3.40 / kWh",
        corpus: "₹18,450.00",
      },
    },
  ]);

  // Streaming AI Chat integration with /api/assistant
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isAiStreaming) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: "copilot",
      text: "",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatInput("");
    setIsAiStreaming(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: userText },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to receive stream from /api/assistant");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamedResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, text: streamedResponse }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      console.error("AI Assistant stream error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: "I am specialized strictly in advising RWAs on rooftop solar feasibility, RESCO contracts, and net-metering. Under the RESCO model, SolarGrid India covers 100% of equipment, replacement, and maintenance obligations.",
              }
            : msg
        )
      );
    } finally {
      setIsAiStreaming(false);
    }
  };

  const handleChipClick = (prompt: string) => {
    setChatInput(prompt);
    setIsCopilotOpen(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || isSubmittingTicket) return;

    setIsSubmittingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTicketTitle.trim(),
          unit: newTicketUnit,
          priority: newTicketPriority,
          status: "Open",
        }),
      });

      const data = await res.json();
      if (res.ok && data.ticket) {
        setTickets((prev) => [data.ticket, ...prev]);
        setNewTicketTitle("");
        setIsRaiseTicketOpen(false);
      } else {
        console.error("Failed to create ticket:", data.error);
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const fallbackChartData: TelemetryPoint[] = [
    { time: "06:00", kw_generation: 0.8, irradiance_potential: 1.5 },
    { time: "08:00", kw_generation: 5.2, irradiance_potential: 6.0 },
    { time: "10:00", kw_generation: 13.4, irradiance_potential: 14.5 },
    { time: "12:00", kw_generation: 18.4, irradiance_potential: 19.1 },
    { time: "14:00", kw_generation: 21.0, irradiance_potential: 22.0 },
    { time: "16:00", kw_generation: 12.8, irradiance_potential: 13.5 },
    { time: "18:00", kw_generation: 2.1, irradiance_potential: 2.5 },
  ];

  const chartData =
    telemetry?.readings && telemetry.readings.length > 0
      ? telemetry.readings
      : fallbackChartData;

  return (
    <DashboardLayout
      title="RWA Executive Dashboard"
      subtitle="Green Meadows Co-op Housing Society — Tower A & B (ID: RWA-7824)"
    >
      <div className="flex flex-col gap-6 relative">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-80 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* 1. TOP HEADER & METADATA BAR */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel-l1 p-5 rounded-xl border border-outline-variant/30 shadow-md">
          {/* Identity & Metering Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                  Green Meadows RWA — Tower A &amp; B
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] uppercase font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-primary text-background" />
                  Role: RWA Committee
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-on-surface-variant font-sans">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-outline" />
                  Plot 42, Sector 14, Mira Road (E), Thane - 401107
                </span>
                <span className="text-outline/40">•</span>
                <span className="font-mono text-tertiary bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 text-[11px]">
                  Adani Electricity Net-Meter ID: #NET-98421
                </span>
              </div>
            </div>
          </div>

          {/* Action Matrix & Live Sync Telemetry Badge */}
          <div className="flex items-center flex-wrap gap-3 self-start xl:self-center">
            {/* Live Telemetry Beacon Badge */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-container-lowest font-mono text-xs text-on-surface-variant border border-outline-variant/30 shadow-inner">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${(telemetry?.current?.kw ?? 18.4) > 0 ? "bg-primary animate-ping" : "bg-error"} absolute opacity-75`} />
                <span className={`w-2 h-2 rounded-full ${(telemetry?.current?.kw ?? 18.4) > 0 ? "bg-primary" : "bg-error"}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface font-semibold">
                  {telemetry?.current?.kw !== undefined ? `${telemetry.current.kw} kW` : "18.4 kW"}
                </span>
                <span className="text-outline/40">|</span>
                <span>Freq: <strong className="text-on-surface">{telemetry?.current?.frequency || "50.0 Hz"}</strong></span>
                <span className="text-outline/40">|</span>
                <span className="text-primary font-medium">
                  {telemetry ? "Live (5s)" : "Syncing..."}
                </span>
              </div>
            </div>

            {/* AI Assistant Copilot Trigger Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-primary border border-primary/40 hover:border-primary shadow-lg shadow-primary/10 transition-all cursor-pointer"
              type="button"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface leading-tight tracking-wide">
                  Ask AI Copilot
                </span>
                <span className="text-[9px] text-secondary font-mono uppercase font-semibold leading-none">
                  v2.4 Advisor
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-primary ml-0.5" />
            </button>

            {/* List New Rooftop Button */}
            <button
              onClick={() => setIsListingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-fixed-dim text-primary-on text-xs font-bold transition-all shadow-glow cursor-pointer"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>List New Rooftop</span>
            </button>
          </div>
        </div>

        {/* 2. KPI METRIC CARDS ROW (4-GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Total Generation */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Total Generation
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">
                    {telemetry?.metrics?.totalGenerationKwh !== undefined
                      ? telemetry.metrics.totalGenerationKwh.toFixed(1)
                      : "142.8"}
                  </span>
                  <span className="font-mono text-sm text-primary font-semibold">
                    kWh
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12%</span>
              </div>
            </div>

            {/* Sparkline Visualization */}
            <div className="w-full my-3 h-9 flex items-end">
              <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 160 30">
                <defs>
                  <linearGradient id="grad-card1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4edea3" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,25 Q20,24 40,18 T80,10 T120,4 T145,2 T160,5"
                  fill="none"
                  stroke="#4edea3"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <path
                  d="M0,25 Q20,24 40,18 T80,10 T120,4 T145,2 T160,5 L160,30 L0,30 Z"
                  fill="url(#grad-card1)"
                />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate">Peak at 13:15 IST • Tier-1 Mono PERC</span>
            </div>
          </div>

          {/* Card 2: Estimated Earnings */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Estimated Earnings
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-heading text-3xl font-bold text-on-surface tracking-tight">
                    {telemetry?.metrics?.earningsRupees !== undefined
                      ? `₹${telemetry.metrics.earningsRupees.toLocaleString()}`
                      : "₹18,450"}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    / live
                  </span>
                </div>
              </div>
              <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
                +₹3,450 surplus
              </span>
            </div>

            <div className="my-2.5 bg-surface-container-lowest/80 p-2 rounded-lg flex items-center justify-between border border-outline-variant/20">
              <span className="font-mono text-[11px] text-on-surface-variant">Floor Guarantee</span>
              <span className="font-mono text-xs text-secondary font-bold">₹15,000 / mo</span>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant font-sans">
              <span>Tariff: <strong className="text-on-surface font-mono">₹3.40 / kWh</strong></span>
              <span className="font-mono text-[10px] text-outline uppercase">RESCO Model</span>
            </div>
          </div>

          {/* Card 3: Carbon Offset */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Carbon Offset
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-heading text-3xl font-bold text-tertiary tracking-tight">
                    {telemetry?.metrics?.carbonOffsetKg !== undefined
                      ? (telemetry.metrics.carbonOffsetKg / 1000).toFixed(2)
                      : "1.18"}
                  </span>
                  <span className="font-mono text-sm text-tertiary font-semibold">
                    Tons CO₂
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-tertiary/10 border border-tertiary/20 text-tertiary flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>

            <div className="my-2.5 flex items-center gap-3">
              <div className="flex-1 bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all" style={{ width: "78%" }} />
              </div>
              <span className="font-mono text-[11px] text-tertiary font-medium">
                {telemetry?.metrics?.carbonOffsetKg !== undefined
                  ? `${telemetry.metrics.carbonOffsetKg.toLocaleString()} kg`
                  : "1,180 kg"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant truncate font-sans">
              <Trees className="w-3.5 h-3.5 text-tertiary shrink-0" />
              <span>
                Eq. {telemetry?.metrics?.treesEquivalent ?? 54} trees planted • {telemetry?.metrics?.carsOffset ?? 2.4} cars offset
              </span>
            </div>
          </div>

          {/* Card 4: System Health & Inverter */}
          <div className="glass-panel-l2 p-5 rounded-xl border border-outline-variant/30 flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  System Health
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${(telemetry?.current?.kw ?? 18.4) > 0 ? "bg-primary animate-pulse" : "bg-error"}`} />
                  <span className={`font-heading text-lg font-bold ${(telemetry?.current?.kw ?? 18.4) > 0 ? "text-primary" : "text-error"}`}>
                    {telemetry?.current?.status || "ONLINE"}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    ({telemetry?.current?.efficiency || "100% Cap"})
                  </span>
                </div>
              </div>
              <span className="bg-primary/10 text-primary border border-primary/20 p-1.5 rounded-lg flex items-center justify-center">
                <Sun className="w-4 h-4 fill-primary/30" />
              </span>
            </div>

            <div className="my-2.5 bg-surface-container-lowest/80 p-2 rounded-lg flex items-center justify-between border border-outline-variant/20">
              <span className="font-mono text-[11px] text-on-surface-variant truncate">SMA Sunny Tripower 25kW</span>
              <span className="font-mono text-[11px] text-primary font-bold">Optimal</span>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant font-sans">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-outline" />
                <span>Temp: <strong className="text-on-surface font-mono">42°C</strong></span>
              </span>
              <span className="font-mono text-[11px] text-primary">Normal Range</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN ASYMMETRIC GRID (8 cols Telemetry & PPA / 4 cols Tickets & Ledger) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: 8 of 12 columns */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* TELEMETRY & IRRADIANCE GRAPH MODULE */}
            <div className="glass-panel-l2 rounded-xl p-6 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              {/* Chart Header & Control Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-base sm:text-lg font-semibold text-on-surface">
                      Rooftop Generation vs Peak Potential Telemetry
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    High-frequency DISCOM bidirectional feed &amp; pyranometer sensor sync (Polled every 5s)
                  </p>
                </div>

                {/* Timeframe Selector Tabs */}
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg self-start sm:self-auto font-mono text-xs border border-outline-variant/20">
                  {["Live 5s", "24 Hours", "7 Days", "1 Month", "1 Year"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(tf)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeTimeframe === tf
                          ? "bg-surface-container-highest text-primary font-bold shadow-sm border border-primary/20"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric Legends Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans bg-surface-container-lowest/70 p-3 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-glow" />
                  <span className="text-on-surface font-medium">Actual Yield (kW)</span>
                  <span className="font-mono text-primary font-bold ml-1">
                    {telemetry?.current?.kw !== undefined ? `${telemetry.current.kw} kW` : "18.4 kW"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-secondary border-dashed" />
                  <span className="text-on-surface-variant">Solar Irradiance Potential (kW)</span>
                  <span className="font-mono text-secondary ml-1">
                    {chartData[chartData.length - 1]?.irradiance_potential
                      ? `${chartData[chartData.length - 1].irradiance_potential} kW`
                      : "19.1 kW"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-secondary/20 border border-secondary/30" />
                  <span className="text-outline text-xs">Peak Window (11:00 - 15:30)</span>
                </div>
                <div className="ml-auto font-mono text-[11px] text-outline-variant hidden md:block">
                  Inverter PR: {telemetry?.current?.efficiency || "96.3%"}
                </div>
              </div>

              {/* Primary Recharts Telemetry Chart Container */}
              <div className="relative w-full h-80 rounded-lg bg-surface-container-lowest p-3 flex flex-col justify-between overflow-hidden shadow-inner border border-outline-variant/30">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 12, right: 15, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="areaGenerationGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#4edea3" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4edea3" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="areaIrradianceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffb95f" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ffb95f" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" vertical={false} />
                      <XAxis
                        dataKey="time"
                        stroke="#86948a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "#3c4a42" }}
                      />
                      <YAxis
                        stroke="#86948a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: "#3c4a42" }}
                        unit=" kW"
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const actualKw = payload.find((p) => p.dataKey === "kw_generation")?.value;
                            const potentialKw = payload.find((p) => p.dataKey === "irradiance_potential")?.value;
                            return (
                              <div className="bg-surface-container-high/95 backdrop-blur-xl px-3 py-2 rounded-lg shadow-xl border border-outline-variant/40 font-mono text-[11px]">
                                <div className="text-on-surface font-bold mb-1">{label}</div>
                                <div className="flex items-center gap-2 text-primary">
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                  <span>Yield: <strong>{actualKw} kW</strong></span>
                                </div>
                                {potentialKw !== undefined && (
                                  <div className="flex items-center gap-2 text-secondary mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-secondary" />
                                    <span>Irradiance: <strong>{potentialKw} kW</strong></span>
                                  </div>
                                )}
                                {Number(actualKw) > 0 && Number(potentialKw) > 0 && (
                                  <div className="text-outline text-[10px] mt-1 pt-1 border-t border-outline-variant/20">
                                    PR: {((Number(actualKw) / Number(potentialKw)) * 100).toFixed(1)}%
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="irradiance_potential"
                        stroke="#ffb95f"
                        strokeDasharray="4 4"
                        strokeWidth={1.8}
                        fillOpacity={1}
                        fill="url(#areaIrradianceGrad)"
                        name="Solar Irradiance Potential"
                      />
                      <Area
                        type="monotone"
                        dataKey="kw_generation"
                        stroke="#4edea3"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaGenerationGrad)"
                        name="Actual Yield"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant font-mono">
                    Initializing Telemetry Feed...
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVE ROOF STATUS & PPA CONTRACT SPECIFICATION */}
            <div className="glass-panel-l2 rounded-xl p-6 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-on-surface bg-surface-container border border-outline-variant/30 px-2.5 py-1 rounded">
                    Listing #RF-8821
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-on-surface">
                    Tower A &amp; B Terrace
                  </h3>
                  <span className="text-xs text-on-surface-variant font-sans">
                    (12,400 sq.ft Usable Sunroof)
                  </span>
                </div>
                {/* Active Status Stamp */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  Contracted
                </div>
              </div>

              {/* Lifecycle Stage Trackers */}
              <div className="flex items-center flex-wrap gap-2 pt-1 pb-2">
                <span className="font-mono text-xs text-outline uppercase mr-1">Lifecycle Pipeline:</span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-outline border border-outline-variant/20">
                  DRAFT
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-outline border border-outline-variant/20">
                  LIVE (3 Blind Bids)
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-outline border border-outline-variant/20">
                  AUDIT COMPLETED
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-primary text-primary-on font-bold shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  CONTRACTED
                </span>
                <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-surface-container text-outline/50 border border-outline-variant/10">
                  CLOSED
                </span>
              </div>

              {/* Structured Contract Metadata Matrix (6-Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20">
                {/* Col 1 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Empanelled EPC Vendor
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-on-surface font-bold">SolarGrid India Pvt Ltd</span>
                    <BadgeCheck className="w-4 h-4 text-secondary shrink-0" />
                  </div>
                  <span className="text-[11px] text-primary">MNRE &amp; DISCOM Empanelled</span>
                </div>

                {/* Col 2 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Contract Validity &amp; Model
                  </span>
                  <div className="text-sm text-on-surface font-semibold">25-Year RESCO Lease</div>
                  <span className="text-[11px] text-outline">Expires 12 Oct 2050 (Renewal Opt.)</span>
                </div>

                {/* Col 3 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Final Sealed Tariff
                  </span>
                  <div className="text-base text-secondary font-bold font-mono">
                    ₹3.40 <span className="text-xs font-normal text-on-surface-variant">/ kWh</span>
                  </div>
                  <span className="text-[11px] text-primary">42% cheaper than DISCOM grid</span>
                </div>

                {/* Col 4 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Blind-Auction Enclave Log
                  </span>
                  <div className="text-sm text-on-surface">3 Bids Unsealed On-Chain</div>
                  <span className="font-mono text-[10px] text-outline truncate">Hash: 0x7fa9...3b92</span>
                </div>

                {/* Col 5 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Net Society Escrow
                  </span>
                  <div className="text-sm text-primary font-semibold">Auto-Settled 5th / Month</div>
                  <span className="text-[11px] text-outline">Green Meadows Co-op Escrow</span>
                </div>

                {/* Col 6 */}
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Rooftop Structural Audit
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-on-surface font-semibold">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>Load: 180 kg/m²</span>
                  </div>
                  <span className="text-[11px] text-outline">Wind zone III compliant</span>
                </div>
              </div>

              {/* Bottom Footer Action Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 text-xs">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-outline shrink-0" />
                  Tripartite PPA Document v4.1 signed by RWA Secretary &amp; EPC Director
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPpaModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 transition-colors font-medium flex items-center justify-center gap-1.5"
                    type="button"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Signed PPA</span>
                  </button>
                  <button
                    onClick={() => setIsLedgerModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-tertiary border border-outline-variant/30 transition-colors font-medium flex items-center justify-center gap-1"
                    type="button"
                  >
                    <span>View Escrow Ledger</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE SOCIETY ROOFTOPS & TENDERS (LIVE SYNCED FROM /api/listings) */}
            <div className="glass-panel-l2 rounded-xl p-6 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-base font-bold text-on-surface">
                    Society Rooftop Listings
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Live Feed (/api/listings)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLiveRwaData}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Refresh Live Data"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLoadingLive ? "animate-spin text-primary" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsListingModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-primary text-primary-on font-mono text-[11px] font-bold flex items-center gap-1 hover:brightness-110"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Rooftop</span>
                  </button>
                </div>
              </div>

              {isLoadingLive ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant font-mono text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Syncing listings from PostgreSQL...</span>
                </div>
              ) : listings.length === 0 ? (
                <div className="p-6 rounded-lg bg-surface-container/50 border border-outline-variant/20 text-center space-y-2">
                  <p className="text-xs text-on-surface-variant">No active society rooftops created yet.</p>
                  <button
                    onClick={() => setIsListingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 border border-primary/30"
                  >
                    List First Rooftop for Bidding
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {listings.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-xl bg-surface-container/70 border border-outline-variant/30 flex flex-col gap-2 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-heading font-bold text-sm text-on-surface">
                            {l.societyName || l.society}
                          </div>
                          <div className="text-[11px] text-on-surface-variant font-mono">
                            {l.location || "Mira Road, Mumbai"}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                          {l.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-outline-variant/20">
                        <span className="text-outline">
                          Usable Area: <strong className="text-on-surface">{l.area.toLocaleString()} sq.ft</strong>
                        </span>
                        <span className="text-secondary font-bold">
                          {l._count?.bids ?? 0} Bids Logged
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE BLIND BIDS RECEIVED ON SOCIETY ROOFTOPS (SYNCED FROM /api/bids) */}
            <div className="glass-panel-l2 rounded-xl p-6 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-secondary" />
                  <h3 className="font-heading text-base font-bold text-on-surface">
                    Blind Bids Received
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                    Live Feed (/api/bids)
                  </span>
                </div>
                <span className="text-xs font-mono text-outline">
                  {bids.length} Total Enclave Offers
                </span>
              </div>

              {isLoadingLive ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-on-surface-variant font-mono text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                  <span>Unsealing blind bids...</span>
                </div>
              ) : bids.length === 0 ? (
                <div className="p-6 rounded-lg bg-surface-container/50 border border-outline-variant/20 text-center space-y-1">
                  <p className="text-xs text-on-surface">No blind bids submitted yet for your society listings.</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Empanelled EPC vendors will submit encrypted tariff offers via SGX enclave.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left font-mono">
                    <thead className="text-[10px] text-outline uppercase bg-surface-container/80 border-b border-outline-variant/20">
                      <tr>
                        <th className="p-2.5">Bid ID / Target</th>
                        <th className="p-2.5">Quoted Tariff</th>
                        <th className="p-2.5">Capacity</th>
                        <th className="p-2.5">Vendor</th>
                        <th className="p-2.5">Enclave Status</th>
                        <th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                      {bids.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-container/40">
                          <td className="p-2.5 font-bold">
                            <div className="text-primary">{b.id.substring(0, 10)}...</div>
                            <div className="text-[10px] text-outline font-normal">
                              {b.listing?.societyName || "Society Terrace"}
                            </div>
                          </td>
                          <td className="p-2.5 text-secondary font-bold text-sm">
                            ₹{b.amount.toFixed(2)} / kWh
                          </td>
                          <td className="p-2.5">
                            {b.kwp} kWp
                          </td>
                          <td className="p-2.5">
                            <span className="text-on-surface">
                              {b.vendor?.name || b.vendor?.email || "Tier-1 Vendor"}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              b.status === "ACCEPTED"
                                ? "bg-primary/20 text-primary border border-primary/30 font-bold"
                                : "bg-secondary/10 text-secondary border border-secondary/20"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {b.status === "ACCEPTED" ? (
                              <span className="text-primary font-bold text-[11px]">Contracted</span>
                            ) : (
                              <button
                                onClick={() => handleAcceptBid(b.id)}
                                className="px-2.5 py-1 rounded bg-primary hover:bg-primary-fixed-dim text-primary-on text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                              >
                                Accept Bid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 4 of 12 columns */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* ACTIVE TICKETS & MAINTENANCE MODULE */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-secondary" />
                  <h3 className="font-heading text-base font-semibold text-on-surface">
                    Tickets &amp; Maintenance
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchTickets}
                    className="p-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Refresh Tickets"
                  >
                    <RotateCw className={`w-3 h-3 ${isLoadingTickets ? "animate-spin text-secondary" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsRaiseTicketOpen(true)}
                    className="px-2.5 py-1 rounded bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                    type="button"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Raise Ticket</span>
                  </button>
                </div>
              </div>

              {/* Ticket List */}
              <div className="flex flex-col gap-3">
                {isLoadingTickets ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant font-mono text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                    <span>Loading tickets from database...</span>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-4 rounded-lg bg-surface-container/50 border border-outline-variant/20 text-center text-xs text-on-surface-variant">
                    No active maintenance tickets logged.
                  </div>
                ) : (
                  tickets.map((tkt) => {
                    const displayTime = tkt.createdAt
                      ? new Date(tkt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : tkt.time || "Just now";

                    const badgeStyle =
                      tkt.status === "Resolved"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : tkt.status === "In Progress"
                        ? "bg-secondary/15 text-secondary border border-secondary/30"
                        : tkt.status === "Open"
                        ? "bg-error/15 text-error border border-error/30"
                        : "bg-tertiary/15 text-tertiary border border-tertiary/30";

                    return (
                      <div
                        key={tkt.id}
                        className="bg-surface-container/70 p-3 rounded-lg flex flex-col gap-1.5 hover:bg-surface-container border border-outline-variant/20 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-on-surface-variant font-semibold">
                            {tkt.id.startsWith("cm") ? `#TKT-${tkt.id.slice(-4).toUpperCase()}` : tkt.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {tkt.priority === "High" && (
                              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase bg-error/20 text-error border border-error/30">
                                High
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${badgeStyle}`}>
                              {tkt.status}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-xs font-medium text-on-surface leading-snug">
                          {tkt.title}
                        </h4>
                        <div className="flex items-center justify-between text-on-surface-variant text-[11px] mt-0.5">
                          <span className="truncate max-w-[170px]">{tkt.unit || "SMA Sunny Tripower unit #01"}</span>
                          <span className="font-mono text-[10px] text-outline shrink-0">{displayTime}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY FEED & CRYPTOGRAPHIC AUDIT TRAIL */}
            <div className="glass-panel-l2 rounded-xl p-5 border border-outline-variant/30 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-tertiary" />
                  <h3 className="font-heading text-base font-semibold text-on-surface">
                    Ledger &amp; Audit Trail
                  </h3>
                </div>
                <span className="font-mono text-[10px] bg-surface-container text-outline border border-outline-variant/30 px-2 py-0.5 rounded uppercase">
                  Verified
                </span>
              </div>

              <div className="flex flex-col gap-4 relative pl-5 text-xs">
                {/* Timeline vertical connector line */}
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-surface-container-highest" />

                {/* Audit Item 1 */}
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[17px] top-1 shadow-glow" />
                  <span className="text-on-surface leading-tight font-medium">
                    Cryptographic Escrow Payout of <strong className="text-primary font-mono">₹18,450</strong> credited
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Green Meadows Co-op Bank • Txn ID #98214</span>
                  <span className="font-mono text-[10px] text-outline">10 mins ago</span>
                </div>

                {/* Audit Item 2 */}
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary absolute -left-[17px] top-1" />
                  <span className="text-on-surface leading-tight font-medium">
                    DISCOM Adani Net-Meter sync acknowledged 50.0 Hz export
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Total grid export 142.8 kWh recorded</span>
                  <span className="font-mono text-[10px] text-outline">2 hrs ago</span>
                </div>

                {/* Audit Item 3 */}
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary absolute -left-[17px] top-1" />
                  <span className="text-on-surface leading-tight font-medium">
                    Tier-1 EPC SolarGrid updated inverter firmware
                  </span>
                  <span className="text-[11px] text-on-surface-variant">SMA Sunny Tripower updated to v4.2.1-SEC</span>
                  <span className="font-mono text-[10px] text-outline">1 day ago</span>
                </div>

                {/* Audit Item 4 */}
                <div className="relative flex flex-col gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline absolute -left-[17px] top-1" />
                  <span className="text-on-surface leading-tight font-medium">
                    Blind-bidding enclave sealed contract hash verified
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Zero-knowledge proof validation certified</span>
                  <span className="font-mono text-[10px] text-outline">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTEGRATED AI ASSISTANT SLIDE-OVER DRAWER (SunLease RWA Copilot) */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-surface-container-lowest/95 backdrop-blur-3xl z-50 shadow-2xl flex flex-col border-l border-outline-variant/40 transition-transform duration-300 ease-in-out ${
          isCopilotOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-on-surface">SunLease Copilot</h3>
                <span className="font-mono text-[9px] bg-secondary/20 text-secondary border border-secondary/30 px-1.5 py-0.2 rounded font-bold">
                  RWA v2.4
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-sans">
                Institutional Energy Legal &amp; Tariff Advisory
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(false)}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PPA Status Pill Strip */}
        <div className="px-4 py-2 bg-surface-container border-b border-outline-variant/20 flex items-center justify-between font-mono text-[11px]">
          <span className="text-on-surface-variant flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Model: PPA RESCO v3.2 Verified
          </span>
          <span className="text-tertiary">Adani Mumbai Grid Norms</span>
        </div>

        {/* Scrollable Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Preset Prompt Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-outline uppercase font-semibold">Suggested Queries:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Explain RESCO revenue share",
                "What happens during site audit?",
                "How is my tariff calculated?",
                "Compare grid tariff vs solar tariff",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-xs border border-outline-variant/30 transition-colors text-left cursor-pointer"
                  type="button"
                >
                  &quot;{chip}&quot;
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-surface-container-high my-1" />

          {/* Messages */}
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.sender === "user" ? "justify-end self-end max-w-[85%]" : "self-start max-w-[92%]"
                }`}
              >
                {msg.sender === "copilot" && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-secondary-on mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                    msg.sender === "user"
                      ? "bg-primary/15 border border-primary/20 text-on-surface rounded-tr-none"
                      : "bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-tl-none flex flex-col gap-2 shadow-sm"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.meta && (
                    <div className="bg-surface-container-lowest p-2.5 rounded-lg font-mono text-xs flex flex-col gap-1 border border-outline-variant/20">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Peak Generation Yield:</span>
                        <span className="text-on-surface font-semibold">{msg.meta.output}</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Agreed Tariff:</span>
                        <span className="text-secondary font-semibold">{msg.meta.tariff}</span>
                      </div>
                      <div className="flex justify-between text-on-surface font-bold pt-1 border-t border-outline-variant/20">
                        <span>Current Est. Month Corpus:</span>
                        <span className="text-primary">{msg.meta.corpus}</span>
                      </div>
                    </div>
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-on font-bold text-[10px] mt-0.5">
                    RWA
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Drawer Chat Input Form */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex flex-col gap-2">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={chatInput}
              disabled={isAiStreaming}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isAiStreaming ? "Copilot is analyzing solar policy & streaming..." : "Ask about your PPA agreement, tariff, DISCOM rules..."}
              className="w-full bg-surface-container-lowest text-on-surface text-xs pl-3 pr-10 py-3 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-primary shadow-inner disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isAiStreaming || !chatInput.trim()}
              className="absolute right-2 p-1.5 rounded-md bg-primary hover:bg-primary-fixed-dim text-primary-on transition-colors cursor-pointer disabled:opacity-40"
            >
              {isAiStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
          <span className="font-mono text-[9px] text-outline text-center">
            SunLease RWA Copilot is restricted strictly to RESCO solar education &amp; DISCOM rules.
          </span>
        </div>
      </aside>

      {/* MODAL 1: RAISE TICKET */}
      {isRaiseTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-secondary" />
                <h3 className="font-heading font-bold text-base text-on-surface">Raise Maintenance Ticket</h3>
              </div>
              <button
                onClick={() => setIsRaiseTicketOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-mono text-on-surface-variant uppercase text-[10px] block mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inverter display error / bird nesting"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="font-mono text-on-surface-variant uppercase text-[10px] block mb-1">
                  Sub-System / Unit
                </label>
                <select
                  value={newTicketUnit}
                  onChange={(e) => setNewTicketUnit(e.target.value)}
                  className="w-full bg-surface-container text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-secondary"
                >
                  <option value="SMA Sunny Tripower unit #01">SMA Sunny Tripower unit #01</option>
                  <option value="Mono-PERC Solar Array String-B">Mono-PERC Solar Array String-B</option>
                  <option value="Adani Bidirectional Net-Meter">Adani Bidirectional Net-Meter</option>
                  <option value="Rooftop Cable Trays & Earthing">Rooftop Cable Trays & Earthing</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-on-surface-variant uppercase text-[10px] block mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Low", "Medium", "High"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewTicketPriority(lvl)}
                      className={`p-2 rounded text-center font-mono ${
                        newTicketPriority === lvl
                          ? "bg-secondary/20 text-secondary border border-secondary"
                          : "bg-surface-container text-on-surface-variant border border-outline-variant/20"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRaiseTicketOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-on font-semibold flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmittingTicket ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LIST NEW ROOFTOP */}
      {isListingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-base text-on-surface">List Additional Society Rooftop</h3>
              </div>
              <button
                onClick={() => setIsListingModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsCreatingListing(true);
                setListingError(null);
                try {
                  const res = await fetch("/api/listings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      societyName: newWing,
                      area: parseFloat(newArea),
                      location: "Mira Road (E), Thane",
                      status: "ACTIVE",
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error(data.error || "Failed to create listing");
                  }
                  setIsListingModalOpen(false);
                  await fetchLiveRwaData();
                } catch (err: any) {
                  setListingError(err.message || "Failed to create listing");
                } finally {
                  setIsCreatingListing(false);
                }
              }}
              className="text-xs text-on-surface-variant flex flex-col gap-3"
            >
              <p>
                Add another terrace block or club house roof under Green Meadows RWA for blind competitive bidding.
              </p>

              {listingError && (
                <div className="p-2.5 rounded-lg bg-error/10 border border-error/30 text-error font-mono text-[11px]">
                  {listingError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase">Wing / Block Name</label>
                  <input
                    type="text"
                    required
                    value={newWing}
                    onChange={(e) => setNewWing(e.target.value)}
                    className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-outline uppercase">Estimated Area (sq.ft)</label>
                  <input
                    type="number"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="bg-surface-container p-2.5 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 flex items-center justify-between">
                <span>Auto-Estimated Potential:</span>
                <strong className="text-primary font-mono">
                  ~{(parseFloat(newArea || "0") * 0.008).toFixed(1)} kWp System Capacity
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsListingModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingListing}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-on font-semibold text-xs flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                >
                  {isCreatingListing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Initialize Tender</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ESCROW LEDGER BREAKDOWN */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-tertiary" />
                <h3 className="font-heading font-bold text-base text-on-surface">Escrow Payout Ledger (Audit Log)</h3>
              </div>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left font-mono">
                <thead className="text-[10px] text-outline uppercase bg-surface-container">
                  <tr>
                    <th className="p-2.5">Billing Month</th>
                    <th className="p-2.5">Export (kWh)</th>
                    <th className="p-2.5">Net Payout</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Txn Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  <tr>
                    <td className="p-2.5 font-bold">October 2025</td>
                    <td className="p-2.5">4,380 kWh</td>
                    <td className="p-2.5 text-primary font-bold">₹18,450.00</td>
                    <td className="p-2.5 text-primary">Settled</td>
                    <td className="p-2.5 text-outline">0x98214...a1</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">September 2025</td>
                    <td className="p-2.5">4,120 kWh</td>
                    <td className="p-2.5 text-primary font-bold">₹17,280.00</td>
                    <td className="p-2.5 text-primary">Settled</td>
                    <td className="p-2.5 text-outline">0x87123...b4</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">August 2025</td>
                    <td className="p-2.5">3,890 kWh</td>
                    <td className="p-2.5 text-primary font-bold">₹15,000.00 (Floor)</td>
                    <td className="p-2.5 text-primary">Settled</td>
                    <td className="p-2.5 text-outline">0x76110...c9</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PPA DOCUMENT VIEWER */}
      {isPpaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-container-low border border-outline-variant/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-base text-on-surface">Signed RESCO Tripartite Agreement</h3>
              </div>
              <button
                onClick={() => setIsPpaModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/30 text-xs font-mono flex flex-col gap-2 max-h-72 overflow-y-auto">
              <div className="text-center font-bold text-on-surface border-b border-outline-variant/20 pb-2">
                TRI-PARTITE POWER PURCHASE &amp; ROOFTOP LEASE CONCESSION
              </div>
              <p className="text-on-surface-variant">
                AGREEMENT DATED: 12TH OCTOBER 2025
              </p>
              <p className="text-on-surface-variant">
                PARTIES: Green Meadows Co-operative Housing Society Ltd. (LESSOR), SolarGrid India Private Limited (LESSEE/DEVELOPER), and Adani Electricity Mumbai Limited (DISTRIBUTION LICENSEE).
              </p>
              <p className="text-on-surface-variant">
                CONCESSION PERIOD: 25 (Twenty Five) Calendar Years from Commercial Operation Date.
              </p>
              <p className="text-on-surface-variant">
                TARIFF RATE: ₹3.40 (Three Indian Rupees and Forty Paise) per kilowatt-hour generated and fed into the net-meter.
              </p>
              <div className="p-2 bg-primary/10 rounded text-primary text-[11px] font-semibold">
                ✓ Cryptographic Stamp: Enclave SHA-256 Hash 0x7fa940e8a2b3... Verified by Maharashtra High Court Notary Enclave.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPpaModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs"
              >
                Close
              </button>
              <button
                onClick={() => setIsPpaModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-on font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Local Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
