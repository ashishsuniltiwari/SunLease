import { test, expect } from "@playwright/test";

test.describe("Sprint 4 E2E - Rooftop Solar Marketplace Full 6-State Lifecycle", () => {
  const timestamp = Date.now();
  const rwaEmail = `rwa_marketplace_${timestamp}@sunlease.test`;
  const vendor1Email = `vendor1_marketplace_${timestamp}@sunlease.test`;
  const vendor2Email = `vendor2_marketplace_${timestamp}@sunlease.test`;
  const testPassword = "Password@123";

  test("Simulate full 6-state lifecycle: Draft -> Live -> Blind Bidding -> Duplicate check -> Accept (Audit Scheduled) -> Audit Passed -> Contracted", async ({
    playwright,
    baseURL,
  }) => {
    // 1. Initialize isolated HTTP clients
    const rwaContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    const vendor1Context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    const vendor2Context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    // 2. Register RWA User
    const rwaRegRes = await rwaContext.post("/api/auth/register", {
      data: {
        email: rwaEmail,
        password: testPassword,
        role: "RWA",
        name: "Palm Heights RWA Committee",
      },
    });
    expect(rwaRegRes.status()).toBe(201);

    // 3. Register Vendor 1 and Vendor 2
    const vendor1RegRes = await vendor1Context.post("/api/auth/register", {
      data: {
        email: vendor1Email,
        password: testPassword,
        role: "VENDOR",
        name: "SunGrid Power Solutions Ltd",
      },
    });
    expect(vendor1RegRes.status()).toBe(201);

    const vendor2RegRes = await vendor2Context.post("/api/auth/register", {
      data: {
        email: vendor2Email,
        password: testPassword,
        role: "VENDOR",
        name: "Apex Solar EPC",
      },
    });
    expect(vendor2RegRes.status()).toBe(201);

    // 4. Test Draft State: RWA creates a DRAFT rooftop listing
    const draftRes = await rwaContext.post("/api/listings", {
      data: {
        societyName: `Draft Enclave - ${timestamp}`,
        society: `Draft Enclave - ${timestamp}`,
        area: 10000,
        status: "DRAFT",
      },
    });
    expect(draftRes.status()).toBe(201);
    const draftData = await draftRes.json();
    const draftListingId = draftData.listing.id;
    expect(draftData.listing.status).toBe("DRAFT");

    // Verify Vendor CANNOT see draft listings on GET /api/listings
    const vendorDraftCheck = await vendor1Context.get("/api/listings");
    const vendorDraftData = await vendorDraftCheck.json();
    expect(vendorDraftData.listings.some((l: any) => l.id === draftListingId)).toBe(false);

    // 5. RWA creates a LIVE rooftop listing for bidding
    const listingPayload = {
      societyName: `Palm Heights Tower C - ${timestamp}`,
      society: `Palm Heights Tower C - ${timestamp}`,
      area: 12500,
      location: "Sector 14, Mira Road (E), Thane",
      city: "Thane",
      status: "LIVE",
    };

    const createListingRes = await rwaContext.post("/api/listings", {
      data: listingPayload,
    });
    expect(createListingRes.status()).toBe(201);
    const listingData = await createListingRes.json();
    const listingId = listingData.listing.id;
    expect(["LIVE", "ACTIVE"]).toContain(listingData.listing.status);

    // 6. Vendor 1 submits a blind bid
    const bid1Res = await vendor1Context.post("/api/bids", {
      data: {
        listingId,
        amount: 3.25,
        kwp: 95.0,
        proposalType: "RESCO_LEASE",
        commercialTerm: "₹3.25/kWh fixed 25y",
        status: "PENDING",
      },
    });
    expect(bid1Res.status()).toBe(201);
    const bid1Data = await bid1Res.json();
    const bid1Id = bid1Data.bid.id;
    expect(bid1Data.bid.status).toBe("PENDING");

    // 7. Test Duplicate Pending Bid Rule: Vendor 1 attempts second pending bid on same listing
    const dupBidRes = await vendor1Context.post("/api/bids", {
      data: {
        listingId,
        amount: 3.10,
        kwp: 100.0,
      },
    });
    // Must be rejected with 409 Conflict
    expect(dupBidRes.status()).toBe(409);

    // 8. Vendor 2 submits a competing bid
    const bid2Res = await vendor2Context.post("/api/bids", {
      data: {
        listingId,
        amount: 3.45,
        kwp: 90.0,
        proposalType: "RESCO_LEASE",
        commercialTerm: "₹3.45/kWh",
        status: "PENDING",
      },
    });
    expect(bid2Res.status()).toBe(201);
    const bid2Data = await bid2Res.json();
    const bid2Id = bid2Data.bid.id;

    // 9. RWA accepts Vendor 1's bid
    // State machine check:
    // - Vendor 1 bid transitions to ACCEPTED
    // - Competing Vendor 2 bid transitions to NOT_SELECTED
    // - Listing transitions to AUDIT_SCHEDULED
    // - Audit record created in PENDING outcome
    const acceptBidRes = await rwaContext.patch("/api/bids", {
      data: {
        bidId: bid1Id,
        action: "ACCEPT",
      },
    });
    expect(acceptBidRes.status()).toBe(200);
    const acceptData = await acceptBidRes.json();
    expect(acceptData.success).toBe(true);
    expect(acceptData.bid.status).toBe("ACCEPTED");
    expect(acceptData.listing.status).toBe("AUDIT_SCHEDULED");

    // Verify Vendor 2's competing bid was automatically marked NOT_SELECTED
    const verifyBid2Res = await vendor2Context.get(`/api/bids?id=${bid2Id}`);
    expect(verifyBid2Res.status()).toBe(200);
    const verifyBid2Data = await verifyBid2Res.json();
    expect(verifyBid2Data.bid.status).toBe("NOT_SELECTED");

    // 10. Physical Audit Phase: Vendor leaves visit note, RWA marks audit PASSED
    const visitNoteRes = await vendor1Context.patch("/api/audits", {
      data: {
        listingId,
        vendorVisitNote: "Structural load bearing test passed. 3-phase net meter space confirmed.",
      },
    });
    expect(visitNoteRes.status()).toBe(200);

    const auditPassRes = await rwaContext.patch("/api/audits", {
      data: {
        listingId,
        outcome: "PASSED",
      },
    });
    expect(auditPassRes.status()).toBe(200);
    const auditPassData = await auditPassRes.json();
    expect(auditPassData.audit.outcome).toBe("PASSED");

    // 11. Contract Recording Phase: RWA confirms off-platform contract execution
    // Transitions listing from AUDIT_SCHEDULED to CONTRACTED
    const contractRes = await rwaContext.post("/api/contracts", {
      data: {
        listingId,
        bidId: bid1Id,
        contractDate: new Date().toISOString(),
        tariffOrShareRate: "₹3.25/kWh",
        vendorConfigNote: "SMA Sunny Tripower 25kW Inverter #01",
      },
    });
    expect(contractRes.status()).toBe(201);
    const contractData = await contractRes.json();
    expect(contractData.listing.status).toBe("CONTRACTED");

    // 12. Verify listing is now CONTRACTED and removed from active bidding pool
    const activeListingsRes = await vendor1Context.get("/api/listings");
    const activeListingsData = await activeListingsRes.json();
    const isStillInMarketplace = activeListingsData.listings.some(
      (l: any) => l.id === listingId && l.status === "LIVE"
    );
    expect(isStillInMarketplace).toBe(false);

    // Cleanup contexts
    await rwaContext.dispose();
    await vendor1Context.dispose();
    await vendor2Context.dispose();
  });
});
