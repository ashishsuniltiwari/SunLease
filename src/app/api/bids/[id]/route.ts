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
 * Supports:
 * - RWA ACCEPT: Marks bid ACCEPTED, competing bids NOT_SELECTED, listing AUDIT_SCHEDULED, creates Audit
 * - Vendor WITHDRAW: Marks bid WITHDRAWN (while listing is still LIVE/ACTIVE/OPEN)
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

    const body = await req.json().catch(() => ({}));
    const isAcceptAction = body.action === "ACCEPT" || body.status === "ACCEPTED";
    const isWithdrawAction = body.action === "WITHDRAW" || body.status === "WITHDRAWN";

    // 1. Handling VENDOR WITHDRAW
    if (isWithdrawAction) {
      if (authUser.role !== "ADMIN" && bid.vendorId !== authUser.userId) {
        return NextResponse.json(
          { error: "Forbidden: You can only withdraw your own bids" },
          { status: 403 }
        );
      }

      if (bid.status !== "PENDING") {
        return NextResponse.json(
          { error: `Cannot withdraw a bid with status ${bid.status}` },
          { status: 400 }
        );
      }

      const listingStatus = bid.listing.status.toUpperCase();
      if (!["LIVE", "ACTIVE", "OPEN"].includes(listingStatus)) {
        return NextResponse.json(
          { error: `Cannot withdraw bid after listing has moved to ${listingStatus}` },
          { status: 400 }
        );
      }

      const updatedBid = await prisma.bid.update({
        where: { id },
        data: { status: "WITHDRAWN" },
      });

      return NextResponse.json({
        success: true,
        message: "Bid withdrawn successfully",
        bid: updatedBid,
      });
    }

    // 2. Handling RWA ACCEPT
    if (isAcceptAction) {
      if (
        authUser.role !== "ADMIN" &&
        (authUser.role !== "RWA" || bid.listing.userId !== authUser.userId)
      ) {
        return NextResponse.json(
          { error: "Forbidden: Only the RWA listing owner can accept bids" },
          { status: 403 }
        );
      }

      const listingStatus = bid.listing.status.toUpperCase();
      if (!["LIVE", "ACTIVE", "OPEN"].includes(listingStatus)) {
        return NextResponse.json(
          { error: `Cannot accept bids when listing status is ${listingStatus}` },
          { status: 400 }
        );
      }

      const nextListingStatus = body.directContract ? "CONTRACTED" : "AUDIT_SCHEDULED";

      const [updatedBid, rivalBidsUpdate, updatedListing, auditRecord] = await prisma.$transaction([
        prisma.bid.update({
          where: { id },
          data: { status: "ACCEPTED" },
        }),
        prisma.bid.updateMany({
          where: {
            listingId: bid.listingId,
            id: { not: id },
            status: "PENDING",
          },
          data: { status: "NOT_SELECTED" },
        }),
        prisma.roofListing.update({
          where: { id: bid.listingId },
          data: { status: nextListingStatus },
        }),
        prisma.audit.create({
          data: {
            roofId: bid.listingId,
            acceptedBidId: id,
            outcome: "PENDING",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message:
          nextListingStatus === "AUDIT_SCHEDULED"
            ? "Bid accepted! Listing moved to Audit Scheduled, rival bids marked Not Selected, and physical audit scheduled."
            : "Bid accepted and contracted successfully",
        bid: updatedBid,
        listing: updatedListing,
        rivalsClosed: rivalBidsUpdate.count,
        audit: auditRecord,
      });
    }

    // Default status update
    const targetStatus = body.status || "REJECTED";
    const updatedBid = await prisma.bid.update({
      where: { id },
      data: { status: targetStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Bid updated to ${targetStatus}`,
      bid: updatedBid,
    });
  } catch (error: any) {
    console.error("PATCH /api/bids/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update bid" },
      { status: 500 }
    );
  }
}
