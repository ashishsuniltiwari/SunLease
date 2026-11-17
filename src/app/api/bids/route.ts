import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/bids
 * Implements DB-level blind-bid isolation:
 * - VENDOR: only queries and returns their own submitted bids (where: { vendorId: authUser.userId })
 * - RWA: only queries and returns bids for listings owned by their society (where: { listing: { userId: authUser.userId } })
 * - ADMIN: can view all bids
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to view bids" },
        { status: 401 }
      );
    }

    const { searchParams } = req.nextUrl;
    const listingId = searchParams.get("listingId");
    const bidId = searchParams.get("id") || searchParams.get("bidId");
    const targetVendorId = searchParams.get("vendorId");

    // Security check: Vendor cannot query another vendor's bids by vendorId
    if (authUser.role === "VENDOR" && targetVendorId && targetVendorId !== authUser.userId) {
      return NextResponse.json(
        { error: "Forbidden: Vendors are strictly isolated from rival vendor bids" },
        { status: 403 }
      );
    }

    // Security check: If a specific bid ID is queried
    if (bidId) {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          listing: {
            select: {
              id: true,
              societyName: true,
              society: true,
              location: true,
              city: true,
              area: true,
              status: true,
              userId: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isVerified: true,
            },
          },
        },
      });

      if (!bid) {
        return NextResponse.json({ error: "Bid not found" }, { status: 404 });
      }

      // Rival bid isolation: Vendor cannot inspect rival bids
      if (authUser.role === "VENDOR" && bid.vendorId !== authUser.userId) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to view rival bids" },
          { status: 403 }
        );
      }

      // RWA isolation: RWA can only inspect bids on their own listings
      if (authUser.role === "RWA" && bid.listing.userId !== authUser.userId) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to view this bid" },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, bid });
    }

    let whereClause: any = {};

    if (authUser.role === "VENDOR") {
      // DB-level blind-bid isolation for Vendor: strictly their own bids
      whereClause = {
        vendorId: authUser.userId,
        ...(listingId ? { listingId } : {}),
      };
    } else if (authUser.role === "RWA") {
      // DB-level blind-bid isolation for RWA: only bids belonging to their listings
      whereClause = {
        listing: {
          userId: authUser.userId,
        },
        ...(listingId ? { listingId } : {}),
      };
    } else if (authUser.role === "ADMIN") {
      // Platform Admins can audit all bids or filter by listing
      whereClause = {
        ...(listingId ? { listingId } : {}),
      };
    } else {
      return NextResponse.json(
        { error: "Forbidden: role unauthorized to access bids" },
        { status: 403 }
      );
    }

    const bids = await prisma.bid.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            societyName: true,
            society: true,
            location: true,
            city: true,
            area: true,
            status: true,
            userId: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: bids.length,
      bids,
    });
  } catch (error: any) {
    console.error("GET /api/bids error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bids
 * RWA accepts a bid, transitioning the bid status to ACCEPTED and the listing status to CONTRACTED.
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { bidId, id, action, status } = body;
    const targetBidId = bidId || id;

    if (!targetBidId) {
      return NextResponse.json({ error: "Bid ID is required" }, { status: 400 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: targetBidId },
      include: { listing: true },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Role check: Only listing owner (RWA) or ADMIN can accept/reject bids
    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || bid.listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only the RWA listing owner can accept bids" },
        { status: 403 }
      );
    }

    const targetStatus =
      action === "ACCEPT" || status === "ACCEPTED" ? "ACCEPTED" : status || "REJECTED";

    // Atomically update bid to ACCEPTED and listing status to CONTRACTED
    const [updatedBid, updatedListing] = await prisma.$transaction([
      prisma.bid.update({
        where: { id: targetBidId },
        data: { status: targetStatus },
      }),
      prisma.roofListing.update({
        where: { id: bid.listingId },
        data: {
          status: targetStatus === "ACCEPTED" ? "CONTRACTED" : bid.listing.status,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Bid ${targetStatus.toLowerCase()} successfully`,
      bid: updatedBid,
      listing: updatedListing,
    });
  } catch (error: any) {
    console.error("PATCH /api/bids error:", error);
    return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
  }
}

/**
 * POST /api/bids
 * Vendors submit blind bids on active rooftop listings
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to submit bids" },
        { status: 401 }
      );
    }

    if (authUser.role !== "VENDOR" && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only solar vendors can submit bids" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { listingId, amount, kwp, status } = body;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json(
        { error: "A valid listingId is required" },
        { status: 400 }
      );
    }

    const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "A valid positive bid amount / tariff is required" },
        { status: 400 }
      );
    }

    const parsedKwp = typeof kwp === "number" ? kwp : parseFloat(kwp);
    if (isNaN(parsedKwp) || parsedKwp <= 0) {
      return NextResponse.json(
        { error: "A valid positive kWp capacity is required" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await prisma.roofListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Target rooftop listing not found" },
        { status: 404 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        listingId: listing.id,
        vendorId: authUser.userId,
        amount: parsedAmount,
        kwp: parsedKwp,
        status: status ? String(status).toUpperCase() : "PENDING",
      },
      include: {
        listing: {
          select: {
            id: true,
            societyName: true,
            society: true,
            area: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blind bid anchored and submitted successfully",
        bid,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bids error:", error);
    return NextResponse.json(
      { error: "Failed to submit bid" },
      { status: 500 }
    );
  }
}
