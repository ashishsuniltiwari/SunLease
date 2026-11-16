# Product Requirements Document (PRD)
**Project Title:** Rooftop Solar Marketplace ("Airbnb for Solar")
**Document Reference:** Based on discussions and `idea_lab_project_details_discussion.pdf`

---

## 1. Document Metadata
*   **Project Title:** Rooftop Solar Marketplace
*   **Document Owner:** Product / Engineering Lead
*   **Target Release Date:** [Insert Date - Align with Examiner Deadline]
*   **Version History:** v1.0 (Initial Draft based on Architecture Lock)
*   **Current Status:** Approved for Development

## 2. Executive Summary / Overview
The Rooftop Solar Marketplace is a multi-sided digital platform that connects Residential Welfare Associations (RWAs) with verified solar installation vendors. Acting as an "Airbnb for Solar Panels," it serves as a robust lead-qualification and management pipeline. The platform allows RWAs to list their roofs, receive competitive bids from certified vendors, and monitor energy generation post-installation via a simulated IoT telemetry dashboard. It leverages an AI-powered assistant to educate non-technical users and utilizes a dual-database architecture to handle both relational contracts and high-velocity time-series data.

## 3. Problem Statement
*   **For Solar Vendors:** Customer Acquisition Costs (CAC) are unsustainably high (up to 35% of project costs). Traditional door-to-door marketing and manual site surveys lead to wasted resources on unqualified leads.
*   **For RWAs:** Housing societies lack technical knowledge about solar feasibility, complex RESCO contracts, and hardware maintenance. The fragmented market makes it difficult to find trusted, government-empanelled vendors.
*   **Academic / Execution Gap:** Hardware dependencies (physical edge microcontrollers and inverters) often create bottlenecks. A software-first simulation is required to demonstrate scalable data ingestion without the friction of physical hardware failure.

## 4. Goals & Success Metrics
**Primary Goals:**
*   Create a seamless, secure, blind-bidding marketplace.
*   Successfully simulate real-time IoT hardware telemetry to prove backend scalability to examiners.
*   Educate RWAs automatically using an AI edge.

**Success Metrics (KPIs):**
*   **Bid Liquidity:** Average number of vendor bids per RWA rooftop listing.
*   **Telemetry Uptime:** 99.9% successful ingestion of simulated MQTT payloads into the Time-Series DB.
*   **AI Resolution Rate:** Percentage of RWA queries answered by the AI Chatbot without requiring manual support.

## 5. Target Audience & Personas
*   **RWA (Housing Society Representative):** Non-technical. Wants to save money on electricity and monetize empty roof space. Needs transparent tracking and easy-to-understand legal/technical guidance.
*   **Solar Vendor (Empanelled Company):** Highly technical. Looking for pre-qualified, data-backed leads to reduce site-visit overhead. Needs a reliable dashboard to monitor their installed hardware fleet.
*   **Platform Admin:** Internal moderator responsible for maintaining trust by verifying vendor credentials against national databases (e.g., PM Surya Ghar portal).

## 6. User Stories & Use Cases
*   **RWA Onboarding:** "As an RWA, I want to input my address so the platform can automatically estimate my usable roof area and sunlight hours using satellite data."
*   **Vendor Bidding:** "As a solar vendor, I want to submit a customized blind bid on a qualified roof so I can offer competitive pricing without price-fixing interference."
*   **AI Assistance:** "As an RWA committee member, I want to ask a chatbot about RESCO contract terms so I can make an informed decision on a bid."
*   **Admin Moderation:** "As a Platform Admin, I want to review a vendor's GST and DISCOM empanelment documents before they can access the marketplace."
*   **Hardware Simulation (System):** "As the backend system, I need to ingest mock MQTT telemetry payloads every few seconds to populate the live performance dashboards."

## 7. User Flows & UX/UI Designs
*   **Phase 1: Listing & Estimation:** RWA registers -> Enters Address -> Google Maps Solar API fetches data -> Roof parameters are saved -> Listing goes live.
*   **Phase 2: Blind Bidding:** Verified Vendor browses listings -> Views RWA roof data -> Submits lease/installation proposal (cannot see other bids).
*   **Phase 3: Bid Review & Audit:** RWA views a "Master Table" of all bids -> Selects the best offer -> Status changes to "Audit Scheduled."
*   **Phase 4: Post-Installation Monitoring:** Contract signed -> Mock IoT Engine starts -> RWA gets Read-Only dashboard view -> Vendor gets Read/Write dashboard view for system configurations.
*   *Design Note:* UI to be generated and prototyped using v0 by Vercel or Figma Make for React.js/Next.js implementation.

