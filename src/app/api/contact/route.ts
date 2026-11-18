import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, societyOrCompany, inquiryType, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // In a production setup, this would be queued via email/CRM or saved to DB.
    // For our clean serverless implementation, we validate and return a confirmed receipt reference.
    const inquiryRef = `INQ-${Date.now().toString().slice(-6)}`;

    console.log(`[Contact Inquiry Received] Ref: ${inquiryRef}, From: ${name} (${email}), Type: ${inquiryType}`);

    return NextResponse.json({
      success: true,
      inquiryRef,
      message: "Your inquiry has been received. Our solar desk will contact you within 24 business hours.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process inquiry", details: error.message },
      { status: 500 }
    );
  }
}
