import { test, expect } from "@playwright/test";

test.describe("Sprint 4 E2E - Rooftop Solar Marketplace Full Flow", () => {
  const timestamp = Date.now();
  const rwaEmail = `rwa_marketplace_${timestamp}@sunlease.test`;
  const vendorEmail = `vendor_marketplace_${timestamp}@sunlease.test`;
  const testPassword = "Password@123";

  test("Simulate full lifecycle: RWA creates listing -> Vendor bids -> RWA accepts bid -> State transitions from Live to Contracted", async ({
    playwright,
    baseURL,
  }) => {
    // 1. Initialize isolated HTTP clients for RWA and Vendor
    const rwaContext = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    const vendorContext = await playwright.request.newContext({
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
    const rwaData = await rwaRegRes.json();
    expect(rwaData.success).toBe(true);
    expect(rwaData.user.role).toBe("RWA");

    // 3. Register Vendor User
    const vendorRegRes = await vendorContext.post("/api/auth/register", {
      data: {
        email: vendorEmail,
        password: testPassword,
        role: "VENDOR",
        name: "SunGrid Power Solutions Ltd",
      },
    });
    expect(vendorRegRes.status()).toBe(201);
    const vendorData = await vendorRegRes.json();
    expect(vendorData.success).toBe(true);
    expect(vendorData.user.role).toBe("VENDOR");

    // 4. RWA creates a new rooftop listing with initial status LIVE
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
    expect(listingData.success).toBe(true);
    expect(listingData.listing).toBeDefined();

    const listingId = listingData.listing.id;
    const initialStatus = listingData.listing.status;

    // Verify initial state is LIVE
    expect(["LIVE", "ACTIVE"]).toContain(initialStatus);

    // 5. Vendor views active listings and finds the new listing
    const vendorListingsRes = await vendorContext.get("/api/listings");
    expect(vendorListingsRes.status()).toBe(200);
    const vendorListingsData = await vendorListingsRes.json();
    const foundListing = vendorListingsData.listings.find(
      (l: any) => l.id === listingId
    );
    expect(foundListing).toBeDefined();
    expect(["LIVE", "ACTIVE"]).toContain(foundListing.status);

    // 6. Vendor submits a blind bid on the listing
    const bidPayload = {
      listingId,
      amount: 3.25, // Quoted tariff: ₹3.25/kWh
      kwp: 95.0,    // 95 kWp system
      status: "PENDING",
    };

    const submitBidRes = await vendorContext.post("/api/bids", {
      data: bidPayload,
    });
    expect(submitBidRes.status()).toBe(201);
    const bidData = await submitBidRes.json();
    expect(bidData.success).toBe(true);
    expect(bidData.bid).toBeDefined();

    const bidId = bidData.bid.id;
    expect(bidData.bid.status).toBe("PENDING");
    expect(bidData.bid.amount).toBe(3.25);
    expect(bidData.bid.kwp).toBe(95.0);

    // 7. RWA queries bids for their listing
    const rwaBidsRes = await rwaContext.get(`/api/bids?listingId=${listingId}`);
    expect(rwaBidsRes.status()).toBe(200);
    const rwaBidsData = await rwaBidsRes.json();
    expect(rwaBidsData.success).toBe(true);
    expect(rwaBidsData.bids.length).toBeGreaterThanOrEqual(1);

    const receivedBid = rwaBidsData.bids.find((b: any) => b.id === bidId);
    expect(receivedBid).toBeDefined();
    expect(receivedBid.status).toBe("PENDING");

    // 8. RWA accepts the bid (state transitions from Live to Contracted)
    const acceptBidRes = await rwaContext.patch("/api/bids", {
      data: {
        bidId,
        action: "ACCEPT",
      },
    });
    expect(acceptBidRes.status()).toBe(200);
    const acceptData = await acceptBidRes.json();
    expect(acceptData.success).toBe(true);

    // Assert Bid state transitioned to ACCEPTED
    expect(acceptData.bid.status).toBe("ACCEPTED");

    // Assert Listing state transitioned to CONTRACTED
    expect(acceptData.listing.status).toBe("CONTRACTED");

    // 9. Verify state transition persisted in the database
    // Query listing directly
    const verifyListingRes = await rwaContext.get(`/api/listings/${listingId}`);
    expect(verifyListingRes.status()).toBe(200);
    const verifyListingData = await verifyListingRes.json();
    expect(verifyListingData.listing.status).toBe("CONTRACTED");

    // Query bid directly
    const verifyBidRes = await rwaContext.get(`/api/bids?id=${bidId}`);
    expect(verifyBidRes.status()).toBe(200);
    const verifyBidData = await verifyBidRes.json();
    expect(verifyBidData.bid.status).toBe("ACCEPTED");
    expect(verifyBidData.bid.listing.status).toBe("CONTRACTED");

    // 10. Verify that the contracted listing is now removed from the active open/live bidding pool
    const activeListingsRes = await vendorContext.get("/api/listings");
    expect(activeListingsRes.status()).toBe(200);
    const activeListingsData = await activeListingsRes.json();
    const isStillActive = activeListingsData.listings.some(
      (l: any) => l.id === listingId && l.status === "LIVE"
    );
    expect(isStillActive).toBe(false);

    // Cleanup contexts
    await rwaContext.dispose();
    await vendorContext.dispose();
  });
});
