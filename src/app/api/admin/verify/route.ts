import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { VendorStatus } from "@prisma/client";

/**
 * GET /api/admin/verify
 * Lists all vendors, their documents (PAN, GST, DISCOM), and status
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only platform administrators can view vendor verification queue" },
        { status: 403 }
      );
    }

    const { searchParams } = req.nextUrl;
    const statusFilter = searchParams.get("status");

    const where: any = { role: "VENDOR" };
    if (statusFilter && statusFilter.toUpperCase() !== "ALL") {
      where.status = {
        equals: statusFilter,
        mode: "insensitive",
      };
    }

    const vendors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        vendorProfile: {
          select: {
            id: true,
            companyName: true,
            status: true,
            rejectionReason: true,
            reviewedBy: true,
            reviewedAt: true,
          },
        },
        vendorDocuments: {
          select: {
            id: true,
            docType: true,
            fileKey: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error: any) {
    console.error("GET /api/admin/verify error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor verification queue", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/verify (and PATCH)
 * Admin actions: APPROVE, REJECT (with mandatory rejectionReason), SUSPEND, REACTIVATE
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only platform administrators can update vendor status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const vendorId = body.vendorId || body.userId || body.id;
    const action = String(body.action || "").toUpperCase();
    const rejectionReason = body.rejectionReason?.trim() || null;

    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json({ error: "A valid vendorId or userId is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: vendorId },
      include: { vendorProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target vendor user not found" }, { status: 404 });
    }

    let targetStatus: VendorStatus = VendorStatus.APPROVED;
    let isVerified = true;

    if (action === "REJECT") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "A rejection reason is mandatory when rejecting a vendor application" },
          { status: 400 }
        );
      }
      targetStatus = VendorStatus.REJECTED;
      isVerified = false;
    } else if (action === "SUSPEND") {
      targetStatus = VendorStatus.SUSPENDED;
      isVerified = false;
    } else if (action === "REACTIVATE" || action === "APPROVE") {
      targetStatus = VendorStatus.APPROVED;
      isVerified = true;
    } else if (body.status) {
      const s = String(body.status).toUpperCase();
      targetStatus = s as VendorStatus;
      isVerified = targetStatus === VendorStatus.APPROVED;
    }

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user
      const updatedUser = await tx.user.update({
        where: { id: vendorId },
        data: {
          status: targetStatus,
          isVerified,
        },
      });

      // 2. Upsert vendor profile with decision
      const updatedProfile = await tx.vendorProfile.upsert({
        where: { userId: vendorId },
        create: {
          userId: vendorId,
          companyName: targetUser.name || "Solar EPC Developer",
          status: targetStatus,
          rejectionReason: action === "REJECT" ? rejectionReason : null,
          reviewedBy: authUser.email,
          reviewedAt: new Date(),
        },
        update: {
          status: targetStatus,
          rejectionReason: action === "REJECT" ? rejectionReason : null,
          reviewedBy: authUser.email,
          reviewedAt: new Date(),
        },
      });

      // 3. If suspended, atomically withdraw all pending bids by this vendor
      if (action === "SUSPEND") {
        await tx.bid.updateMany({
          where: {
            vendorId: vendorId,
            status: "PENDING",
          },
          data: {
            status: "WITHDRAWN",
          },
        });
      }

      return { updatedUser, updatedProfile };
    });

    return NextResponse.json({
      success: true,
      message: `Vendor ${targetUser.email} status updated to ${targetStatus}`,
      user: result.updatedUser,
      profile: result.updatedProfile,
    });
  } catch (error: any) {
    console.error("POST /api/admin/verify error:", error);
    return NextResponse.json(
      { error: "Failed to update vendor verification status", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
