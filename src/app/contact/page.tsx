"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [societyOrCompany, setSocietyOrCompany] = useState("");
  const [inquiryType, setInquiryType] = useState("RWA_SOCIETY");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{ inquiryRef: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          societyOrCompany,
          inquiryType,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setReceipt(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>P-06 · CONTACT &amp; INQUIRIES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-on-surface">
            Get in Touch with the SunLease Team
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Have questions about Rooftop Solar feasibility, RESCO lease structuring, or installer empanelment? Our team is here to assist.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 space-y-4">
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Regional Solar Desks
              </h3>
              <p className="text-xs text-on-surface-variant">
                Direct lines to our energy engineering and DISCOM regulatory teams.
              </p>

              <div className="space-y-4 text-xs pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-on-surface font-semibold block">Headquarters (MMR Circle)</strong>
                    <span className="text-on-surface-variant leading-relaxed">
                      Level 7, Techniplex-II, S.V. Road, Goregaon West, Mumbai, MH 400062
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-on-surface font-semibold block">RWA Advisory Helpline</strong>
                    <span className="text-on-surface-variant font-mono">+91 (022) 4890-7700 / 1800-SUNLEASE</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-on-surface font-semibold block">Electronic Mail</strong>
                    <span className="text-on-surface-variant font-mono">support@sunlease.io • tenders@sunlease.io</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-on-surface font-semibold block">Support Working Hours</strong>
                    <span className="text-on-surface-variant">Monday to Saturday: 09:30 - 18:30 IST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3 text-xs">
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <div className="text-on-surface-variant">
                <span>Are you a managing committee member? You can scan your rooftop directly without scheduling a call:</span>
                <Link href="/rwa/listings/new" className="text-primary hover:underline font-semibold block mt-0.5">
                  Launch Rooftop Feasibility Scanner &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="lg:col-span-7 glass-panel-l2 rounded-2xl p-6 sm:p-8 border border-outline-variant/30">
            {receipt ? (
              <div className="p-6 rounded-xl bg-primary/10 border border-primary/30 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <h3 className="font-heading font-bold text-lg text-on-surface">Inquiry Successfully Registered!</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  {receipt.message}
                </p>
                <div className="p-2.5 rounded bg-surface-container font-mono text-xs text-primary inline-block">
                  Reference: <strong>{receipt.inquiryRef}</strong>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setReceipt(null);
                      setMessage("");
                    }}
                    className="text-xs text-on-surface-variant hover:text-on-surface underline font-semibold"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                      Work / Personal Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rajesh@palmmeadows.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98200 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                      Housing Society / Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Palm Meadows Co-op Housing Society"
                      value={societyOrCompany}
                      onChange={(e) => setSocietyOrCompany(e.target.value)}
                      className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                    Inquiry Nature
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                  >
                    <option value="RWA_SOCIETY">Housing Society Committee Inquiry (RESCO Lease)</option>
                    <option value="EPC_VENDOR">Solar EPC Installer / Developer Empanelment</option>
                    <option value="DISCOM_REGULATORY">DISCOM / Regulatory Authority Net-Metering</option>
                    <option value="GENERAL_MEDIA">Media, Investors &amp; General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-mono uppercase mb-1 font-semibold">
                    Message / Rooftop Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your society rooftop area (approx sq.ft), common area electricity spend, or specific questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-primary text-primary-on font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Transmitting..." : "Send Inquiry to Solar Desk"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
