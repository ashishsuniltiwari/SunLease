"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  LayoutDashboard,
  Building2,
  FileCheck2,
  Bot,
  Store,
  Gavel,
  Activity,
  Wrench,
  ShieldAlert,
  UserCheck,
  Home,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
  const isVendor = (pathname.startsWith("/vendor") || pathname.startsWith("/dashboard/vendor")) && !isAdmin;
  const isRwa = (pathname.startsWith("/rwa") || pathname.startsWith("/dashboard/rwa")) && !isVendor && !isAdmin;
  const activeRole = isAdmin ? "ADMIN" : isVendor ? "VENDOR" : isRwa ? "RWA" : "ADMIN";

  const itemClass = (path: string) => {
    const active =
      pathname === path ||
      (path === "/dashboard/rwa" && pathname === "/rwa/dashboard") ||
      (path === "/dashboard/vendor" && pathname === "/vendor/marketplace") ||
      (path === "/vendor/maintenance" && pathname === "/dashboard/vendor/maintenance") ||
      (path === "/dashboard/admin/verification" && pathname === "/admin/reviews") ||
      (path === "/dashboard/admin/directory" && pathname === "/admin/vendors");
    return `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
      active
        ? "bg-primary-container/20 text-primary border border-primary/40 font-semibold"
        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
    }`;
  };

  return (
    <aside className="w-60 glass-panel-l1 border-r border-outline-variant/30 flex flex-col h-screen sticky top-0 shrink-0 z-40">
      <div className="p-3 border-b border-outline-variant/20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow">
            <Sun className="w-4 h-4 fill-primary-on" />
          </div>
          <span className="font-heading font-bold text-base text-on-surface tracking-tight">
            Sun<span className="text-primary">Lease</span>
          </span>
        </Link>
        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded font-semibold border bg-primary/10 text-primary border-primary/30">
          {activeRole}
        </span>
      </div>

      <div className="p-2 border-b border-outline-variant/20 bg-surface-container-lowest/50">
        <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-md border border-outline-variant/30">
          <Link
            href="/dashboard/rwa"
            className={`py-1 text-[10px] text-center rounded transition-colors ${
              isRwa ? "bg-primary text-primary-on font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            RWA
          </Link>
          <Link
            href="/dashboard/vendor"
            className={`py-1 text-[10px] text-center rounded transition-colors ${
              isVendor ? "bg-secondary text-secondary-on font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Vendor
          </Link>
          <Link
            href="/dashboard/admin/verification"
            className={`py-1 text-[10px] text-center rounded transition-colors ${
              isAdmin ? "bg-tertiary text-tertiary-on font-bold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Admin
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* RWA Section */}
        <div>
          <div className="text-[10px] font-mono text-on-surface-variant/70 uppercase mb-1.5 px-2">RWA Society</div>
          <div className="space-y-0.5">
            <Link href="/dashboard/rwa" className={itemClass("/dashboard/rwa")}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard & Telemetry
            </Link>
            <Link href="/rwa/listings/new" className={itemClass("/rwa/listings/new")}>
              <Building2 className="w-3.5 h-3.5" /> List New Rooftop
            </Link>
            <Link href="/rwa/listings/1/bids" className={itemClass("/rwa/listings/1/bids")}>
              <FileCheck2 className="w-3.5 h-3.5" /> Blind Bids
            </Link>
            <Link href="/rwa/assistant" className={itemClass("/rwa/assistant")}>
              <Bot className="w-3.5 h-3.5 text-primary" /> AI Assistant
            </Link>
          </div>
        </div>

        {/* Solar Vendor Section */}
        <div>
          <div className="text-[10px] font-mono text-on-surface-variant/70 uppercase mb-1.5 px-2">Solar Vendor</div>
          <div className="space-y-0.5">
            <Link href="/dashboard/vendor" className={itemClass("/dashboard/vendor")}>
              <Store className="w-3.5 h-3.5" /> Live Marketplace
            </Link>
            <Link href="/vendor/bids" className={itemClass("/vendor/bids")}>
              <Gavel className="w-3.5 h-3.5" /> My Submitted Bids
            </Link>
            <Link href="/vendor/fleet" className={itemClass("/vendor/fleet")}>
              <Activity className="w-3.5 h-3.5" /> Contracted Fleet
            </Link>
            <Link href="/vendor/maintenance" className={itemClass("/vendor/maintenance")}>
              <Wrench className="w-3.5 h-3.5 text-secondary" /> Maintenance Desk
            </Link>
            <Link href="/vendor/verification" className={itemClass("/vendor/verification")}>
              <UserCheck className="w-3.5 h-3.5" /> DISCOM Verification
            </Link>
          </div>
        </div>

        {/* Platform Admin Section */}
        <div>
          <div className="text-[10px] font-mono text-on-surface-variant/70 uppercase mb-1.5 px-2">Platform Admin</div>
          <div className="space-y-0.5">
            <Link href="/dashboard/admin/verification" className={itemClass("/dashboard/admin/verification")}>
              <ShieldAlert className="w-3.5 h-3.5" /> Verification Queue
            </Link>
            <Link href="/dashboard/admin/directory" className={itemClass("/dashboard/admin/directory")}>
              <UserCheck className="w-3.5 h-3.5" /> Vendor Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-outline-variant/20 bg-surface-container-lowest/40 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-on-surface px-1">{activeRole} Mode</span>
        <Link href="/" className="p-1 hover:text-primary text-on-surface-variant" title="Public Home">
          <Home className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
