"use client";

import Link from "next/link";
import { Sun, ShieldCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Verification Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs font-mono text-on-surface-variant tracking-wider uppercase">
              Empanelled vendor verification enforced. Blind bids remain strictly hidden from competitors.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              DISCOM Synchronized
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Audited Bids
            </span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-2">
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col gap-4 pr-0 lg:pr-8 lg:border-r border-outline-variant/20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow">
                <Sun className="w-6 h-6 fill-primary-on" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl tracking-tight text-on-surface">
                  Sun<span className="text-primary">Lease</span>
                </span>
                <span className="text-[10px] font-mono text-primary uppercase font-semibold tracking-wider -mt-1">
                  Solar Clean Infrastructure
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-md">
              India&apos;s dedicated rooftop solar bidding &amp; yield underwriting marketplace connecting cooperative housing societies directly with Tier-1 accredited EPC developers.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-primary text-[10px] font-mono uppercase font-semibold">
                RESCO &amp; Capex Engine
              </span>
              <span className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30 text-secondary text-[10px] font-mono uppercase font-semibold">
                DISCOM Integrated
              </span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-heading font-semibold text-sm text-on-surface">Platform</span>
              <Link href="/how-it-works" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/for-societies" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                For Housing Societies
              </Link>
              <Link href="/for-vendors" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                For Solar Installers
              </Link>
              <Link href="/dashboard/vendor" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Live Marketplace
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-heading font-semibold text-sm text-on-surface">Company</span>
              <Link href="/about" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                About SunLease
              </Link>
              <Link href="/contact" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Contact &amp; Support
              </Link>
              <Link href="/forgot-password" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Account Recovery
              </Link>
              <Link href="/login" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Sign In
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-heading font-semibold text-sm text-on-surface">Governance</span>
              <Link href="/vendor/verification" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                DISCOM Guidelines
              </Link>
              <Link href="/for-societies" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                RESCO Lease Model
              </Link>
              <Link href="/for-vendors" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Blind Bidding Rules
              </Link>
              <Link href="/about" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                Security Architecture
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-on-surface-variant/70">
          <span>&copy; {new Date().getFullYear()} SunLease Technologies Pvt Ltd. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="hover:text-primary transition-colors">Architecture</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Inquiries</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
