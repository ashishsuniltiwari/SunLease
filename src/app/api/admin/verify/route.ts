import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

/**
 * GET /api/admin/verify
 * Allows Admin to list all vendors and their verification status
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
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
        role: true,
        isVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
      count: vendors.length,
      vendors,
    });
  } catch (error: any) {
    console.error("GET /api/admin/verify error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor verification queue" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/verify
 * Admin vendor approval / rejection endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only platform administrators can approve vendors" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const vendorId = body.vendorId || body.userId || body.id;

    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json(
        { error: "A valid vendorId or userId is required" },
        { status: 400 }
      );
    }

    // Determine target status
    let targetStatus = "APPROVED";
    let isVerified = true;

    if (body.action) {
      const act = String(body.action).toLowerCase();
      if (act === "reject" || act === "rejected") {
        targetStatus = "REJECTED";
        isVerified = false;
      } else if (act === "approve" || act === "approved") {
        targetStatus = "APPROVED";
        isVerified = true;
      }
    } else if (body.status) {
      targetStatus = String(body.status).toUpperCase();
      isVerified = targetStatus === "APPROVED";
    } else if (typeof body.isVerified === "boolean") {
      isVerified = body.isVerified;
      targetStatus = isVerified ? "APPROVED" : "REJECTED";
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: vendorId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target vendor user not found" },
        { status: 404 }
      );
    }

    // Update vendor verification status
    const updatedVendor = await prisma.user.update({
      where: { id: vendorId },
      data: {
        isVerified,
        status: targetStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Vendor ${targetUser.email} has been ${isVerified ? "approved" : "updated"}`,
      vendor: updatedVendor,
    });
  } catch (error: any) {
    console.error("POST /api/admin/verify error:", error);
    return NextResponse.json(
      { error: "Failed to update vendor verification status" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/verify
 * Alias to POST for RESTful updates
 */
export async function PATCH(req: NextRequest) {
  return POST(req);
}
