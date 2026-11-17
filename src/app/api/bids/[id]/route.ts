import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/bids/[id]
 * Enforces strict blind-bid security: rival vendors cannot query someone else's bid
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            societyName: true,
            society: true,
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
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Security Isolation: Vendor cannot inspect rival bids
    if (authUser.role === "VENDOR" && bid.vendorId !== authUser.userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view rival bids" },
        { status: 403 }
      );
    }

    // Security Isolation: RWA can only inspect bids on their own society listings
    if (authUser.role === "RWA" && bid.listing.userId !== authUser.userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this bid" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, bid });
  } catch (error: any) {
    console.error("GET /api/bids/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bids/[id]
 * Accepts the bid and transitions listing status to CONTRACTED
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || bid.listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only the RWA listing owner can accept bids" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const newStatus =
      body.action === "ACCEPT" || body.status === "ACCEPTED"
        ? "ACCEPTED"
        : body.status || "ACCEPTED";

    const [updatedBid, updatedListing] = await prisma.$transaction([
      prisma.bid.update({
        where: { id },
        data: { status: newStatus },
      }),
      prisma.roofListing.update({
        where: { id: bid.listingId },
        data: {
          status: newStatus === "ACCEPTED" ? "CONTRACTED" : bid.listing.status,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Bid ${newStatus.toLowerCase()} successfully`,
      bid: updatedBid,
      listing: updatedListing,
    });
  } catch (error: any) {
    console.error("PATCH /api/bids/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update bid" },
      { status: 500 }
    );
  }
}
