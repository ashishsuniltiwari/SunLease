"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, ArrowRight, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{
    authenticated: boolean;
    user?: { role: string; email: string; name?: string } | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ authenticated: false, user: null });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const dashboardRoute =
    session?.user?.role?.toUpperCase() === "VENDOR"
      ? "/dashboard/vendor"
      : session?.user?.role?.toUpperCase() === "ADMIN"
      ? "/dashboard/admin/verification"
      : "/dashboard/rwa";

  return (
    <header className="sticky top-0 z-50 glass-panel-l1 border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow group-hover:scale-105 transition-transform">
            <Sun className="w-6 h-6 fill-primary-on" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-on-surface">
              Sun<span className="text-primary">Lease</span>
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant -mt-1 tracking-wider uppercase">
              Solar Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
          <Link href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#societies" className="hover:text-primary transition-colors">
            For Housing Societies
          </Link>
          <Link href="#vendors" className="hover:text-primary transition-colors">
            For Installers
          </Link>
          <Link href="/dashboard/vendor" className="hover:text-primary transition-colors flex items-center gap-1">
            <span>Marketplace Preview</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-secondary/10 text-secondary border border-secondary/30 rounded font-mono">LIVE</span>
          </Link>
        </nav>

        {/* CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session?.authenticated ? (
            <>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                {session.user?.role?.toUpperCase()}
              </span>
              <Link
                href={dashboardRoute}
                className="px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-error/90 hover:text-error border border-error/30 rounded-md bg-error/5 hover:bg-error/15 flex items-center gap-1.5 cursor-pointer transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-on-surface hover:text-white glass-panel-l2 hover:bg-surface-container-high rounded-md transition-all border border-outline-variant/40"
              >
                Dashboard Demo
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-primary-on bg-gradient-to-r from-primary to-primary-container hover:brightness-110 shadow-glow rounded-md transition-all flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-l3 border-b border-outline-variant/30 px-4 py-4 space-y-3">
          <Link href="#how-it-works" className="block text-sm text-on-surface-variant hover:text-primary">
            How It Works
          </Link>
          <Link href="#societies" className="block text-sm text-on-surface-variant hover:text-primary">
            For Housing Societies
          </Link>
          <Link href="#vendors" className="block text-sm text-on-surface-variant hover:text-primary">
            For Installers
          </Link>
          <Link href="/dashboard/vendor" className="block text-sm text-primary">
            Marketplace Preview
          </Link>
          <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-2">
            {session?.authenticated ? (
              <>
                <Link
                  href={dashboardRoute}
                  className="w-full text-center py-2 text-xs font-semibold text-primary border border-primary/30 rounded-md bg-primary/10"
                >
                  Go to {session.user?.role} Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-xs font-semibold text-error border border-error/30 rounded-md bg-error/10 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-2 text-xs font-semibold text-on-surface glass-panel-l2 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="w-full text-center py-2 text-xs font-semibold text-primary-on bg-primary rounded-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
