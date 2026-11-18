import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/listings
 * Fetch listings according to role-based visibility:
 * - Vendors & Guests: ONLY see LIVE / ACTIVE / OPEN listings. DRAFT listings are completely hidden.
 * - RWA: sees all active listings, plus their own listings across all states (DRAFT, LIVE, AUDIT_SCHEDULED, CONTRACTED, WITHDRAWN, CLOSED).
 * - Admin: sees all listings across all states.
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = req.nextUrl;
    const statusParam = searchParams.get("status");
    const myOnly = searchParams.get("myOnly") === "true";

    let where: any = {};

    if (!authUser || authUser.role === "VENDOR") {
      // Vendors and guests must NEVER see DRAFT listings or unapproved listings
      if (statusParam && statusParam.toUpperCase() !== "ALL") {
        const upper = statusParam.toUpperCase();
        // If vendor tries to query DRAFT, return empty
        if (upper === "DRAFT") {
          return NextResponse.json({ success: true, count: 0, listings: [] });
        }
        where.status = { equals: upper, mode: "insensitive" };
      } else {
        where.status = {
          in: ["ACTIVE", "OPEN", "LIVE", "active", "open", "live"],
        };
      }
    } else if (authUser.role === "RWA") {
      if (myOnly) {
        where.userId = authUser.userId;
        if (statusParam && statusParam.toUpperCase() !== "ALL") {
          where.status = { equals: statusParam.toUpperCase(), mode: "insensitive" };
        }
      } else if (statusParam && statusParam.toUpperCase() !== "ALL") {
        where.status = { equals: statusParam.toUpperCase(), mode: "insensitive" };
        // If querying DRAFT, only show RWA's own drafts
        if (statusParam.toUpperCase() === "DRAFT") {
          where.userId = authUser.userId;
        }
      } else {
        // By default show all active/open listings, OR own listings in any state
        where.OR = [
          { status: { in: ["ACTIVE", "OPEN", "LIVE", "active", "open", "live"] } },
          { userId: authUser.userId },
        ];
      }
    } else if (authUser.role === "ADMIN") {
      if (statusParam && statusParam.toUpperCase() !== "ALL") {
        where.status = { equals: statusParam.toUpperCase(), mode: "insensitive" };
      }
    }

    const listings = await prisma.roofListing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        bids: {
          select: {
            id: true,
            status: true,
            amount: true,
            kwp: true,
            vendorId: true,
          },
        },
        audits: {
          select: {
            id: true,
            outcome: true,
            recordedAt: true,
          },
        },
        contracts: {
          select: {
            id: true,
            systemStatus: true,
            contractDate: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error: any) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new rooftop listing for an RWA (either as DRAFT or LIVE)
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to create a listing" },
        { status: 401 }
      );
    }

    // Role verification: RWAs and Admins can create listings
    if (authUser.role !== "RWA" && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Only RWA members can create rooftop listings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const societyName = String(
      body.societyName || body.society || ""
    ).trim();

    if (!societyName) {
      return NextResponse.json(
        { error: "Society name is required" },
        { status: 400 }
      );
    }

    const rawArea = body.area ?? body.usableArea;
    const area = typeof rawArea === "number" ? rawArea : parseFloat(rawArea);

    if (isNaN(area) || area <= 0) {
      return NextResponse.json(
        { error: "A valid positive rooftop area (in sq ft) is required" },
        { status: 400 }
      );
    }

    // Initial status: DRAFT or LIVE (defaults to LIVE if published)
    let initialStatus = "LIVE";
    if (body.status) {
      const requested = String(body.status).toUpperCase();
      if (requested === "DRAFT") {
        initialStatus = "DRAFT";
      } else if (requested === "LIVE" || requested === "ACTIVE" || requested === "OPEN") {
        initialStatus = "LIVE";
      }
    }

    // Usable sqm calculation if not explicitly provided
    const usableSqm =
      body.usable_area_sqm ?? (area ? Math.round((area / 10.7639) * 10) / 10 : null);
    const estimatedKw =
      body.estimated_kw ?? (area ? Math.round((area / 50) * 0.4) : null);
    const sunlightHours =
      body.sunlight_hours_yr ?? 1780;

    const listing = await prisma.roofListing.create({
      data: {
        societyName,
        society: societyName,
        societyDetails: body.societyDetails ? String(body.societyDetails).trim() : null,
        location: body.location ? String(body.location).trim() : null,
        city: body.city ? String(body.city).trim() : null,
        area,
        usable_area_sqm: usableSqm,
        sunlight_hours_yr: sunlightHours,
        estimated_kw: estimatedKw,
        data_source: body.data_source || (body.manualFallback ? "MANUAL" : "GOOGLE_SOLAR"),
        shade_note: body.shade_note ? String(body.shade_note).trim() : null,
        public_note: body.public_note ? String(body.public_note).trim() : null,
        status: initialStatus,
        userId: authUser.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          initialStatus === "DRAFT"
            ? "Rooftop draft saved successfully. Complete details before publishing."
            : "Rooftop listing created and published to marketplace.",
        listing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings
 * Update listing state transitions:
 * - DRAFT -> LIVE (Publishing)
 * - LIVE / DRAFT -> WITHDRAWN (Withdrawing: closes all pending bids to NOT_SELECTED)
 * - CONTRACTED -> CLOSED (Archiving)
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to update listing" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { listingId, id, status, public_note, shade_note } = body;
    const targetId = listingId || id;

    if (!targetId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.roofListing.findUnique({
      where: { id: targetId },
      include: { bids: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Rooftop listing not found" },
        { status: 404 }
      );
    }

    // Role verification: Owner RWA or Admin
    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized to update this listing" },
        { status: 403 }
      );
    }

    const newStatus = status ? String(status).toUpperCase() : listing.status;

    // Handle withdrawal state transition
    if (newStatus === "WITHDRAWN" && listing.status !== "WITHDRAWN") {
      const [updatedListing] = await prisma.$transaction([
        prisma.roofListing.update({
          where: { id: targetId },
          data: {
            status: "WITHDRAWN",
            public_note: public_note !== undefined ? public_note : listing.public_note,
            shade_note: shade_note !== undefined ? shade_note : listing.shade_note,
          },
        }),
        // When listing is withdrawn, all open pending bids become NOT_SELECTED
        prisma.bid.updateMany({
          where: {
            listingId: targetId,
            status: "PENDING",
          },
          data: {
            status: "NOT_SELECTED",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Listing withdrawn and open bids closed",
        listing: updatedListing,
      });
    }

    // Standard update
    const updatedListing = await prisma.roofListing.update({
      where: { id: targetId },
      data: {
        status: newStatus,
        public_note: public_note !== undefined ? public_note : listing.public_note,
        shade_note: shade_note !== undefined ? shade_note : listing.shade_note,
      },
      include: {
        bids: true,
        audits: true,
        contracts: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Listing status updated to ${newStatus}`,
      listing: updatedListing,
    });
  } catch (error: any) {
    console.error("PATCH /api/listings error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
