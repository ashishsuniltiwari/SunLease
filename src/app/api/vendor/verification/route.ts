import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { DocumentType, VendorStatus } from "@prisma/client";

/**
 * GET /api/vendor/verification
 * Returns current vendor's verification dossier and status
 */
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        vendorProfile: true,
        vendorDocuments: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const effectiveStatus = (user.vendorProfile?.status || user.status || "UNSUBMITTED") as string;

    return NextResponse.json({
      success: true,
      status: effectiveStatus,
      isVerified: user.isVerified,
      profile: user.vendorProfile,
      documents: user.vendorDocuments,
      rejectionReason: user.vendorProfile?.rejectionReason || null,
    });
  } catch (error: any) {
    console.error("GET /api/vendor/verification error:", error);
    return NextResponse.json({ error: "Failed to fetch verification status" }, { status: 500 });
  }
}

/**
 * POST /api/vendor/verification
 * Vendor submits 3 documents (PAN, GST, DISCOM) and company details
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, panUrl, gstUrl, discomUrl } = body;

    if (!companyName || !panUrl || !gstUrl || !discomUrl) {
      return NextResponse.json(
        { error: "Company name and all 3 compliance documents (PAN, GST, and DISCOM) are required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user status to PENDING
      await tx.user.update({
        where: { id: authUser.userId },
        data: {
          status: "PENDING",
          isVerified: false,
          name: companyName.trim(),
        },
      });

      // 2. Upsert Vendor Profile to PENDING
      const profile = await tx.vendorProfile.upsert({
        where: { userId: authUser.userId },
        create: {
          userId: authUser.userId,
          companyName: companyName.trim(),
          status: VendorStatus.PENDING,
          rejectionReason: null,
        },
        update: {
          companyName: companyName.trim(),
          status: VendorStatus.PENDING,
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });

      // 3. Clear old documents and insert the new 3 documents
      await tx.vendorDocument.deleteMany({
        where: { vendorId: authUser.userId },
      });

      const docs = await tx.vendorDocument.createMany({
        data: [
          {
            vendorId: authUser.userId,
            profileId: profile.id,
            docType: DocumentType.PAN,
            fileKey: panUrl,
            fileName: "Company_PAN_Card.pdf",
            mimeType: "application/pdf",
          },
          {
            vendorId: authUser.userId,
            profileId: profile.id,
            docType: DocumentType.GST,
            fileKey: gstUrl,
            fileName: "GST_Registration.pdf",
            mimeType: "application/pdf",
          },
          {
            vendorId: authUser.userId,
            profileId: profile.id,
            docType: DocumentType.DISCOM,
            fileKey: discomUrl,
            fileName: "DISCOM_Empanelment.pdf",
            mimeType: "application/pdf",
          },
        ],
      });

      return { profile, docs };
    });

    return NextResponse.json({
      success: true,
      message: "Compliance dossier submitted successfully. Your application is now in the Admin Review Queue.",
      profile: result.profile,
    });
  } catch (error: any) {
    console.error("POST /api/vendor/verification error:", error);
    return NextResponse.json({ error: "Failed to submit verification dossier", details: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/vendor/verification
 * Allows a rejected vendor to reset their status to UNSUBMITTED for re-uploading
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: authUser.userId },
        data: { status: "UNSUBMITTED", isVerified: false },
      }),
      prisma.vendorProfile.updateMany({
        where: { userId: authUser.userId },
        data: { status: VendorStatus.UNSUBMITTED },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Application reset. You can now upload fresh compliance documents.",
    });
  } catch (error: any) {
    console.error("PATCH /api/vendor/verification error:", error);
    return NextResponse.json({ error: "Failed to reset application", details: error.message }, { status: 500 });
  }
}