## 8. Functional Requirements
*   **Role-Based Access Control (RBAC):** Strict data isolation using JWT. Vendors only see their bids. RWAs see all bids on their property.
*   **Vendor Verification Gate:** Document upload portal for PAN, GST, and DISCOM letters. Admin approval workflow required to unlock bidding access.
*   **Marketplace Bidding Engine:** Forms for vendors to submit proposals and dashboards for RWAs to compare them side-by-side.
*   **AI Chatbot Integration:** Vercel AI SDK integration for an RWA-facing agent trained on standard solar policies and contract terms.
*   **IoT Simulation Engine:** A background script (Node.js/Python) that programmatically generates JSON payloads (kW generated, timestamps, system status) and publishes them via MQTT to simulate edge devices.
*   **Automated Ticketing:** Logic that triggers a maintenance alert to the Vendor if the simulated telemetry data drops to zero during peak daylight.

## 9. Non-Functional Requirements
*   **Architecture (Dual-Database):** 
    *   *Relational (PostgreSQL):* Strict ACID compliance for user profiles, RBAC, contracts, and bids.
    *   *Time-Series (InfluxDB/TimescaleDB):* High-velocity ingestion for timestamped IoT telemetry.
*   **Performance:** The API Gateway must handle high-frequency MQTT payload ingestion without blocking standard HTTP REST requests from the React frontend.
*   **Security:** Blind bidding logic must be enforced at the database query level to prevent data leakage to frontend clients.

## 10. Analytics & Instrumentation
*   **System Tracking:** Log the latency between the Mock Data Generator publishing an MQTT message and the React dashboard re-rendering.
*   **Funnel Tracking:** Track the conversion rate from "RWA Sign Up" to "Roof Listing Live" to "Bid Accepted".

## 11. Assumptions & Dependencies
*   **Dependencies:** Google Maps Solar API (for roof mapping), Vercel AI SDK (for chatbot), Cloud IoT broker (for MQTT handling).
*   **Assumptions:** RWAs are capable of providing accurate addresses; the examiner will accept a simulated, pure-software architecture as a valid proof-of-concept for the hardware components.

## 12. Risks & Mitigation Strategies
*   **Risk:** Inaccurate Google Maps satellite data leading to poor vendor expectations.
    *   **Mitigation:** The software workflow strictly includes a "Physical Audit Scheduled" phase before any contract is signed, treating the map data purely as a top-of-funnel lead qualifier.
*   **Risk:** Examiner expects physical hardware (ESP32/Inverters).
    *   **Mitigation:** Clearly frame the project as a software platform designed to *consume* hardware data. The Mock Data Generator API will be explicitly documented as the stand-in for Phase 1 scale testing.

## 13. Out-of-Scope (Non-Goals)
*   Physical hardware deployment (No actual ESP32s, Raspberry Pis, or solar panels will be wired).
*   Fully automated background checks for vendors (No public API exists for this; relying on the manual Platform Admin gate).
*   Payment gateway processing for the actual multi-lakh solar installations (focus is on the matchmaking and telemetry).

## 14. Go-To-Market (GTM) & Rollout Plan (Project Phases)
*   **Sprint 1: UI & Base Services:** React.js/Next.js frontend setup, PostgreSQL schema creation, Auth & RBAC implementation.
*   **Sprint 2: Marketplace Engine & AI:** Google Maps API integration, listing creation, blind-bidding logic, and Vercel AI Chatbot.
*   **Sprint 3: The "Nervous System":** Set up InfluxDB, build the Node.js Mock Data Generator, handle MQTT ingestion, and wire up the live charts on the dashboards.

## 15. Open Questions & Decisions Log
*   **Decision Made:** Abandoned physical hardware in favor of a simulated MQTT Data Engine to ensure presentation reliability and focus on software architecture.
*   **Decision Made:** Implemented a "Blind Bid" marketplace to prevent price-fixing among vendors.
*   **Decision Made:** Used a manual Platform Admin check for vendor verification due to the lack of an automated government API.
*   **Open Question:** Which specific charting library (e.g., Recharts, Chart.js) will be best optimized for the React dashboard to render the live time-series data smoothly?