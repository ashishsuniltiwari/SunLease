"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  Building2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sun,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function RwaAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your SunLease AI Solar Engineer. Based on your Palm Meadows CHS telemetry (120 kWp rooftop capacity, 14,500 sq ft, Adani Electricity circle), how can I assist you with rooftop feasibility, lease earnings, or tariff comparisons today?",
      time: "10:00 AM",
    },
    {
      role: "user",
      content: "What is our estimated 25-year cumulative lease revenue versus Capex?",
      time: "10:02 AM",
    },
    {
      role: "assistant",
      content:
        "Under the SunLease Lease-OPEX model:\n\n• Zero Capex Requirement: ₹0 initial outlay for Palm Meadows CHS.\n• Guaranteed Annual Lease: ₹4.8 Lakhs/year indexed at 2.5% inflation.\n• 25-Year Cumulative Yield: ₹1.68 Crores pure profit without maintenance obligations.\n• Inverter/Panel Degradation Risk: 100% absorbed by the empanelled EPC vendor.\n\nCompared to self-funded CAPEX (approx ₹62 Lakhs initial cost with ~5.2 year payback), the SunLease model eliminates society liquidity lockup.",
      time: "10:02 AM",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = {
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [
      ...prev,
      newMsg,
      {
        role: "assistant",
        content: `I've analyzed your inquiry regarding "${input}". Under current MSEDCL/Adani net-metering regulations and the latest MNRE RTS Phase-II directives, your society qualifies for rooftop green energy credits with an estimated solar generation ratio of 4.2 kWh/kWp/day.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <DashboardLayout title="AI Solar Assistant & Feasibility Copilot">
      <div className="max-w-4xl space-y-6">
        {/* Banner */}
        <div className="glass-panel-l1 rounded-xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
                <Bot className="w-3 h-3" /> GPT-4o SOLAR ENGINE
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Trained on MNRE & DISCOM Net-Metering Policies
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              RWA Solar Feasibility Copilot
            </h1>
          </div>
          <Link
            href="/dashboard/rwa"
            className="px-3.5 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {[
            "Analyze DISCOM net-metering savings",
            "What happens if vendor delays installation?",
            "Explain SGX Blind Auction benefits",
            "Calculate carbon offset for 120 kWp",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-[11px] text-on-surface-variant hover:text-on-surface hover:border-primary/50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-primary" /> {prompt}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="glass-panel-l1 rounded-xl border border-outline-variant/30 flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl p-3.5 text-xs whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-primary-on font-medium"
                      : "bg-surface-container-low border border-outline-variant/20 text-on-surface"
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      m.role === "user" ? "text-primary-on/70 text-right" : "text-on-surface-variant/60"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-outline-variant/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about rooftop solar feasibility, contracts, or tariffs..."
              className="flex-1 px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-on rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
