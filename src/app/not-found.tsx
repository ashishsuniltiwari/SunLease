import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AlertCircle, Home, ArrowRight, ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full flex items-center justify-center px-4 py-16">
        <div className="glass-panel-l1 rounded-2xl p-8 sm:p-12 border border-outline-variant/30 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto border border-outline-variant/30">
            <AlertCircle className="w-8 h-8 text-secondary" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-outline text-[11px] font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>S-05 · Resource Masked (404)</span>
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-on-surface">
              Page or Listing Not Found
            </h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The requested resource does not exist, has been withdrawn, or is masked by cryptographic enclave access controls.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary text-primary-on text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-glow"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to SunLease Home</span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Portal Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
