#!/usr/bin/env node

/**
 * SunLease IoT Telemetry Background Worker
 * Inserts a new telemetry row every 5 seconds with fluctuating kW generation.
 * Generates an automated alert ticket if generation drops to 0 kW during daylight hours.
 */

const fs = require("fs");
const path = require("path");

// Load .env if present
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Parse CLI flags
const args = process.argv.slice(2);
const runOnce = args.includes("--once");
const simulateZero = args.includes("--simulate-zero");
const forceDaylight = args.includes("--force-daylight");

// Check if current hour is daylight (06:00 to 18:00)
function isDaylightTime() {
  if (forceDaylight) return true;
  const currentHour = new Date().getHours();
  return currentHour >= 6 && currentHour < 18;
}

// Generate fluctuating kW output
function generateKw(simulateZeroGeneration) {
  if (simulateZeroGeneration) return 0.0;

  // Base range 18.0 kW - 24.5 kW with realistic wave fluctuation
  const time = Date.now() / 10000;
  const wave = Math.sin(time) * 2.8;
  const noise = (Math.random() - 0.5) * 1.2;
  const kw = 20.5 + wave + noise;

  return Math.max(0, Number(kw.toFixed(2)));
}

let cachedListingId = null;

async function getListingId() {
  if (cachedListingId) return cachedListingId;
  try {
    const listing = await prisma.roofListing.findFirst({
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (listing) {
      cachedListingId = listing.id;
    }
  } catch (err) {
    // Non-fatal if database is temporarily busy
  }
  return cachedListingId;
}

async function tick() {
  try {
    const isDaylight = isDaylightTime();
    const kw = generateKw(simulateZero);
    const listingId = await getListingId();

    // 1. Insert telemetry reading
    const reading = await prisma.telemetry.create({
      data: {
        kw_generation: kw,
        timestamp: new Date(),
        listingId: listingId || null,
      },
    });

    const timestampStr = new Date().toLocaleTimeString("en-IN", { hour12: false });
    console.log(
      `[Telemetry Worker] [${timestampStr}] ID: ${reading.id.substring(0, 8)}... | Generation: ${kw.toFixed(
        2
      )} kW | Daylight: ${isDaylight}`
    );

    // 2. Alert Ticket Generation Logic:
    // If generation drops to 0 kW during daylight hours, create an alert ticket
    if (kw <= 0.001 && isDaylight) {
      console.warn(
        `[Telemetry Worker] ⚠️ ALERT: 0 kW generation detected during daylight hours (${timestampStr})!`
      );

      // Check if an unresolved critical ticket already exists to prevent alert storms
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          title: { contains: "Zero Solar Generation Detected" },
          status: { in: ["Open", "In Progress"] },
        },
      });

      if (!existingTicket) {
        const ticket = await prisma.ticket.create({
          data: {
            title: "CRITICAL ALERT: Zero Solar Generation Detected During Daylight (0.0 kW)",
            unit: "SMA Sunny Tripower unit #01",
            priority: "High",
            status: "Open",
            description:
              "Automated telemetry monitor detected zero power output (0.0 kW) during active daylight hours. Possible inverter fault, AC disconnect, or grid trip.",
            messages: [
              {
                id: `msg-${Date.now()}`,
                text: `Automated alert triggered by telemetry monitor: Generation dropped to 0.0 kW at ${new Date().toISOString()}`,
                sender: "Telemetry Monitor Daemon",
                createdAt: new Date().toISOString(),
              },
            ],
            listingId: listingId || null,
          },
        });
        console.log(
          `[Telemetry Worker] 🚨 Created Maintenance Alert Ticket: ${ticket.id} (${ticket.title})`
        );
      } else {
        console.log(
          `[Telemetry Worker] Existing open alert ticket already active: ${existingTicket.id}`
        );
      }
    }
  } catch (error) {
    console.error("[Telemetry Worker] Error inserting telemetry reading:", error.message);
  }
}

async function start() {
  console.log("==================================================");
  console.log("   SunLease IoT Telemetry Background Worker       ");
  console.log("   Interval: Every 5 seconds                      ");
  console.log(`   Simulate Zero: ${simulateZero} | Force Daylight: ${forceDaylight}`);
  console.log("==================================================");

  if (runOnce) {
    await tick();
    await prisma.$disconnect();
    process.exit(0);
  }

  // Initial tick immediately
  await tick();

  const intervalId = setInterval(tick, 5000);

  const shutdown = async () => {
    console.log("\n[Telemetry Worker] Shutting down gracefully...");
    clearInterval(intervalId);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
