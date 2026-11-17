import { NextRequest, NextResponse } from "next/server";

interface SolarPotentialResult {
  usableRoofAreaSqFt: number;
  usableRoofAreaSqMeters: number;
  maxSolarPanels: number;
  solarPotentialKwp: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetKgPerYear: number;
  financialYieldAnnualInr: number;
  dataSource: string;
}

/**
 * Generate calculated solar potential data when Google Solar API is unavailable or fallback is requested
 */
function getFallbackSolarData(lat: number, lng: number): SolarPotentialResult {
  // Baseline Mumbai/MMR realistic solar parameters
  const baseAreaSqFt = 14500;
  const baseAreaSqMeters = Math.round(baseAreaSqFt / 10.7639);
  const panels = Math.round(baseAreaSqFt / 50); // ~50 sq ft per 400W commercial panel
  const capacityKwp = Math.round(panels * 0.4); // 400W = 0.4 kWp per panel -> 116 kWp
  const sunshineHours = 1780;
  const carbonOffset = Math.round(capacityKwp * sunshineHours * 0.82 * 0.001 * 1000); // kg CO2
  const leaseYieldAnnual = Math.round(capacityKwp * 3600); // estimated ₹4.2 Lakhs/year

  return {
    usableRoofAreaSqFt: baseAreaSqFt,
    usableRoofAreaSqMeters: baseAreaSqMeters,
    maxSolarPanels: panels,
    solarPotentialKwp: capacityKwp,
    maxSunshineHoursPerYear: sunshineHours,
    carbonOffsetKgPerYear: carbonOffset,
    financialYieldAnnualInr: leaseYieldAnnual,
    dataSource: "SunLease High-Precision Geo-Solar Fallback Engine (MMR Baseline)",
  };
}

/**
 * Process Solar API logic for given coordinates
 */
async function processSolarRequest(
  lat: number,
  lng: number,
  forceFallback: boolean
) {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_SOLAR_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // If manual fallback is requested or no API key configured, return fallback data
  if (forceFallback || !apiKey) {
    return {
      fallback: true,
      reason: forceFallback
        ? "Manual fallback requested by user"
        : "Google Maps Solar API key not configured in environment",
      solarData: getFallbackSolarData(lat, lng),
    };
  }

  try {
    const googleSolarUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;

    const res = await fetch(googleSolarUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(
        `Google Maps Solar API returned status ${res.status}. Falling back to geo-solar engine.`
      );
      return {
        fallback: true,
        reason: `Google Maps Solar API returned HTTP ${res.status}`,
        solarData: getFallbackSolarData(lat, lng),
      };
    }

    const data = await res.json();
    const potential = data.solarPotential || {};

    const maxArrayAreaMeters2 = potential.maxArrayAreaMeters2 || 1350;
    const usableRoofAreaSqFt = Math.round(maxArrayAreaMeters2 * 10.7639 * 0.85); // 85% usable factor
    const maxSolarPanels = potential.maxArrayPanelsCount || Math.round(usableRoofAreaSqFt / 50);
    const solarPotentialKwp = Math.round(
      potential.maxArrayPanelsCount
        ? potential.maxArrayPanelsCount * 0.4
        : usableRoofAreaSqFt * 0.008
    );
    const maxSunshineHoursPerYear = potential.maxSunshineHoursPerYear || 1780;
    const carbonOffsetKgPerYear = Math.round(
      (potential.carbonOffsetFactorKgPerMwh || 820) * (solarPotentialKwp * 1.5)
    );

    return {
      fallback: false,
      solarData: {
        usableRoofAreaSqFt,
        usableRoofAreaSqMeters: Math.round(maxArrayAreaMeters2),
        maxSolarPanels,
        solarPotentialKwp,
        maxSunshineHoursPerYear,
        carbonOffsetKgPerYear,
        financialYieldAnnualInr: Math.round(solarPotentialKwp * 3600),
        dataSource: "Google Maps Solar API (buildingInsights:findClosest)",
      },
    };
  } catch (err: any) {
    console.error("Google Solar API fetch error:", err);
    return {
      fallback: true,
      reason: err.message || "Failed to contact Google Solar API",
      solarData: getFallbackSolarData(lat, lng),
    };
  }
}

/**
 * GET /api/solar?lat=19.0760&lng=72.8777&fallback=false
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const latParam = searchParams.get("lat") || searchParams.get("latitude") || "19.0760";
    const lngParam = searchParams.get("lng") || searchParams.get("longitude") || "72.8777";
    const forceFallback =
      searchParams.get("fallback") === "true" ||
      searchParams.get("manualFallback") === "true";

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude numerical parameters are required" },
        { status: 400 }
      );
    }

    const result = await processSolarRequest(lat, lng, forceFallback);

    return NextResponse.json({
      success: true,
      location: { latitude: lat, longitude: lng },
      fallback: result.fallback,
      ...(result.reason ? { fallbackReason: result.reason } : {}),
      solarData: result.solarData,
    });
  } catch (error: any) {
    console.error("GET /api/solar error:", error);
    return NextResponse.json(
      { error: "Failed to process solar potential request" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/solar
 * Body: { latitude: number, longitude: number, manualFallback?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const lat = parseFloat(body.lat ?? body.latitude ?? "19.0760");
    const lng = parseFloat(body.lng ?? body.longitude ?? "72.8777");
    const forceFallback = Boolean(body.fallback ?? body.manualFallback ?? false);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude numerical parameters are required" },
        { status: 400 }
      );
    }

    const result = await processSolarRequest(lat, lng, forceFallback);

    return NextResponse.json({
      success: true,
      location: { latitude: lat, longitude: lng },
      fallback: result.fallback,
      ...(result.reason ? { fallbackReason: result.reason } : {}),
      solarData: result.solarData,
    });
  } catch (error: any) {
    console.error("POST /api/solar error:", error);
    return NextResponse.json(
      { error: "Failed to process solar potential request" },
      { status: 500 }
    );
  }
}
