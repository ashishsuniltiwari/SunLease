import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { AuditOutcome } from "@prisma/client";

/**
 * GET /api/audits
 * Fetch audit details for a listing or bid
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const listingId = searchParams.get("listingId") || searchParams.get("roofId");
    const bidId = searchParams.get("bidId");
    const auditId = searchParams.get("id");

    const where: any = {};
    if (auditId) where.id = auditId;
    if (listingId) where.roofId = listingId;
    if (bidId) where.acceptedBidId = bidId;

    const audits = await prisma.audit.findMany({
      where,
      include: {
        roof: {
          select: {
            id: true,
            societyName: true,
            society: true,
            location: true,
            city: true,
            area: true,
            status: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        acceptedBid: {
          select: {
            id: true,
            amount: true,
            kwp: true,
            proposalType: true,
            commercialTerm: true,
            vendorId: true,
            status: true,
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
      orderBy: { createdAt: "desc" },
    });

    // Security check: filter audits only accessible to owner RWA, winning vendor, or Admin
    const authorizedAudits = audits.filter((audit) => {
      if (authUser.role === "ADMIN") return true;
      if (authUser.role === "RWA" && audit.roof.userId === authUser.userId) return true;
      if (authUser.role === "VENDOR" && audit.acceptedBid.vendorId === authUser.userId) return true;
      return false;
    });

    if (auditId && authorizedAudits.length === 0) {
      return NextResponse.json({ error: "Audit not found or access forbidden" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      count: authorizedAudits.length,
      audits: authorizedAudits,
    });
  } catch (error: any) {
    console.error("GET /api/audits error:", error);
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
  }
}

/**
 * PATCH /api/audits
 * Updates audit record:
 * - Vendor adds vendorVisitNote
 * - RWA records audit outcome:
 *   - PASSED: Ready for contract
 *   - FAILED_REOPEN: Reopens listing back to LIVE, marks accepted bid NOT_SELECTED
 *   - FAILED_WITHDRAW: Moves listing to WITHDRAWN
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { auditId, id, listingId, vendorVisitNote, outcome, scheduledDate } = body;
    const targetAuditId = auditId || id;

    let audit: any = null;
    if (targetAuditId) {
      audit = await prisma.audit.findUnique({
        where: { id: targetAuditId },
        include: { roof: true, acceptedBid: true },
      });
    } else if (listingId) {
      audit = await prisma.audit.findFirst({
        where: { roofId: listingId },
        include: { roof: true, acceptedBid: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!audit) {
      return NextResponse.json({ error: "Audit record not found" }, { status: 404 });
    }

    const isRwaOwner = audit.roof.userId === authUser.userId;
    const isWinningVendor = audit.acceptedBid.vendorId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isRwaOwner && !isWinningVendor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not authorized for this audit" }, { status: 403 });
    }

    // 1. Vendor updating visit notes
    if (vendorVisitNote !== undefined) {
      if (!isWinningVendor && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only the winning vendor can record physical visit notes" },
          { status: 403 }
        );
      }

      const updatedAudit = await prisma.audit.update({
        where: { id: audit.id },
        data: {
          vendorVisitNote: String(vendorVisitNote).trim(),
          ...(scheduledDate ? { scheduledDate: new Date(scheduledDate) } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Vendor visit note recorded successfully",
        audit: updatedAudit,
      });
    }

    // 2. RWA recording audit outcome
    if (outcome) {
      if (!isRwaOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only the RWA committee can record the final audit outcome" },
          { status: 403 }
        );
      }

      const upperOutcome = String(outcome).toUpperCase();
      if (!Object.values(AuditOutcome).includes(upperOutcome as AuditOutcome)) {
        return NextResponse.json(
          {
            error: `Invalid outcome. Must be one of: ${Object.values(AuditOutcome).join(", ")}`,
          },
          { status: 400 }
        );
      }

      const parsedOutcome = upperOutcome as AuditOutcome;

      // Handle Outcome: PASSED
      if (parsedOutcome === AuditOutcome.PASSED) {
        const updatedAudit = await prisma.audit.update({
          where: { id: audit.id },
          data: {
            outcome: AuditOutcome.PASSED,
            recordedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Physical audit marked as PASSED. Ready for off-platform contract recording.",
          audit: updatedAudit,
        });
      }

      // Handle Outcome: FAILED_REOPEN (reopens roof to LIVE, marks winning bid NOT_SELECTED)
      if (parsedOutcome === AuditOutcome.FAILED_REOPEN) {
        const [updatedAudit, updatedBid, updatedListing] = await prisma.$transaction([
          prisma.audit.update({
            where: { id: audit.id },
            data: {
              outcome: AuditOutcome.FAILED_REOPEN,
              recordedAt: new Date(),
            },
          }),
          prisma.bid.update({
            where: { id: audit.acceptedBidId },
            data: { status: "NOT_SELECTED" },
          }),
          prisma.roofListing.update({
            where: { id: audit.roofId },
            data: { status: "LIVE" },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Audit marked as Failed. Listing has been reopened to LIVE for new vendor proposals.",
          audit: updatedAudit,
          bid: updatedBid,
          listing: updatedListing,
        });
      }

      // Handle Outcome: FAILED_WITHDRAW (moves roof to WITHDRAWN)
      if (parsedOutcome === AuditOutcome.FAILED_WITHDRAW) {
        const [updatedAudit, updatedListing] = await prisma.$transaction([
          prisma.audit.update({
            where: { id: audit.id },
            data: {
              outcome: AuditOutcome.FAILED_WITHDRAW,
              recordedAt: new Date(),
            },
          }),
          prisma.roofListing.update({
            where: { id: audit.roofId },
            data: { status: "WITHDRAWN" },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Audit marked as Failed and listing has been withdrawn.",
          audit: updatedAudit,
          listing: updatedListing,
        });
      }
    }

    return NextResponse.json({ error: "No valid audit action provided" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/audits error:", error);
    return NextResponse.json({ error: "Failed to update audit" }, { status: 500 });
  }
}
