"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RotateCw } from "lucide-react";

export default function RwaLegacyBidsRedirect() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/listings?myOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.listings && data.listings.length > 0) {
          router.replace(`/rwa/listings/${data.listings[0].id}/bids`);
        } else {
          fetch("/api/listings")
            .then((res2) => res2.json())
            .then((data2) => {
              if (data2.listings && data2.listings.length > 0) {
                router.replace(`/rwa/listings/${data2.listings[0].id}/bids`);
              } else {
                setError("No listings available yet.");
              }
            })
            .catch(() => setError("No listings found."));
        }
      })
      .catch(() => setError("Failed to resolve active listing."));
  }, [router]);

  return (
    <DashboardLayout title="Redirecting to Active Blind Bids...">
      <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-xs text-on-surface-variant">
        <RotateCw className="w-6 h-6 animate-spin text-primary" />
        <span>{error || "Connecting to your society's blind bidding enclave..."}</span>
      </div>
    </DashboardLayout>
  );
}
