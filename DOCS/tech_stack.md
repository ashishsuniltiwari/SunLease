# Tech Stack Document — Rooftop Solar Marketplace

**Project:** Rooftop Solar Marketplace ("Airbnb for Solar")  
**Version:** v1.0 (Pre-Code Baseline)  
**Sources:** `product_requirements_document.md`, `website_flow.md`  

---

## 1. Overview

### 1.1 Project Scope
The Rooftop Solar Marketplace is a multi-sided digital lead-qualification and post-installation monitoring platform connecting Residential Welfare Associations (RWAs), verified Solar Vendors, and Platform Admins. It supports:
- Public onboarding and role-isolated registration (`RWA`, `Vendor`, `Admin`).
- RWA rooftop listing creation with satellite solar estimation (Google Maps Solar API) and manual fallback.
- Admin-gated vendor verification (PAN, GST, DISCOM empanelment document review).
- Blind-bidding marketplace where competing vendors cannot view rival bids or bid counts.
- In-person audit tracking and off-platform contract confirmation.
- An RWA-only AI educational assistant (Vercel AI SDK).
- A software-simulated IoT telemetry pipeline (Mock MQTT Generator → Broker → Ingestion Worker → Time-Series Store) with live dashboards and automated peak-daylight fault ticketing.

### 1.2 Objectives
- Reduce vendor Customer Acquisition Costs (CAC) by pre-qualifying rooftops with area and sunlight data.
- Eliminate price-fixing through database-enforced blind bidding.
- Prove scalable, non-blocking IoT telemetry ingestion and real-time visualization without physical hardware dependencies.

### 1.3 Non-Functional Requirements (NFRs)
- **Performance:** High-frequency MQTT telemetry ingestion must not block HTTP REST/SSR requests from the web frontend.
- **Security & Isolation:** One account = one role. Blind-bidding isolation enforced at the database query layer, never just in UI filtering.
- **Reliability:** 99.9% successful ingestion of simulated MQTT payloads into the time-series store; graceful degradation when Google Maps Solar API or the AI Assistant is unavailable.
- **Maintainability:** Strict TypeScript end-to-end with shared schema validation and containerized local development.

---

## 2. Frontend

| Layer | Technology | Purpose & Notes |
| :--- | :--- | :--- |
| **Core Language** | **TypeScript 5.x** | Strict static typing across UI components, API contracts, and form schemas. |
| **Framework** | **Next.js (App Router, React 18/19)** | Hybrid SSR/CSR, file-based routing matching screen IDs (`P-*`, `R-*`, `V-*`, `M-*`), built-in API routes/Server Actions. |
| **Styling & UI** | **Tailwind CSS + shadcn/ui (Radix Primitives)** | Rapid, accessible component system (dialogs, tables, badges, form controls) matching the clean state-driven flows in `website_flow.md`. |
| **Data Visualization** | **Recharts** | React-native SVG charting for `R-09` (RWA Monitoring) and `V-12` (Vendor Site Dashboard) to render live kW generation, earnings, and carbon estimates. |
| **State Management** | **TanStack Query (React Query) + URL/Server State** | Server-state caching, polling/SSE updates for live telemetry charts, and optimistic UI where safe. Minimal client-only global state (React Context for auth session). |
| **Forms & Validation** | **React Hook Form + Zod** | Schema-driven validation shared between frontend forms and backend API handlers. |
| **Build & Tooling** | **Turbopack / Next.js build, ESLint, Prettier** | Fast local HMR and strict lint/type checks in CI. |

---

## 3. Backend

| Layer | Technology | Purpose & Notes |
| :--- | :--- | :--- |
| **Runtime & Language** | **Node.js 20 LTS + TypeScript** | Unified language across web server, API, and IoT simulation worker. |
| **Web API Framework** | **Next.js Route Handlers (REST JSON)** | Handles Auth, RBAC, RWA listings, Vendor verification, Blind Bidding, Audit/Contract transitions, and AI streaming (`/api/chat`). |
| **AI Integration** | **Vercel AI SDK (`ai`)** | Streams responses for `[R-12]` Assistant with system prompts scoped strictly to solar/RESCO/audit education and the current RWA's context. |
| **Background / IoT Services** | **Dedicated Node.js Worker Processes (`mqtt.js`)** | 1. **Mock Telemetry Generator:** Publishes JSON payloads (`roofId`, `kw`, `timestamp`, `status`) every few seconds for `Contracted` roofs.<br>2. **Telemetry Ingestor & Alert Worker:** Subscribes to MQTT topics, batch-writes to Time-Series DB, and evaluates peak-daylight zero/silence rules for auto-ticketing. |
| **ORM / Query Layer** | **Prisma ORM** | Type-safe SQL queries, schema migrations, and strict `WHERE` clause scoping for RBAC and blind-bid isolation. |

---

## 4. Data & Storage

