import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/listings/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const listing = await prisma.roofListing.findUnique({
      where: { id },
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
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to update listing" },
        { status: 401 }
      );
    }

    const { id } = params;

    const listing = await prisma.roofListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Rooftop listing not found" },
        { status: 404 }
      );
    }

    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized to update this listing" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const newStatus = (body.status || "CONTRACTED").toUpperCase();

    const updatedListing = await prisma.roofListing.update({
      where: { id },
      data: { status: newStatus },
    });

    if (body.acceptedBidId) {
      await prisma.bid.update({
        where: { id: body.acceptedBidId },
        data: { status: "ACCEPTED" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Listing status updated to ${newStatus}`,
      listing: updatedListing,
    });
  } catch (error: any) {
    console.error("PATCH /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
