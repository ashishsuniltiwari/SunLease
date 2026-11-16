# SunLease — 2-Week College Proof-of-Concept (PoC) Implementation Plan

**Project:** SunLease (Rooftop Solar Marketplace & Simulated IoT Telemetry Platform)  
**Context:** 2-Week Academic Capstone / Hackathon Proof-of-Concept Presentation  
**Target Delivery:** 14 Calendar Days  
**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Lucide React, Recharts, SQLite (via Prisma) / Supabase  

---

## 1. Executive Summary & PoC Scope

This implementation plan is an accelerated, presentation-focused rewrite of the production architecture. It is strictly optimized for a live, 10–15 minute college presentation before evaluators and professors. 

### Core Simplifications from Production
1. **Zero DevOps / Container Overhead:**  
   No Docker, Kubernetes, CI/CD pipelines, MinIO, or cloud provisioning. The entire prototype runs locally with `npm run dev` or deploys seamlessly as a single project on Vercel.
2. **Simplified Persistence (SQLite / Supabase):**  
   Replaces enterprise cluster databases with local SQLite (via Prisma) or a free-tier Supabase project for instant setup with relational schemas (Users, Listings, Bids, Tickets).
3. **Simulated IoT & Telemetry Nervous System:**  
   Replaces external MQTT brokers (Mosquitto/HiveMQ) and TimescaleDB hypertables with a client-side/API JavaScript telemetry simulator that produces realistic diurnal solar generation curves, simulated cloud dips, and live kilowatt counters.
4. **Mocked Document Storage:**  
   Replaces private S3/MinIO pre-signed buckets with browser-side state or base64 preview stubs for vendor licenses and structural audit certificates.
5. **Interactive Role Switcher for Live Demo:**  
   Provides a persistent floating toolbar allowing the presenter to switch between **Housing Society (RWA)**, **Solar EPC Vendor**, and **Admin** personas with a single click during the faculty evaluation.

---

## 2. 14-Day Timeline Breakdown

```
[WEEK 1: Days 1–7]  Core Marketplace & UI Flows
├─ Day 01–02: Project Foundation, Design Tokens & Component Shell
├─ Day 03–04: Public Experience, Landing Page & Interactive Yield Calculator
├─ Day 05–06: Housing Society (RWA) Listing & Blind-Bid Review Flow
└─ Day 07:    Solar Vendor Portal & Sealed Bid Submission

[WEEK 2: Days 8–14] Simulated IoT, Maintenance Desk & Presentation Polish
├─ Day 08–09: Simulated Real-Time IoT Telemetry Dashboard (Recharts + JS Generator)
├─ Day 10–11: Maintenance Desk & Simulated Inverter Fault Alerts
├─ Day 12:    Admin Verification Desk & Quick Persona Demo Switcher
├─ Day 13:    Demo Data Seeding & Presentation Rehearsal
└─ Day 14:    Final Demo Slide Deck & College Project Defense
```

---

## 3. Detailed Day-by-Day Implementation Tasks

### Week 1: Marketplace UI & User Journeys

#### Day 01–02: Foundation, Layouts & Shared Components
* **UI/UX:**
  * Configure Tailwind CSS theme tokens (`surface-container-*`, `primary`, `secondary`, `font-mono`, `glass-panel-*`).
  * Integrate shared navigation components (`Navbar.tsx`, `Sidebar.tsx`, `TopHeader.tsx`, `DashboardLayout.tsx`).
  * Build reusable presentation UI components: Stat cards, status badges, metric chips, and glassmorphic modal wrappers.
* **Data Layer:**
  * Initialize Prisma with SQLite (`prisma/schema.prisma`):
    * Models: `User`, `RoofListing`, `Bid`, `Ticket`.
  * Create mock data seed script (`prisma/seed.ts` or local JSON fixtures) with pre-populated Mumbai housing societies (e.g., *Green Meadows Co-op*, *Sea Breeze Tower*).
* **Deliverable:** Bootable local application with working navigation shells and consistent dark-mode glassmorphic theme.

#### Day 03–04: Landing Page & Solar Yield Calculator
* **UI/UX:**
  * Build complete high-editorial landing page (`src/app/page.tsx`):
    * Hero section with authority headline and PM Surya Ghar verification badges.
    * Interactive Satellite Scanner HUD preview card with "Tune Obstructions" overlay.
    * DISCOM Interconnection banner (Adani, Tata Power, MSEDCL, MNRE).
    * 4-step procurement timeline (`Satellite Scan` → `Blind Bidding` → `In-Person Audit` → `Monitored Payouts`).
    * Dual-persona value proposition comparison (RWAs vs. EPC Installers).
  * Build interactive client-side **Solar Yield Calculator**:
    * Dynamic input controls: DISCOM selector dropdown, rooftop area input/range slider with presets (3k, 8k, 15k, 25k sq.ft).
    * Real-time reactive formula: Recommended kWp, panel estimates, annual rent range, and 25-year indexed corpus fund.
    * Free society consultation lead capture modal with instant success state.
