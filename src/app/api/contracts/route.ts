import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { ProposalType, SystemStatus, AuditOutcome } from "@prisma/client";

/**
 * GET /api/contracts
 * Fetch contract details for a listing or contracted vendor
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const listingId = searchParams.get("listingId") || searchParams.get("roofId");
    const contractId = searchParams.get("id");

    const where: any = {};
    if (contractId) where.id = contractId;
    if (listingId) where.roofId = listingId;

    const contracts = await prisma.contract.findMany({
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
        bid: {
          include: {
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

    // Security check: only RWA owner, contracted vendor, or Admin can read
    const authorizedContracts = contracts.filter((c) => {
      if (authUser.role === "ADMIN") return true;
      if (authUser.role === "RWA" && c.roof.userId === authUser.userId) return true;
      if (authUser.role === "VENDOR" && c.bid.vendorId === authUser.userId) return true;
      return false;
    });

    if (contractId && authorizedContracts.length === 0) {
      return NextResponse.json({ error: "Contract not found or access forbidden" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      count: authorizedContracts.length,
      contracts: authorizedContracts,
    });
  } catch (error: any) {
    console.error("GET /api/contracts error:", error);
    return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}

/**
 * POST /api/contracts
 * RWA confirms an off-platform contract was signed:
 * - Validates listing is in AUDIT_SCHEDULED
 * - Transitions listing status to CONTRACTED
 * - Activates live telemetry monitoring for this roof
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      listingId,
      bidId,
      contractDate,
      proposalType,
      tariffOrShareRate,
      signedDocKey,
      vendorConfigNote,
    } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.roofListing.findUnique({
      where: { id: listingId },
      include: {
        bids: { where: { status: "ACCEPTED" } },
        audits: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Rooftop listing not found" }, { status: 404 });
    }

    // Role check: Only listing owner (RWA) or Admin
    if (
      authUser.role !== "ADMIN" &&
      (authUser.role !== "RWA" || listing.userId !== authUser.userId)
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only the RWA committee can confirm the executed contract" },
        { status: 403 }
      );
    }

    // Find the accepted bid
    const acceptedBid =
      (bidId ? listing.bids.find((b) => b.id === bidId) : listing.bids[0]) ||
      (await prisma.bid.findFirst({
        where: { listingId: listing.id, status: "ACCEPTED" },
      }));

    if (!acceptedBid) {
      return NextResponse.json(
        { error: "Cannot create a contract without an accepted vendor bid" },
        { status: 400 }
      );
    }

    // Determine proposal type
    let validProposalType: ProposalType =
      acceptedBid.proposalType || ProposalType.RESCO_LEASE;
    if (proposalType) {
      const upper = String(proposalType).toUpperCase();
      if (Object.values(ProposalType).includes(upper as ProposalType)) {
        validProposalType = upper as ProposalType;
      }
    }

    // Determine tariff or share rate
    const agreedTariff =
      tariffOrShareRate ||
      acceptedBid.commercialTerm ||
      `₹${acceptedBid.amount}/kWh`;

    // Atomic transaction: Create Contract and set Listing status to CONTRACTED
    const [contract, updatedListing] = await prisma.$transaction([
      prisma.contract.create({
        data: {
          roofId: listing.id,
          bidId: acceptedBid.id,
          contractDate: contractDate ? new Date(contractDate) : new Date(),
          proposalType: validProposalType,
          tariffOrShareRate: agreedTariff,
          signedDocKey: signedDocKey ? String(signedDocKey).trim() : null,
          systemStatus: SystemStatus.ONLINE,
          vendorConfigNote: vendorConfigNote ? String(vendorConfigNote).trim() : null,
        },
      }),
      prisma.roofListing.update({
        where: { id: listing.id },
        data: { status: "CONTRACTED" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message:
          "Off-platform contract recorded successfully. Rooftop is now CONTRACTED and live telemetry monitoring is active.",
        contract,
        listing: updatedListing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/contracts error:", error);
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
  }
}

/**
 * PATCH /api/contracts
 * Vendor updates inverter systemStatus (ONLINE / MAINTENANCE) or writes configuration notes (V-12)
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { contractId, id, listingId, systemStatus, vendorConfigNote } = body;
    const targetId = contractId || id;

    let contract: any = null;
    if (targetId) {
      contract = await prisma.contract.findUnique({
        where: { id: targetId },
        include: { bid: true, roof: true },
      });
    } else if (listingId) {
      contract = await prisma.contract.findFirst({
        where: { roofId: listingId },
        include: { bid: true, roof: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!contract) {
      return NextResponse.json({ error: "Contract record not found" }, { status: 404 });
    }

    // Role check: contracted vendor, owner RWA, or Admin
    const isContractedVendor = contract.bid.vendorId === authUser.userId;
    const isOwnerRwa = contract.roof.userId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isContractedVendor && !isOwnerRwa && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (systemStatus) {
      const upper = String(systemStatus).toUpperCase();
      if (Object.values(SystemStatus).includes(upper as SystemStatus)) {
        updateData.systemStatus = upper as SystemStatus;
      }
    }

    if (vendorConfigNote !== undefined) {
      updateData.vendorConfigNote = String(vendorConfigNote).trim();
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contract.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Contract and plant telemetry parameters updated successfully",
      contract: updatedContract,
    });
  } catch (error: any) {
    console.error("PATCH /api/contracts error:", error);
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
  }
}
