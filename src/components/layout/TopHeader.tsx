"use client";

import { Search, Bell, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="h-16 border-b border-outline-variant/20 glass-panel-l1 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="font-heading font-bold text-lg text-on-surface tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-on-surface-variant font-mono">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Search roofs, bids, telemetry..."
            className="w-64 bg-surface-container-low border border-outline-variant/30 rounded-md pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* System Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/30 text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-on-surface-variant">IoT Engine:</span>
          <span className="text-primary font-semibold">Simulated MQTT Online</span>
        </div>

        {/* Notifications Bell */}
        <button className="relative p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-secondary absolute top-1.5 right-1.5" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-container/30 border border-primary/40 flex items-center justify-center font-bold text-primary text-xs">
            SL
          </div>
        </div>
      </div>
    </header>
  );
}
