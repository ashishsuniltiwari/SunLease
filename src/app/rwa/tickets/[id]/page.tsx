"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Wrench,
  Send,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Check,
  XCircle,
} from "lucide-react";

export default function TicketThreadPage() {
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load ticket");
      }
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message || "Failed to fetch ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      setReplyMessage("");
      setTicket(data.ticket);
    } catch (err: any) {
      alert(`Send error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusAction = async (action: "REOPEN" | "RESOLVE" | "CLOSE") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update ticket status");
      }
      setTicket(data.ticket);
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Support & Maintenance Ticket Thread">
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
          <RotateCw className="w-6 h-6 animate-spin text-primary" />
          <span>Loading ticket messages and technical diagnosis thread...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardLayout title="Support & Maintenance Ticket Thread">
        <div className="glass-panel-l1 rounded-2xl p-8 border border-error/30 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-error mx-auto" />
          <h2 className="text-lg font-heading font-bold text-on-surface">Ticket Not Found</h2>
          <p className="text-xs text-on-surface-variant">{error || "Unable to locate this maintenance ticket."}</p>
          <Link
            href="/dashboard/rwa"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-on text-xs font-bold"
          >
            &larr; Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const messages: any[] = Array.isArray(ticket.messages) ? ticket.messages : [];
  const statusLower = (ticket.status || "open").toLowerCase();
  const isOpen = statusLower === "open" || statusLower === "in progress";

  return (
    <DashboardLayout title={`Ticket #${ticket.id.slice(-6).toUpperCase()} — ${ticket.title}`}>
      <div className="max-w-4xl space-y-6">
        {/* Ticket Header Card */}
        <div className="glass-panel-l1 rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/30">
                R-11 · MAINTENANCE DESK
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                statusLower === "open"
                  ? "bg-warning/15 text-warning border-warning/30"
                  : statusLower === "resolved"
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
              }`}>
                {ticket.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-secondary bg-secondary/10 border border-secondary/20">
                {ticket.priority} Priority
              </span>
            </div>
            <h1 className="text-xl font-heading font-bold text-on-surface">
              {ticket.title}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
              Inverter Unit: <strong className="text-on-surface">{ticket.unit || "SMA Sunny Tripower #01"}</strong> • Created {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {isOpen ? (
              <button
                onClick={() => handleStatusAction("RESOLVE")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-glow disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            ) : (
              <button
                onClick={() => handleStatusAction("REOPEN")}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-lg bg-secondary text-secondary-on text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reopen Ticket</span>
              </button>
            )}

            <Link
              href="/dashboard/rwa"
              className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Message Thread Container */}
        <div className="glass-panel-l1 rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
            <span className="text-xs font-heading font-bold text-on-surface flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Conversation Thread ({messages.length} messages)
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">
              Live Modbus SLA Tracking
            </span>
          </div>

          {/* Messages List */}
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto divide-y divide-outline-variant/15">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant font-mono">
                No messages yet. Send a note to the solar vendor below.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isRwa = m.senderRole === "RWA" || m.sender?.toLowerCase().includes("rwa") || m.sender?.toLowerCase().includes("admin@palm");
                const isVendor = m.senderRole === "VENDOR" || m.sender?.toLowerCase().includes("vendor");

                return (
                  <div key={m.id || idx} className={`pt-4 first:pt-0 space-y-1.5 ${isRwa ? "text-left" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-heading font-bold text-on-surface">
                        {m.sender || "Support Desk"}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-semibold ${
                        isRwa
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isVendor
                          ? "bg-secondary/10 text-secondary border border-secondary/20"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        {m.senderRole || (isRwa ? "RWA Committee" : isVendor ? "Solar EPC Vendor" : "System")}
                      </span>
                      <span className="text-[10px] font-mono text-outline ml-auto">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container text-xs text-on-surface leading-relaxed max-w-2xl font-sans">
                      {m.text || m.body || m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                rows={2}
                required
                placeholder="Type your response to the EPC contractor or technician..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full bg-surface-container px-3.5 py-2 rounded-lg border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !replyMessage.trim()}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-glow disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? "Sending..." : "Reply"}</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
