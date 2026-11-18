# ☀️ SunLease — Rooftop Solar Marketplace

> **The Airbnb for Commercial Rooftop Solar.**  
> An anti-collusion, blind-bidding solar marketplace connecting Residential Welfare Associations (RWAs) and Housing Societies with verified, state-empanelled Solar EPC Developers under zero-capex RESCO lease and Capex models.

---

## ⚡ Overview

SunLease digitizes rooftop solar procurement for residential housing societies across major metropolitan regions (starting with MMR — Mumbai, Thane, and Navi Mumbai). It eliminates traditional procurement friction, opaque vendor pricing, and regulatory compliance delays through:

* **Hardware-Sealed Blind Bidding:** Competing EPC contractors submit encrypted, sealed proposals. Bids remain invisible to rivals to prevent collusion and price anchoring.
* **Full 6-State Listing Lifecycle:** Listings move strictly through audited phases: `Draft` ➔ `Live` ➔ `Audit Scheduled` ➔ `Contracted` ➔ `Closed` (or `Withdrawn`).
* **DISCOM & MNRE Pre-Qualification Gate:** Vendors cannot browse confidential society tender packages or bid until their corporate PAN, GST, and state DISCOM empanelment orders are verified.
* **Real-Time IoT Generation Telemetry:** Live plant power monitoring, daily generation tracking, and automated maintenance status updates.

---

## 🏛️ Core Portals & Capabilities

### 1. 🏢 RWA Housing Society Portal (`/dashboard/rwa`)
* **Rooftop Onboarding (`/rwa/listings/new`):**
  * Auto-estimation of usable rooftop surface area, irradiance ($kWh/m^2$), and system capacity ($kWp$) via Google Maps Solar API integration.
  * Detection of manual society overrides with the *"Entered by the society"* audit badge.
  * Drag-and-drop structural fitness certificate and electricity bill staging.
  * Save as private `Draft` or publish live to blind auction.
* **Listing Management (`/rwa/listings/[id]`):**
  * Dynamic phase progress bar with 6-state lifecycle tracking.
  * Listing withdrawal action that automatically sets all competing bids to `NOT_SELECTED`.
* **Blind Bid Comparison Master Table (`/rwa/listings/[id]/bids`):**
  * Side-by-side comparison of sealed tariffs, proposed kWp, warranty terms, and execution timelines.
  * Formal bid acceptance modal requiring explicit society confirmation.
* **Physical Site Audit Desk (`/rwa/listings/[id]/audit`):**
  * View winning contractor contact info, review field visit notes, and record audit outcomes (`Passed`, `Failed Reopen`, `Failed Withdraw`).
* **Contract Recording (`/rwa/listings/[id]/contract`):**
  * Off-platform PPA contract confirmation, tariff validation, and executed stamp-paper document attachment.
* **Telemetry & Support Desk:**
  * Real-time generation dashboard and society ticket thread communication.

---

### 2. ⚡ Solar EPC Vendor Desk (`/dashboard/vendor`)
* **Compliance Gatekeeper (`V-01`):**
  * Blocks unverified contractors from viewing society tenders or placing proposals.
* **Statutory Document Submission (`/vendor/verification`):**
  * Dedicated uploads for:
    1. Corporate PAN Card
    2. GST Registration Certificate (REG-06)
    3. State DISCOM Rooftop Empanelment Order
  * Live status handling for `UNSUBMITTED`, `PENDING` (Review Queue), `APPROVED`, and `REJECTED` (with mandatory administrative rejection reasons and re-upload reset).
* **Tender Feasibility Inspection (`/vendor/marketplace/[id]`):**
  * Inspect usable rooftop layout, solar irradiance index, and structural notes before bidding.
* **Commercial Proposal Form (`V-07` / `V-08`):**
  * Select business model (`RESCO_LEASE`, `CAPEX`, or `SUBSCRIPTION`), input tariff/share rate, execution timeline (weeks), and hardware warranty terms.
  * Cryptographic sealing confirmation assuring price invisibility to competing vendors.
* **My Bids Desk (`/vendor/bids`):**
  * Live tracking of active bids, withdrawal actions, and direct links to winning auctions.
* **Audit Watch Desk (`/vendor/audit`):**
  * View RWA managing committee contacts (Name, Email, Phone) and submit field inspection notes.
* **Maintenance & Plant Status (`/dashboard/vendor/maintenance`):**
  * Remote plant operating status toggle (`ONLINE` / `MAINTENANCE`) and technical configuration notes.
* **Company Settings (`/vendor/settings`):**
  * Manage EPC contractor profile, hardware inverter partners, and alerting preferences.

---

### 3. 🛡️ Platform Admin & Governance (`/dashboard/admin`)
* **State Verification Queue (`/dashboard/admin/verification`):**
  * Live review queue of pending EPC empanelment applications.
  * Vendor Dossier Modal inspecting uploaded PAN, GST, and DISCOM certificates.
  * One-click Approval or Disqualification requiring a mandatory regulatory rejection reason.
