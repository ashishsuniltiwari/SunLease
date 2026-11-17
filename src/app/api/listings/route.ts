import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/listings
 * Fetch active listings (or filter by status)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const statusParam = searchParams.get("status");

    const where: any = {};
    if (statusParam) {
      if (statusParam.toUpperCase() !== "ALL") {
        where.status = {
          equals: statusParam,
          mode: "insensitive",
        };
      }
    } else {
      // By default fetch active/open/live listings
      where.status = {
        in: ["ACTIVE", "OPEN", "LIVE", "active", "open", "live"],
      };
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
 * Create a new rooftop listing for an RWA
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

    // Role verification: RWAs (and Admins) can create listings
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

    const listing = await prisma.roofListing.create({
      data: {
        societyName,
        society: societyName,
        societyDetails: body.societyDetails ? String(body.societyDetails).trim() : null,
        location: body.location ? String(body.location).trim() : null,
        city: body.city ? String(body.city).trim() : null,
        area,
        status: body.status ? String(body.status).toUpperCase() : "ACTIVE",
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
        message: "Rooftop listing created successfully",
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
 * Update listing status (e.g., from LIVE/ACTIVE to CONTRACTED)
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
    const { listingId, id, status, acceptedBidId } = body;
    const targetId = listingId || id;

    if (!targetId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.roofListing.findUnique({
      where: { id: targetId },
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

    const newStatus = (status || "CONTRACTED").toUpperCase();

    const updatedListing = await prisma.roofListing.update({
      where: { id: targetId },
      data: { status: newStatus },
      include: {
        bids: true,
      },
    });

    if (acceptedBidId) {
      await prisma.bid.update({
        where: { id: acceptedBidId },
        data: { status: "ACCEPTED" },
      });
    }

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
