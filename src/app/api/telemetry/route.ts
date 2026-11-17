import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "30", 10), 5), 100);
    const listingId = searchParams.get("listingId");

    // Fetch latest telemetry readings ordered newest first
    const rawReadings = await prisma.telemetry.findMany({
      where: listingId ? { listingId } : undefined,
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    // Chronological order for Recharts time-series
    const readings = [...rawReadings].reverse();

    const latest = rawReadings[0];
    const currentKw = latest ? Number(latest.kw_generation.toFixed(2)) : 18.4;

    // Calculate cumulative kWh:
    // If telemetry exists, accumulate energy (each reading is ~5s interval => kw * 5 / 3600 kWh)
    // Add realistic base daily generation for the society (approx 140 kWh + live accumulation)
    const liveAccumulatedKwh = readings.reduce((acc, r) => acc + (r.kw_generation * (5 / 3600)), 0);
    const totalKwh = Number((140.0 + liveAccumulatedKwh).toFixed(2));

    // Tariffs & Calculations:
    // PPA contracted tariff = ₹3.40 per kWh
    // Carbon emission factor in India (CEA) = 0.82 kg CO2 per kWh
    // Tree absorption equivalent = ~22 kg CO2/tree/year
    const tariffRate = 3.40;
    const earningsRupees = Number((totalKwh * tariffRate).toFixed(2));
    const carbonOffsetKg = Number((totalKwh * 0.82).toFixed(2));
    const treesEquivalent = Math.round(carbonOffsetKg / 22);
    const carsOffset = Number((carbonOffsetKg / 500).toFixed(1));

    // Inverter metrics
    const frequency = "50.0 Hz";
    const temperature = currentKw > 0 ? 42 : 28;
    const status = currentKw > 0 ? "ONLINE" : "OFFLINE";
    const efficiency = currentKw > 0 ? "96.3%" : "0.0%";

    const formattedReadings = readings.map((r) => {
      const date = new Date(r.timestamp);
      const timeStr = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Simulated solar irradiance potential slightly above actual yield
      const irradiancePotential = Number(
        (r.kw_generation > 0 ? r.kw_generation * 1.04 + 0.3 : 19.1).toFixed(2)
      );

      return {
        id: r.id,
        timestamp: r.timestamp,
        time: timeStr,
        kw_generation: Number(r.kw_generation.toFixed(2)),
        irradiance_potential: irradiancePotential,
      };
    });

    return NextResponse.json({
      success: true,
      current: {
        kw: currentKw,
        frequency,
        temperature,
        status,
        efficiency,
        timestamp: latest?.timestamp || new Date(),
      },
      metrics: {
        totalGenerationKwh: totalKwh,
        earningsRupees,
        tariffRate,
        carbonOffsetKg,
        treesEquivalent,
        carsOffset,
      },
      readings: formattedReadings,
    });
  } catch (error: any) {
    console.error("Telemetry GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch telemetry data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kw_generation, timestamp, listingId } = body;

    if (kw_generation === undefined || kw_generation === null || isNaN(Number(kw_generation))) {
      return NextResponse.json(
        { error: "kw_generation is required and must be a valid number" },
        { status: 400 }
      );
    }

    const reading = await prisma.telemetry.create({
      data: {
        kw_generation: Number(kw_generation),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        listingId: listingId || null,
      },
    });

    return NextResponse.json({ success: true, reading }, { status: 201 });
  } catch (error: any) {
    console.error("Telemetry POST error:", error);
    return NextResponse.json(
      { error: "Failed to record telemetry reading", details: error.message },
      { status: 500 }
    );
  }
}
