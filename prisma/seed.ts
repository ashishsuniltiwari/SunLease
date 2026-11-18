import {
  PrismaClient,
  Role,
  VendorStatus,
  DocumentType,
  ProposalType,
  AuditOutcome,
  SystemStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SunLease database seeding with extended relational schema...");

  // 1. Identify and delete old incompatible user rows (Argon2 hashes or non-bcrypt)
  console.log("🔍 Scanning for incompatible (Argon2) user accounts...");
  const incompatibleUsers = await prisma.user.findMany({
    where: {
      OR: [
        { password: { startsWith: "$argon2" } },
        { password: null },
        { NOT: { password: { startsWith: "$2" } } },
      ],
      NOT: {
        AND: [
          {
            email: {
              in: [
                "admin@palmmeadows.rwa.org",
                "vendor@solargrid.in",
                "superadmin@sunlease.io",
                "pending.vendor@soltech.in",
              ],
            },
          },
          { password: { startsWith: "$2" } },
        ],
      },
    },
    select: { id: true, email: true },
  });

  if (incompatibleUsers.length > 0) {
    const incompatibleUserIds = incompatibleUsers.map((u) => u.id);
    console.log(`Found ${incompatibleUsers.length} incompatible user rows to delete.`);

    await prisma.ticketMessage.deleteMany({
      where: { senderId: { in: incompatibleUserIds } },
    });

    await prisma.ticket.updateMany({
      where: { userId: { in: incompatibleUserIds } },
      data: { userId: null },
    });

    await prisma.contract.deleteMany({
      where: { bid: { vendorId: { in: incompatibleUserIds } } },
    });

    await prisma.audit.deleteMany({
      where: { acceptedBid: { vendorId: { in: incompatibleUserIds } } },
    });

    await prisma.bid.deleteMany({
      where: { vendorId: { in: incompatibleUserIds } },
    });

    const incompatibleListings = await prisma.roofListing.findMany({
      where: { userId: { in: incompatibleUserIds } },
      select: { id: true },
    });
    const listingIds = incompatibleListings.map((l) => l.id);

    if (listingIds.length > 0) {
      await prisma.contract.deleteMany({
        where: { roofId: { in: listingIds } },
      });
      await prisma.audit.deleteMany({
        where: { roofId: { in: listingIds } },
      });
      await prisma.bid.deleteMany({
        where: { listingId: { in: listingIds } },
      });
      await prisma.telemetry.updateMany({
        where: { listingId: { in: listingIds } },
        data: { listingId: null },
      });
      await prisma.ticket.updateMany({
        where: { listingId: { in: listingIds } },
        data: { listingId: null },
      });
      await prisma.roofListing.deleteMany({
        where: { id: { in: listingIds } },
      });
    }

    await prisma.vendorDocument.deleteMany({
      where: { vendorId: { in: incompatibleUserIds } },
    });
    await prisma.vendorProfile.deleteMany({
      where: { userId: { in: incompatibleUserIds } },
    });

    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: incompatibleUserIds } },
    });
    console.log(`  ✓ Successfully deleted ${deletedUsers.count} incompatible user rows.`);
  }

  // 2. Hash default password with bcryptjs
  const defaultPassword = "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 3. Upsert clean demo accounts for all 3 roles
  console.log("👥 Upserting core demo accounts...");

  // 3a. RWA Account
  const rwaUser = await prisma.user.upsert({
    where: { email: "admin@palmmeadows.rwa.org" },
    update: {
      password: hashedPassword,
      role: Role.RWA,
      isVerified: true,
      status: "VERIFIED",
      name: "Palm Meadows RWA Committee",
      phone: "+91 98200 12345",
    },
    create: {
      email: "admin@palmmeadows.rwa.org",
      password: hashedPassword,
      role: Role.RWA,
      isVerified: true,
      status: "VERIFIED",
      name: "Palm Meadows RWA Committee",
      phone: "+91 98200 12345",
    },
  });
  console.log(`  ✓ RWA: admin@palmmeadows.rwa.org / ${defaultPassword} [${rwaUser.id}]`);

  // 3b. Approved Vendor Account
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@solargrid.in" },
    update: {
      password: hashedPassword,
      role: Role.VENDOR,
      isVerified: true,
      status: "APPROVED",
      name: "SolarGrid EPC Solutions",
      phone: "+91 98110 54321",
    },
    create: {
      email: "vendor@solargrid.in",
      password: hashedPassword,
      role: Role.VENDOR,
      isVerified: true,
      status: "APPROVED",
      name: "SolarGrid EPC Solutions",
      phone: "+91 98110 54321",
    },
  });
  console.log(`  ✓ Vendor: vendor@solargrid.in / ${defaultPassword} [${vendorUser.id}]`);

  // Upsert VendorProfile for SolarGrid
  const solarGridProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {
      companyName: "SolarGrid EPC Solutions Pvt Ltd",
      status: VendorStatus.APPROVED,
      reviewedBy: "Super Admin",
      reviewedAt: new Date(),
    },
    create: {
      userId: vendorUser.id,
      companyName: "SolarGrid EPC Solutions Pvt Ltd",
      status: VendorStatus.APPROVED,
      reviewedBy: "Super Admin",
      reviewedAt: new Date(),
    },
  });

  // Seed 3 compliance documents for SolarGrid (PAN, GST, DISCOM)
  await prisma.vendorDocument.deleteMany({
    where: { vendorId: vendorUser.id },
  });

  await prisma.vendorDocument.createMany({
    data: [
      {
        vendorId: vendorUser.id,
        profileId: solarGridProfile.id,
        docType: DocumentType.PAN,
        fileKey: "/uploads/demo_solargrid_pan.pdf",
        fileName: "SolarGrid_Corporate_PAN.pdf",
        fileSize: 450000,
        mimeType: "application/pdf",
      },
      {
        vendorId: vendorUser.id,
        profileId: solarGridProfile.id,
        docType: DocumentType.GST,
        fileKey: "/uploads/demo_solargrid_gst.pdf",
        fileName: "SolarGrid_GST_Certificate_27AAACS.pdf",
        fileSize: 620000,
        mimeType: "application/pdf",
      },
      {
        vendorId: vendorUser.id,
        profileId: solarGridProfile.id,
        docType: DocumentType.DISCOM,
        fileKey: "/uploads/demo_solargrid_discom.pdf",
        fileName: "MSEDCL_Adani_Empanelment_Letter_2026.pdf",
        fileSize: 890000,
        mimeType: "application/pdf",
      },
    ],
  });

  // 3c. Pending Vendor Account (for Admin Verification Queue testing)
  const pendingVendorUser = await prisma.user.upsert({
    where: { email: "pending.vendor@soltech.in" },
    update: {
      password: hashedPassword,
      role: Role.VENDOR,
      isVerified: false,
      status: "PENDING",
      name: "Soltech Bharat Renewables",
      phone: "+91 97654 32100",
    },
    create: {
      email: "pending.vendor@soltech.in",
      password: hashedPassword,
      role: Role.VENDOR,
      isVerified: false,
      status: "PENDING",
      name: "Soltech Bharat Renewables",
      phone: "+91 97654 32100",
    },
  });

  const pendingProfile = await prisma.vendorProfile.upsert({
    where: { userId: pendingVendorUser.id },
    update: {
      companyName: "Soltech Bharat Renewables Ltd",
      status: VendorStatus.PENDING,
    },
    create: {
      userId: pendingVendorUser.id,
      companyName: "Soltech Bharat Renewables Ltd",
      status: VendorStatus.PENDING,
    },
  });

  await prisma.vendorDocument.deleteMany({
    where: { vendorId: pendingVendorUser.id },
  });

  await prisma.vendorDocument.createMany({
    data: [
      {
        vendorId: pendingVendorUser.id,
        profileId: pendingProfile.id,
        docType: DocumentType.PAN,
        fileKey: "/uploads/demo_soltech_pan.pdf",
        fileName: "Soltech_PAN_Card.pdf",
        fileSize: 320000,
        mimeType: "application/pdf",
      },
      {
        vendorId: pendingVendorUser.id,
        profileId: pendingProfile.id,
        docType: DocumentType.GST,
        fileKey: "/uploads/demo_soltech_gst.pdf",
        fileName: "Soltech_GST_Registration.pdf",
        fileSize: 510000,
        mimeType: "application/pdf",
      },
      {
        vendorId: pendingVendorUser.id,
        profileId: pendingProfile.id,
        docType: DocumentType.DISCOM,
        fileKey: "/uploads/demo_soltech_discom.pdf",
        fileName: "DISCOM_SuryaGhar_Letter.pdf",
        fileSize: 740000,
        mimeType: "application/pdf",
      },
    ],
  });
  console.log(`  ✓ Pending Vendor: pending.vendor@soltech.in / ${defaultPassword} [${pendingVendorUser.id}]`);

  // 3d. Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: "superadmin@sunlease.io" },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      status: "VERIFIED",
      name: "SunLease Super Admin",
    },
    create: {
      email: "superadmin@sunlease.io",
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      status: "VERIFIED",
      name: "SunLease Super Admin",
    },
  });
  console.log(`  ✓ Admin: superadmin@sunlease.io / ${defaultPassword} [${adminUser.id}]`);

  // 4. Ensure demo rooftop listing exists with extended parameters
  const existingListing = await prisma.roofListing.findFirst({
    where: { societyName: { contains: "Palm Meadows" } },
  });

  let listingId: string;
  if (!existingListing) {
    const newListing = await prisma.roofListing.create({
      data: {
        societyName: "Palm Meadows Society Tower A",
        society: "Palm Meadows Society Tower A",
        location: "Kandivali East, Mumbai, MH",
        city: "Mumbai",
        area: 14500,
        usable_area_sqm: 1347,
        sunlight_hours_yr: 1780,
        estimated_kw: 116,
        data_source: "GOOGLE_SOLAR",
        shade_note: "Minimal parapet shade on East wing; 94% unshaded solar window.",
        public_note: "Looking for 25-year zero-CAPEX RESCO lease with Tier-1 bifacial panels.",
        status: "LIVE",
        userId: rwaUser.id,
      },
    });
    listingId = newListing.id;
    console.log(`  ✓ Created default marketplace listing: ${newListing.societyName}`);
  } else {
    await prisma.roofListing.update({
      where: { id: existingListing.id },
      data: {
        usable_area_sqm: 1347,
        sunlight_hours_yr: 1780,
        estimated_kw: 116,
        data_source: "GOOGLE_SOLAR",
        status: "LIVE",
      },
    });
    listingId = existingListing.id;
  }

  // 5. Seed a demo blind bid from SolarGrid on the Palm Meadows listing
  const existingBid = await prisma.bid.findFirst({
    where: {
      listingId,
      vendorId: vendorUser.id,
    },
  });

  let bidId: string;
  if (!existingBid) {
    const newBid = await prisma.bid.create({
      data: {
        listingId,
        vendorId: vendorUser.id,
        amount: 3.35,
        kwp: 116.0,
        proposalType: ProposalType.RESCO_LEASE,
        commercialTerm: "₹3.35 / kWh fixed tariff for 25 years (Zero CAPEX)",
        proposedKw: 116.0,
        timelineWeeks: 6,
        note: "Includes tier-1 Monocrystalline bifacial modules, SMA inverters, and 25-year comprehensive O&M.",
        status: "PENDING",
      },
    });
    bidId = newBid.id;
    console.log(`  ✓ Seeded demo blind bid: ${newBid.id} (₹3.35/kWh, 116 kWp)`);
  } else {
    bidId = existingBid.id;
  }

  // 6. Seed a sample ticket message thread
  const existingTicket = await prisma.ticket.findFirst({
    where: { listingId },
  });

  if (existingTicket) {
    await prisma.ticketMessage.deleteMany({
      where: { ticketId: existingTicket.id },
    });

    await prisma.ticketMessage.createMany({
      data: [
        {
          ticketId: existingTicket.id,
          senderId: rwaUser.id,
          senderRole: "RWA",
          body: "Inverter telemetry dropped to 0 kW between 13:00 and 13:30. Please inspect rooftop connection box.",
        },
        {
          ticketId: existingTicket.id,
          senderId: vendorUser.id,
          senderRole: "VENDOR",
          body: "Acknowledged by SolarGrid EPC operations team. Field technician dispatched for string inverter diagnostics.",
        },
      ],
    });
    console.log(`  ✓ Seeded ticket message thread for ticket ${existingTicket.id}`);
  }

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
