import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { ProposalType } from "@prisma/client";

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
 * POST /api/bids
 * Vendors submit blind bids on active rooftop listings:
 * - Enforces listing state check (must be LIVE/ACTIVE/OPEN, not DRAFT, AUDIT_SCHEDULED, CONTRACTED, WITHDRAWN, or CLOSED)
 * - Enforces 1 pending bid per vendor per listing constraint
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
    const {
      listingId,
      amount,
      kwp,
      proposalType,
      commercialTerm,
      proposedKw,
      timelineWeeks,
      note,
      status,
    } = body;

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

    // Verify target listing exists
    const listing = await prisma.roofListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Target rooftop listing not found" },
        { status: 404 }
      );
    }

    // 1. Check listing state validity
    const listingState = listing.status.toUpperCase();
    if (listingState === "DRAFT") {
      return NextResponse.json(
        { error: "This rooftop listing is currently in draft and not open for bidding" },
        { status: 400 }
      );
    }

    if (listingState === "AUDIT_SCHEDULED" || listingState === "CONTRACTED") {
      return NextResponse.json(
        { error: "Bidding is closed for this rooftop listing" },
        { status: 400 }
      );
    }

    if (listingState === "WITHDRAWN" || listingState === "CLOSED") {
      return NextResponse.json(
        { error: "This rooftop listing has been withdrawn or archived" },
        { status: 400 }
      );
    }

    // 2. Enforce 1 pending bid per vendor per roof rule
    const existingPendingBid = await prisma.bid.findFirst({
      where: {
        listingId: listing.id,
        vendorId: authUser.userId,
        status: "PENDING",
      },
    });

    if (existingPendingBid) {
      return NextResponse.json(
        {
          error:
            "You already have an active pending bid on this rooftop listing. Withdraw your existing proposal before submitting a new one.",
          existingBidId: existingPendingBid.id,
        },
        { status: 409 }
      );
    }

    // Validate or default proposalType
    let validProposalType: ProposalType = ProposalType.RESCO_LEASE;
    if (proposalType) {
      const upper = String(proposalType).toUpperCase();
      if (Object.values(ProposalType).includes(upper as ProposalType)) {
        validProposalType = upper as ProposalType;
      }
    }

    const bid = await prisma.bid.create({
      data: {
        listingId: listing.id,
        vendorId: authUser.userId,
        amount: parsedAmount,
        kwp: parsedKwp,
        proposalType: validProposalType,
        commercialTerm: commercialTerm ? String(commercialTerm).trim() : `₹${parsedAmount}/kWh`,
        proposedKw: proposedKw ? parseFloat(proposedKw) : parsedKwp,
        timelineWeeks: timelineWeeks ? parseInt(timelineWeeks, 10) : 6,
        note: note ? String(note).trim() : null,
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
        message: "Blind bid anchored and submitted successfully. Your price is sealed and invisible to rival companies.",
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

/**
 * PATCH /api/bids
 * Handles two actions:
 * 1. ACCEPT: RWA accepts a winning bid:
 *    - Updates target bid to ACCEPTED
 *    - Updates ALL other pending bids on this listing to NOT_SELECTED
 *    - Transitions listing status to AUDIT_SCHEDULED (or CONTRACTED if directContract=true)
 *    - Automatically creates an Audit record in PENDING status
 * 2. WITHDRAW: Vendor withdraws their own pending bid (only while listing is still LIVE/ACTIVE/OPEN)
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { bidId, id, action, status, directContract } = body;
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

    const isAcceptAction = action === "ACCEPT" || status === "ACCEPTED";
    const isWithdrawAction = action === "WITHDRAW" || status === "WITHDRAWN";

    // 1. Handling VENDOR WITHDRAW
    if (isWithdrawAction) {
      // Only the vendor who submitted the bid (or Admin) can withdraw it
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
        where: { id: targetBidId },
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
      // Role check: Only listing owner (RWA) or ADMIN can accept bids
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

      // Next listing state: AUDIT_SCHEDULED (or CONTRACTED if directContract=true)
      const nextListingStatus = directContract ? "CONTRACTED" : "AUDIT_SCHEDULED";

      // Execute atomic transaction:
      // a. Mark winning bid as ACCEPTED
      // b. Mark all rival pending bids on this listing as NOT_SELECTED
      // c. Transition listing status to AUDIT_SCHEDULED
      // d. Create or upsert an Audit record
      const [updatedBid, rivalBidsUpdate, updatedListing, auditRecord] = await prisma.$transaction([
        prisma.bid.update({
          where: { id: targetBidId },
          data: { status: "ACCEPTED" },
        }),
        prisma.bid.updateMany({
          where: {
            listingId: bid.listingId,
            id: { not: targetBidId },
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
            acceptedBidId: targetBidId,
            outcome: "PENDING",
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days out
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

    // Default status update (e.g. REJECTED)
    const targetStatus = status || "REJECTED";
    const updatedBid = await prisma.bid.update({
      where: { id: targetBidId },
      data: { status: targetStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Bid updated to ${targetStatus}`,
      bid: updatedBid,
    });
  } catch (error: any) {
    console.error("PATCH /api/bids error:", error);
    return NextResponse.json({ error: "Failed to update bid" }, { status: 500 });
  }
}