| Store | Technology | Data Stored & Role |
| :--- | :--- | :--- |
| **Primary Relational DB** | **PostgreSQL 16** | ACID-compliant storage for `users`, `vendor_profiles`, `vendor_documents`, `roof_listings`, `bids`, `audits`, `contracts`, `tickets`, `ticket_messages`, and `contact_inquiries`. |
| **Time-Series Store** | **TimescaleDB (PostgreSQL Extension)** *(Alternative: InfluxDB 2.x)* | High-velocity append-only `telemetry_readings` hypertable (`time`, `roof_id`, `kw_generated`, `status`). Running TimescaleDB inside PostgreSQL provides native hypertable compression and continuous aggregates without operating a separate database engine. |
| **Caching / Pub-Sub (Optional)** | **Redis** *(or in-process state for v1 demo)* | Rate limiting, password-reset token TTLs, and optional SSE fan-out if scaling multiple web instances. |
| **Object / File Storage** | **S3-Compatible Storage (AWS S3 / Cloudflare R2 / Local MinIO in Docker)** | Stores Vendor verification PDFs/images (PAN, GST, DISCOM letter) and optional RWA signed contract uploads (`R-08`). Never stored as DB blobs. |

---

## 5. Security

- **Authentication:** Email + password hashed with **Argon2id** (or `bcrypt`), issuing short-lived **JWTs** stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (prevents XSS token theft).
- **Authorization & RBAC:**
  - Middleware enforces role claims (`RWA`, `VENDOR`, `ADMIN`) and vendor approval status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) on every private route.
  - **One account = one role** enforced at registration and DB schema level.
- **Blind-Bidding Isolation:**
  - Vendor API endpoints never join or aggregate competing `bids` rows.
  - Unknown or forbidden roof/bid IDs return `404 Not Found` (`[S-05]`) or `403 Forbidden` (`[S-06]`) without leaking existence.
- **File Upload Security:** Pre-signed URLs or validated server-side MIME/size checks (PDF/PNG/JPG, max 5–10 MB) with private bucket access (only owning vendor and Admin can read verification docs).
- **Transport & Secrets:** TLS 1.2+ in production; environment variables managed via `.env.local` (dev) and platform secret manager (prod).

---

## 6. Infrastructure

| Component | Local Development | Production Target |
| :--- | :--- | :--- |
| **Containerization** | **Docker + Docker Compose** (`timescaledb`, `eclipse-mosquitto`, `minio`, `nextjs-app`, `telemetry-worker`) | Containerized worker + managed web hosting or single-cluster container deployment. |
| **Web Hosting / Compute** | `localhost:3000` (Next.js) | **Vercel** (Next.js web + `/api/chat` streaming) or **Railway / Render / AWS ECS** for unified hosting. |
| **Worker & MQTT Broker** | Local **Eclipse Mosquitto** container + Node.js worker | **HiveMQ Cloud / EMQX** (managed MQTT) + **Railway / Render / Fly.io** persistent Node.js worker (since serverless functions cannot hold long-lived MQTT subscriptions). |
| **Managed Databases** | Dockerized TimescaleDB (`timescale/timescaledb:latest-pg16`) | **Timescale Cloud**, **Neon**, or **Supabase / AWS RDS** (PostgreSQL + TimescaleDB). |

---

## 7. DevOps

- **Version Control:** Git + GitHub with `main` (protected) and feature branches (`feat/*`, `fix/*`).
- **CI/CD Pipeline (GitHub Actions):**
  - On PR: `pnpm lint`, `pnpm typecheck`, `pnpm test` (unit/integration tests for RBAC, blind-bid queries, and state transitions), `next build`.
  - On merge to `main`: Automated deployment to staging/production + Prisma database migrations.
- **Observability & Telemetry:**
  - Structured JSON logging (**Pino**) across API routes and the MQTT worker.
  - Latency instrumentation logging `t_mqtt_publish` vs `t_db_ingest` vs `t_ui_render` to validate the PRD's real-time performance KPI.
  - `/api/health` endpoint verifying PostgreSQL, TimescaleDB, and MQTT broker connectivity.

---

## 8. Rationale, Limitations & Trade-Offs

| Choice | Why Chosen | Known Limitations & Trade-Offs |
| :--- | :--- | :--- |
| **Next.js (App Router) + Node.js** | Single TypeScript codebase for UI, REST API, and AI streaming; fast delivery for a 3-sprint timeline. | Long-lived MQTT connections cannot run inside serverless Next.js routes; mitigated by isolating the Mock Generator and MQTT Ingestor into a separate persistent Node.js worker process. |
| **TimescaleDB over InfluxDB** | Provides time-series hypertables and retention policies directly inside PostgreSQL, enabling SQL joins with `roof_listings` and `contracts` while eliminating a second DB server to maintain. | Slightly lower raw write throughput at massive (millions/sec) scale compared to dedicated InfluxDB, which is an acceptable trade-off for this platform's scale. |
| **Recharts over Chart.js** | Declarative React components, responsive containers, and clean TypeScript support. | Canvas-based Chart.js handles >50k live points faster; mitigated by querying aggregated 5s/1m buckets from TimescaleDB so the UI renders ~100–300 points smoothly. |
| **Manual Admin Verification Gate** | No public government API exists for PM Surya Ghar / DISCOM empanelment verification. | Introduces human review latency (`M-01`/`M-02`), which is acceptable and explicitly scoped in the PRD. |
| **Software Mock MQTT Engine** | Removes physical hardware (ESP32/inverter) failure risks during academic/examiner demos while proving real pub/sub ingestion. | Does not test physical Wi-Fi/RS-485 edge connectivity; clearly documented as Phase 1 software simulation. |

