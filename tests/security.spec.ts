import { test, expect } from "@playwright/test";

test.describe("Sprint 4 Security - Vendor Blind-Bid Isolation & Anti-Collusion", () => {
  const timestamp = Date.now();
  const rwaEmail = `rwa_sec_${timestamp}@sunlease.test`;
  const vendor1Email = `vendor1_sec_${timestamp}@sunlease.test`;
  const vendor2Email = `vendor2_sec_${timestamp}@sunlease.test`;
  const testPassword = "Password@123";

  test("Verify Vendor JWT cannot query rival bids (expecting 404/403)", async ({
    playwright,
    baseURL,
  }) => {
    // 1. Create separate HTTP clients for RWA, Vendor 1, Vendor 2, and Anonymous
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

    const anonymousContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    // 2. Register RWA User
    const rwaRes = await rwaContext.post("/api/auth/register", {
      data: {
        email: rwaEmail,
        password: testPassword,
        role: "RWA",
        name: "Security Audit RWA",
      },
    });
    expect(rwaRes.status()).toBe(201);

    // 3. Register Vendor 1
    const vendor1Res = await vendor1Context.post("/api/auth/register", {
      data: {
        email: vendor1Email,
        password: testPassword,
        role: "VENDOR",
        name: "Solar Prime Vendor 1",
      },
    });
    expect(vendor1Res.status()).toBe(201);
    const vendor1Data = await vendor1Res.json();
    const vendor1Id = vendor1Data.user.id;

    // 4. Register Vendor 2
    const vendor2Res = await vendor2Context.post("/api/auth/register", {
      data: {
        email: vendor2Email,
        password: testPassword,
        role: "VENDOR",
        name: "GreenGrid Rival Vendor 2",
      },
    });
    expect(vendor2Res.status()).toBe(201);
    const vendor2Data = await vendor2Res.json();
    const vendor2Id = vendor2Data.user.id;

    // 5. RWA creates a listing
    const listingRes = await rwaContext.post("/api/listings", {
      data: {
        societyName: `Security Enclave Tower - ${timestamp}`,
        society: `Security Enclave Tower - ${timestamp}`,
        area: 16000,
        status: "LIVE",
      },
    });
    expect(listingRes.status()).toBe(201);
    const listingData = await listingRes.json();
    const listingId = listingData.listing.id;

    // 6. Vendor 1 submits a confidential blind bid (Bid 1)
    const bid1Res = await vendor1Context.post("/api/bids", {
      data: {
        listingId,
        amount: 3.12, // Confidential tariff offered by Vendor 1
        kwp: 110.0,
        status: "PENDING",
      },
    });
    expect(bid1Res.status()).toBe(201);
    const bid1Data = await bid1Res.json();
    const bid1Id = bid1Data.bid.id;

    // 7. Vendor 2 submits their own bid (Bid 2)
    const bid2Res = await vendor2Context.post("/api/bids", {
      data: {
        listingId,
        amount: 3.48, // Tariff offered by Vendor 2
        kwp: 105.0,
        status: "PENDING",
      },
    });
    expect(bid2Res.status()).toBe(201);
    const bid2Data = await bid2Res.json();
    const bid2Id = bid2Data.bid.id;

    // =========================================================================
    // SECURITY ASSERTIONS: Vendor 2 attempts to query Vendor 1's rival bid
    // =========================================================================

    // Test 1: Query rival bid directly via path parameter /api/bids/[rivalBidId]
    const rivalQueryPathRes = await vendor2Context.get(`/api/bids/${bid1Id}`);
    expect([403, 404]).toContain(rivalQueryPathRes.status());

    // Test 2: Query rival bid via query parameter ?id=[rivalBidId]
    const rivalQueryParamRes = await vendor2Context.get(`/api/bids?id=${bid1Id}`);
    expect([403, 404]).toContain(rivalQueryParamRes.status());

    // Test 3: Query rival bid via query parameter ?bidId=[rivalBidId]
    const rivalQueryParamAltRes = await vendor2Context.get(`/api/bids?bidId=${bid1Id}`);
    expect([403, 404]).toContain(rivalQueryParamAltRes.status());

    // Test 4: Vendor 2 attempts to query rival vendor's bids via ?vendorId=[vendor1Id]
    const rivalVendorFilterRes = await vendor2Context.get(`/api/bids?vendorId=${vendor1Id}`);
    expect([403, 404]).toContain(rivalVendorFilterRes.status());

    // Test 5: DB-level blind bid isolation on standard GET /api/bids
    const vendor2BidsRes = await vendor2Context.get("/api/bids");
    expect(vendor2BidsRes.status()).toBe(200);
    const vendor2BidsData = await vendor2BidsRes.json();

    // Must contain Vendor 2's own bid
    const hasOwnBid = vendor2BidsData.bids.some((b: any) => b.id === bid2Id);
    expect(hasOwnBid).toBe(true);

    // MUST NOT contain Vendor 1's rival bid
    const hasRivalBid = vendor2BidsData.bids.some((b: any) => b.id === bid1Id);
    expect(hasRivalBid).toBe(false);

    // Strict validation: every bid returned must belong exclusively to Vendor 2
    for (const b of vendor2BidsData.bids) {
      expect(b.vendorId).toBe(vendor2Id);
      expect(b.vendorId).not.toBe(vendor1Id);
    }

    // Test 6: Unauthenticated request should be rejected with 401
    const unauthRes = await anonymousContext.get(`/api/bids/${bid1Id}`);
    expect(unauthRes.status()).toBe(401);

    const unauthListRes = await anonymousContext.get("/api/bids");
    expect(unauthListRes.status()).toBe(401);

    // Test 7: Legitimate RWA owner CAN view the bid on their own listing
    const rwaOwnerRes = await rwaContext.get(`/api/bids/${bid1Id}`);
    expect(rwaOwnerRes.status()).toBe(200);
    const rwaOwnerData = await rwaOwnerRes.json();
    expect(rwaOwnerData.bid.id).toBe(bid1Id);

    // Cleanup contexts
    await rwaContext.dispose();
    await vendor1Context.dispose();
    await vendor2Context.dispose();
    await anonymousContext.dispose();
  });
});
