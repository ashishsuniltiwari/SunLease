"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sun,
  Key,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

interface AuthTerminalProps {
  initialMode?: "login" | "register";
}

export function AuthTerminal({ initialMode = "login" }: AuthTerminalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    initialMode === "register" ? "" : "admin@palmmeadows.rwa.org"
  );
  const [password, setPassword] = useState(
    initialMode === "register" ? "" : "password123"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"rwa" | "vendor" | "admin">("rwa");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Determine target dashboard based on selected role
  const targetRoute =
    selectedRole === "vendor"
      ? "/dashboard/vendor"
      : selectedRole === "admin"
      ? "/dashboard/admin/verification"
      : "/dashboard/rwa";

  const handleRoleSelect = (role: "rwa" | "vendor" | "admin") => {
    setSelectedRole(role);
    setAuthError(null);
    if (mode === "login") {
      if (role === "rwa") {
        setEmail("admin@palmmeadows.rwa.org");
        setPassword("password123");
      } else if (role === "vendor") {
        setEmail("vendor@solargrid.in");
        setPassword("password123");
      } else {
        setEmail("superadmin@sunlease.io");
        setPassword("password123");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError("Please provide a valid email address");
      setIsLoading(false);
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            role: selectedRole.toUpperCase(),
            name: name.trim() || (selectedRole === "rwa" ? "RWA Committee" : "EPC Solar Vendor"),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setAuthSuccess("Account created successfully! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(targetRoute);
          router.refresh();
        }, 600);
      } else {
        // Sign In
        let res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
          }),
        });

        let data = await res.json();

        // Fallback for prototype demo credentials if user not yet in DB
        if (
          !res.ok &&
          res.status === 401 &&
          (cleanEmail.includes("palmmeadows") ||
            cleanEmail.includes("solargrid") ||
            cleanEmail.includes("sunpower") ||
            cleanEmail.includes("sunlease"))
        ) {
          const autoSeedRes = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              password: cleanPassword,
              role: selectedRole.toUpperCase(),
              name:
                selectedRole === "rwa"
                  ? "Palm Meadows RWA"
                  : selectedRole === "vendor"
                  ? "SolarGrid EPC Solutions"
                  : "SunLease Super Admin",
            }),
          });
          if (autoSeedRes.ok) {
            res = autoSeedRes;
            data = await autoSeedRes.json();
          }
        }

        if (!res.ok) {
          throw new Error(data.error || "Invalid email or password");
        }

        setAuthSuccess("Authenticated successfully! Loading terminal...");
        const userRole = (data.user?.role || selectedRole).toLowerCase();
        const route =
          userRole === "vendor"
            ? "/dashboard/vendor"
            : userRole === "admin"
            ? "/dashboard/admin/verification"
            : "/dashboard/rwa";

        setTimeout(() => {
          router.push(route);
          router.refresh();
        }, 600);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-primary-on shadow-glow group-hover:scale-105 transition-transform">
            <Sun className="w-4 h-4 fill-primary-on" />
          </div>
          <span className="font-heading font-extrabold text-lg text-on-surface tracking-tight">
            Sun<span className="text-primary">Lease</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
        </Link>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
          {/* Middle Top Line */}
          <div className="text-center px-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-on-surface tracking-tight leading-snug">
              Powering Clean Energy Leases for Urban Societies.
            </h1>
          </div>

          {/* Clean and Sleek Authentication Terminal */}
          <div className="w-full rounded-2xl border border-outline-variant/30 glass-panel-l1 shadow-2xl p-6 sm:p-8 bg-surface-container-lowest/90 backdrop-blur-xl">
            <div className="w-full space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-surface-container rounded-lg border border-outline-variant/30 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all text-center cursor-pointer ${
                    mode === "login"
                      ? "bg-surface-container-highest text-primary shadow-sm border border-primary/20"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setAuthError(null);
                    setAuthSuccess(null);
                    if (email.includes("palmmeadows")) setEmail("");
                  }}
                  className={`flex-1 py-1.5 rounded-md font-bold transition-all text-center cursor-pointer ${
                    mode === "register"
                      ? "bg-surface-container-highest text-primary shadow-sm border border-primary/20"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Title & Context */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                  {mode === "register" ? "User Onboarding" : "Authentication Terminal"}
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-on-surface mt-0.5">
                  {mode === "register" ? "Create SunLease Account" : "Sign in to SunLease"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {mode === "register"
                    ? "Register your Housing Society (RWA) or EPC Vendor organization."
                    : "Access your society telemetry, bidding desk, or admin clearance queue."}
                </p>
              </div>

              {/* Role Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-on-surface-variant">
                  {mode === "register" ? "Select Account Role:" : "Select Prototype Role Preview:"}
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-lg border border-outline-variant/30 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("rwa")}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all cursor-pointer ${
                      selectedRole === "rwa"
                        ? "bg-primary text-primary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    RWA Society
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("vendor")}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all cursor-pointer ${
                      selectedRole === "vendor"
                        ? "bg-secondary text-secondary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Solar Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("admin")}
                    className={`py-1.5 px-2 rounded-md font-mono text-[11px] transition-all cursor-pointer ${
                      selectedRole === "admin"
                        ? "bg-tertiary text-tertiary-on font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Platform Admin
                  </button>
                </div>
              </div>

              {/* Status & Error Alerts */}
              {authError && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-mono">{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-mono font-semibold">{authSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Organization / Full Name (Register mode only) */}
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant mb-1">
                      Organization / Society Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={
                          selectedRole === "rwa"
                            ? "e.g. Emerald Heights CHS"
                            : "e.g. Apex Solar Energy Ltd"
                        }
                        className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant mb-1">
                    Authorized Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors font-sans"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono text-on-surface-variant">
                      Password / Security Key
                    </label>
                    {mode === "login" && (
                      <span className="text-[11px] text-outline font-mono">
                        (min 6 chars)
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Trust workstation badge + Forgot Password */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-outline-variant/40 bg-surface-container-low text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Trust this workstation</span>
                  </label>
                  {mode === "login" ? (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-primary hover:underline font-mono"
                    >
                      Forgot password?
                    </Link>
                  ) : (
                    <span className="font-mono text-[10px] text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SSL 256-Bit
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-primary-on font-heading font-bold text-sm hover:brightness-110 shadow-glow flex items-center justify-center gap-2 transition-all group disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === "register" ? "Create Account & Enter" : "Sign In to Terminal"}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Switch Mode Footer */}
              <div className="pt-3 border-t border-outline-variant/20 text-center">
                {mode === "login" ? (
                  <p className="text-xs text-on-surface-variant">
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setAuthError(null);
                        setAuthSuccess(null);
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Create an account with email
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setAuthError(null);
                        setAuthSuccess(null);
                        setEmail("admin@palmmeadows.rwa.org");
                        setPassword("password123");
                      }}
                      className="text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Sign In to Terminal
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="p-4 text-center text-[11px] font-mono text-on-surface-variant/60 relative z-10">
        SunLease State Solar Platform • Empanelled with MNRE &amp; Central DISCOM Regulators • Mumbai Metropolitan Region
      </footer>
    </div>
  );
}
