import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SunLease — Rooftop Solar Marketplace",
  description: "The Airbnb for Solar Panels. Monetize idle rooftops, blind-bidding marketplace for verified installers, real-time IoT telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-white">
        {children}
      </body>
    </html>
  );
}