* **Deliverable:** Visually impressive public storefront that showcases the business model immediately to evaluators.

#### Day 05–06: Housing Society (RWA) Portal & Blind-Bidding Flow
* **UI/UX:**
  * Build RWA Dashboard overview (`/rwa/dashboard`):
    * Roof status card, current savings counter, active bids counter, and quick action bar.
  * Build Roof Listing wizard (`/rwa/listings/new`):
    * Form fields: Society name, DISCOM consumer number, rooftop square footage, sanctioned load, satellite coordinates.
    * Mock satellite area confirmation preview.
  * Build Blind-Bid Review & Comparison screen (`/rwa/listings/[id]/bids`):
    * Sealed-bid view while tender is active.
    * Unsealed comparison matrix when auction closes: Vendor tier, tariff rate (₹/kWh), proposed capacity (kWp), guaranteed annual lease, and warranty tenure.
    * "Accept Bid & Schedule Structural Audit" action modal.
* **Deliverable:** Complete society workflow demonstrating how housing committees list terraces and evaluate competitive bids transparently.

#### Day 07: Solar Vendor Portal & Sealed Bid Submission
* **UI/UX:**
  * Build Vendor Marketplace feed (`/vendor/marketplace`):
    * Search & filter listings by DISCOM area, minimum roof size, and tariff model.
    * Pre-qualified listing cards with usable area, shadow obstruction percentage, and tender countdown timer.
  * Build Bid Submission Drawer/Modal:
    * Vendor input: Proposed kWp system size, panel brand, tariff rate / monthly lease offer, and completion timeline.
    * Cryptographic seal confirmation badge ("Bid hashed and sealed until tender deadline").
  * Build Vendor Document verification stub (`/vendor/profile`):
    * Simulated upload fields for MNRE empanelment certificate and GSTIN.
* **Deliverable:** Working marketplace where an installer can discover society listings and submit competitive bids.

---

### Week 2: IoT Simulation, Maintenance & Presentation Prep

#### Day 08–09: Simulated Real-Time IoT Telemetry Dashboard
* **Telemetry Simulator (JavaScript Engine):**
  * Create a modular JavaScript telemetry generator (`src/lib/telemetrySimulator.ts`):
    * Generates realistic 24-hour diurnal solar bell curves peaking between 11:30 AM and 1:30 PM.
    * Simulates live instantaneous output (kW), daily cumulative yield (kWh), inverter temperature (°C), and grid voltage.
    * Built-in dynamic state with a 3-second tick interval using `useEffect` or React hooks.
* **UI/UX:**
  * Build RWA Live Telemetry View (`/rwa/telemetry`):
    * Key metric cards: Current Generation (kW), Today's Yield (kWh), Lifetime Revenue (₹), CO2 Offset (Metric Tons).
    * Recharts line/area chart showing real-time generation vs. theoretical clear-sky baseline.
    * Tabular telemetry logs table showing timestamped updates.
  * Add interactive simulator controls for the demo presentation:
    * Toggle "Simulate Cloud Cover" (drops output by 40%).
    * Toggle "Simulate Inverter Trip / Fault" (drops output to 0 kW).
* **Deliverable:** Live updating solar dashboard that convincingly demonstrates IoT telemetry without requiring physical hardware or MQTT infrastructure.

#### Day 10–11: Maintenance Desk & Automated Fault Alerting
* **UI/UX:**
  * Build RWA & Vendor Maintenance Ticket screens (`/rwa/maintenance` and `/vendor/maintenance`):
    * Ticket status board: `Open`, `In Progress`, `Resolved`.
    * Simulated automated fault ticket: Triggered when "Simulate Inverter Trip" is activated (e.g., *"Auto-Alert: Array #2 Inverter Zero-Yield detected during peak sun window"*).
    * Two-way messaging thread between Society Secretary and Vendor Service Engineer.
    * Quick resolution button to demonstrate full ticket lifecycle to professors.
* **Deliverable:** Reactive maintenance system showing that the platform monitors uptime and protects society revenue automatically.

#### Day 12: Admin Oversight Desk & Persona Demo Switcher
* **UI/UX:**
  * Build Admin Desk overview (`/admin/dashboard`):
    * Platform metrics: Total societies listed, total vendors empanelled, megawatts under management, platform revenue.
    * 1-click vendor approval table to demonstrate credential vetting.
  * Build floating **"PoC Demo Controller"** banner:
    * Visible only in development/demo mode at the bottom-right corner.
    * Quick buttons: `[Switch to RWA]`, `[Switch to Vendor]`, `[Switch to Admin]`, `[Trigger Fault Alert]`, `[Reset Seed Data]`.
* **Deliverable:** Presenter control bar that eliminates login friction during the timed college evaluation.