* **Empanelled Vendor Directory (`/dashboard/admin/directory`):**
  * Searchable directory of registered contractors, active bids, and compliance standing.
  * **Suspend Vendor Action:** Atomically revokes marketplace access and withdraws all active bids in live auctions.
  * **Reactivate Vendor Action:** Restores empanelled contractor standing.

---

### 4. 🔒 System & Security Hardening
* **Anti-Collusion Isolation:** Sealed bid prices are strictly masked; vendor JWTs cannot query rival bids (returns `403`/`404`).
* **Masked 404 (`S-05`):** Prevents competitive intelligence gathering through automated listing enumeration.
* **Role-Aware 403 Forbidden (`S-06`):** Unauthorized role route attempts display a dedicated screen with one-click return to their respective portal.
* **Session Expired Interstitial (`S-04`):** Transparently preserves the user's return destination across login redirects.
* **Serverless Compatibility:** Pure JavaScript `bcryptjs` password hashing and `jose` JWT verification to eliminate native C++ runtime crashes on Vercel/serverless environments.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Lucide React, Glassmorphism UI Components |
| **Database & ORM** | PostgreSQL (Supabase compatible) with Prisma ORM |
| **Authentication** | JWT (`jose`) in HTTP-Only cookies + Bearer auth with `bcryptjs` |
| **Telemetry Engine** | High-performance prototype simulator (`telemetry-worker.js`) |
| **Testing** | Playwright End-to-End Suite |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **npm** or **pnpm**
* **PostgreSQL Database** (Local instance or Supabase)

### 1. Clone & Install
```bash
git clone https://github.com/ashishsuniltiwari/SunLease.git
cd SunLease
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
# Database connection (PostgreSQL / Supabase Session Pooler)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"

# Optional direct connection (for migrations)
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# JWT Secret for Edge & Session Auth
JWT_SECRET="your-secure-random-jwt-secret-key-32-chars-min"
```

### 3. Database Migration & Seeding
Push the schema to your database and seed demo data:
```bash
# Push schema to database
npx prisma db push

# Seed initial test data and demo accounts
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

All seeded demo accounts share the password: **`password123`**

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **RWA Housing Society** | `admin@palmmeadows.rwa.org` | `password123` | [Society Dashboard](/dashboard/rwa) |
| **Solar EPC Vendor (Approved)** | `vendor@solargrid.in` | `password123` | [Vendor Terminal](/dashboard/vendor) |
| **Platform Administrator** | `superadmin@sunlease.io` | `password123` | [Verification Desk](/dashboard/admin/verification) |
| **EPC Vendor (Pending Review)** | `pending.vendor@soltech.in` | `password123` | [Compliance Waiting Room](/vendor/verification) |

---

## 🧪 Testing & Verification

Run the automated test suite and type check:

```bash
# Run Playwright E2E Tests (Full 6-phase auction lifecycle + Anti-collusion security)
npx playwright test

# Run TypeScript compilation check
npx tsc --noEmit

# Test production build
npm run build
```

---

## 📁 Repository Directory Structure

```text
SunLease/
├── prisma/
│   ├── schema.prisma       # Relational database models (Users, Listings, Bids, Audits, Contracts)
│   └── seed.ts             # Clean demo database seed with bcryptjs
├── public/
│   └── uploads/            # Compliance docs & structural fitness staging
├── src/
│   ├── app/
│   │   ├── (public pages)  # /about, /contact, /for-societies, /for-vendors, /how-it-works
│   │   ├── api/            # Route handlers (/api/auth, /api/bids, /api/contracts, /api/solar, etc.)
│   │   ├── dashboard/      # Role-gated dashboards (/dashboard/rwa, /dashboard/vendor, /dashboard/admin)
│   │   ├── rwa/            # Society onboarding, bid evaluation, site audit, and contract signing
│   │   ├── vendor/         # Document verification, tender specs, proposal submission, fleet desk
│   │   ├── forbidden/      # Role-aware S-06 Forbidden screen
│   │   ├── session-expired/# S-04 session interstitial with returnUrl preservation
│   │   └── not-found.tsx   # S-05 masked 404 security screen
│   ├── components/         # Reusable glassmorphic UI cards, modals, navigation, and sidebar
│   ├── lib/                # Prisma client, JWT session handling, and validation helpers
│   └── middleware.ts       # Next.js route guard enforcing role-based portal isolation
├── tests/                  # Playwright E2E integration test suites
├── telemetry-worker.js     # High-fidelity IoT solar generation simulator
└── tailwind.config.ts      # Custom glassmorphic dark/neon theme tokens
```

---

## 📄 License
This project is licensed under the MIT License.
