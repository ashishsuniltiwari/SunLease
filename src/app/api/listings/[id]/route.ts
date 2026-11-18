import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/listings/[id]
 * Enforces role isolation:
 * - DRAFT listings return 404 to non-owner vendors/guests.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    const { id } = params;

    const listing = await prisma.roofListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        bids: {
          select: {
            id: true,
            amount: true,
            kwp: true,
            proposalType: true,
            commercialTerm: true,
            proposedKw: true,
            timelineWeeks: true,
            note: true,
            status: true,
            vendorId: true,
            createdAt: true,
          },
        },
        audits: {
          include: {
            acceptedBid: {
              select: {
                id: true,
                amount: true,
                kwp: true,
                proposalType: true,
                vendor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        contracts: true,
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

    // Masked 404 check: If listing is DRAFT, only owner RWA or Admin can access
    if (listing.status === "DRAFT") {
      if (!authUser || (authUser.role !== "ADMIN" && listing.userId !== authUser.userId)) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
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
    const newStatus = body.status ? String(body.status).toUpperCase() : listing.status;

    // Handle withdrawal state transition
    if (newStatus === "WITHDRAWN" && listing.status !== "WITHDRAWN") {
      const [updatedListing] = await prisma.$transaction([
        prisma.roofListing.update({
          where: { id },
          data: {
            status: "WITHDRAWN",
            public_note: body.public_note !== undefined ? body.public_note : listing.public_note,
            shade_note: body.shade_note !== undefined ? body.shade_note : listing.shade_note,
          },
        }),
        prisma.bid.updateMany({
          where: {
            listingId: id,
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

    const updatedListing = await prisma.roofListing.update({
      where: { id },
      data: {
        status: newStatus,
        public_note: body.public_note !== undefined ? body.public_note : listing.public_note,
        shade_note: body.shade_note !== undefined ? body.shade_note : listing.shade_note,
      },
    });

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

/**
 * DELETE /api/listings/[id]
 * Deletes a draft or uncontracted listing
 */
export async function DELETE(
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

    const listing = await prisma.roofListing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized to delete this listing" },
        { status: 403 }
      );
    }

    if (listing.status === "CONTRACTED") {
      return NextResponse.json(
        { error: "Cannot delete a contracted rooftop with active telemetry" },
        { status: 400 }
      );
    }

    await prisma.roofListing.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