#### Day 13: Presentation Dry Run & Demo Data Seeding
* **Tasks:**
  * Seed 4 realistic, richly detailed society profiles in Mumbai/MMR:
    1. *Green Meadows Co-op, Mira Road* (Contracted, 92 kWp, Live IoT running).
    2. *Sea Breeze CHS, Bandra West* (Bidding Open, 3 bids received).
    3. *Palm Grove Enclave, Thane* (Audit Scheduled).
    4. *Galaxy Heights, Navi Mumbai* (Draft listing).
  * Seed 3 reputable vendor profiles with realistic credentials.
  * Rehearse the 10-minute presentation narrative across 2 complete dry runs.
  * Verify offline reliability: ensure all fonts, icons, and charts render smoothly without external internet dependencies.
* **Deliverable:** Bulletproof demo state that will not crash or hang during questioning.

#### Day 14: College Presentation & Defense Preparation
* **Tasks:**
  * Prepare a 10-slide PowerPoint/Google Slides deck highlighting:
    * The Problem: India's fragmented rooftop solar adoption in housing societies.
    * The Solution: Two-sided marketplace with blind bidding and verified EPCs.
    * The Architecture: Next.js + Tailwind + IoT Simulator design.
    * The Live Demonstration walkthrough.
    * Future Roadmap: Hardware IoT gateways, smart contracts, and DISCOM API integrations.
  * Print or export project report summary for evaluators.
* **Deliverable:** Successful project defense and live software demonstration.

---

## 4. PoC Route & Screen Inventory

| Route | Role | Description & Presentation Purpose |
|---|---|---|
| `/` | Public | High-end landing page, trust credentials, interactive yield calculator |
| `/rwa/dashboard` | Society | Overview of roof corpus, generation summary, and active tenders |
| `/rwa/listings/new` | Society | 3-step roof listing wizard with satellite area estimator |
| `/rwa/listings/[id]/bids` | Society | Blind-bid comparison matrix with 1-click acceptance modal |
| `/rwa/telemetry` | Society | Live Recharts solar generation curve with real-time JS ticker |
| `/rwa/maintenance` | Society | Society maintenance tickets & automated inverter trip alerts |
| `/vendor/marketplace` | Vendor | Filterable listings feed with usable roof area & bidding deadline |
| `/vendor/maintenance` | Vendor | Service dispatch desk for responding to society tickets |
| `/admin/dashboard` | Admin | Platform-level analytics and vendor empanelment approval queue |

---

## 5. Live Presentation Script (10-Minute Evaluator Flow)

1. **Minute 00–02: Problem Statement & Landing Page (`/`)**
   * Introduce the RWA coordination dilemma: high electricity bills, unorganized vendors, legal mistrust.
   * Demonstrate the **Instant Solar Yield Calculator** on the landing page: enter `12,000 sq.ft` and show how it calculates ₹3.8L annual revenue and 92 kWp capacity.
2. **Minute 02–04: Housing Society Workflow (`/rwa/dashboard`)**
   * Switch persona to Society Secretary via the demo controller.
   * Show existing listing for *Green Meadows Co-op*.
   * Open the **Bid Comparison Matrix**: explain the blind-bidding model that prevents vendor collusion and ensures competitive pricing.
3. **Minute 04–06: Vendor Bidding Workflow (`/vendor/marketplace`)**
   * Switch persona to Solar EPC Vendor.
   * Show available rooftop tenders across Mumbai Suburban and Thane.
   * Open a listing and demonstrate submitting a sealed bid with proposed tariff and equipment specs.
4. **Minute 06–08: Real-Time IoT Telemetry & Fault Simulation (`/rwa/telemetry`)**
   * Return to RWA portal and open the **Live Telemetry Dashboard**.
   * Show the live solar bell curve plotting instantaneous kW and daily yield.
   * Click **"Simulate Inverter Trip"**: show generation drop to 0 kW and highlight the immediate automated ticket generated on `/rwa/maintenance`.
5. **Minute 08–10: Admin Governance & Q&A (`/admin/dashboard`)**
   * Show the platform admin verification queue for PM Surya Ghar empanelled vendors.
   * Summarize tech stack and field questions on scalability and real-world deployment.

---

## 6. Academic Defense FAQ & Architectural Justification

When professors ask about the engineering trade-offs made for this PoC, use the following justifications:

* **Q: Why is there no physical IoT hardware connected?**  
  * *Answer:* For this PoC, we prioritized validating the end-to-end user experience, data visualization, and automated dispatch logic. The JavaScript generator mimics standard SunSpec MODBUS/MQTT data payloads (timestamp, kW, voltage, temperature) with mathematical fidelity, making the frontend completely swappable with a live MQTT/TimescaleDB gateway in Phase 2.
* **Q: How does the blind-bidding system ensure fairness?**  
  * *Answer:* In the production design, bids are stored encrypted with public keys and only decrypted when the tender timer reaches zero. In our prototype, vendor views are strictly query-scoped so no vendor can see rival bids, eliminating predatory undercutting.
* **Q: Why Next.js and Tailwind CSS?**  
  * *Answer:* Next.js App Router provides unified server and client rendering, rapid API route prototyping, and production-grade performance. Tailwind CSS enabled us to implement a custom, high-density editorial design system with glassmorphic depth in record time without heavy UI library bloat.
