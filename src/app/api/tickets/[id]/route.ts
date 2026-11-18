import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        vendor: { select: { id: true, name: true, email: true, role: true } },
        listing: { select: { id: true, societyName: true, society: true, location: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("GET /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch ticket", details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, priority, message, action } = body;

    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    if (action === "REOPEN") {
      updateData.status = "Open";
    } else if (action === "RESOLVE") {
      updateData.status = "Resolved";
    } else if (action === "CLOSE") {
      updateData.status = "Closed";
    }

    // Append reply message
    if (message && typeof message === "string" && message.trim()) {
      const existingMessages = Array.isArray(existing.messages)
        ? (existing.messages as any[])
        : [];

      const newMsg = {
        id: `msg-${Date.now()}`,
        text: message.trim(),
        sender: authUser.name || authUser.email,
        senderRole: authUser.role,
        createdAt: new Date().toISOString(),
      };

      updateData.messages = [...existingMessages, newMsg];
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        vendor: { select: { id: true, name: true, email: true, role: true } },
        listing: { select: { id: true, societyName: true, society: true } },
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to update ticket", details: error.message }, { status: 500 });
  }
}
