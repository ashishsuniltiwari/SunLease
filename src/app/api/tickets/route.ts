import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tickets - Fetch tickets with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const listingId = searchParams.get("listingId");
    const userId = searchParams.get("userId");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (listingId) where.listingId = listingId;
    if (userId) where.userId = userId;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        listing: { select: { id: true, societyName: true, society: true } },
      },
    });

    return NextResponse.json({ success: true, count: tickets.length, tickets });
  } catch (error: any) {
    console.error("Tickets GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket (open)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      unit,
      priority = "Medium",
      status = "Open",
      description,
      userId,
      listingId,
      message,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const initialMessages: any[] = [];
    if (message) {
      initialMessages.push({
        id: "msg-1",
        text: message,
        sender: "User",
        createdAt: new Date().toISOString(),
      });
    } else if (description) {
      initialMessages.push({
        id: "msg-1",
        text: description,
        sender: "Reporter",
        createdAt: new Date().toISOString(),
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        unit: unit?.trim() || "SMA Sunny Tripower unit #01",
        priority: priority || "Medium",
        status: status || "Open",
        description: description?.trim() || null,
        messages: initialMessages,
        userId: userId || null,
        listingId: listingId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, societyName: true } },
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Tickets POST error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets - Update ticket status, priority, or add messages
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority, title, unit, description, message, sender } = body;

    if (!id) {
      return NextResponse.json({ error: "Ticket id is required" }, { status: 400 });
    }

    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (title) updateData.title = title.trim();
    if (unit) updateData.unit = unit.trim();
    if (description !== undefined) updateData.description = description;

    // Add message if provided
    if (message) {
      const existingMessages = Array.isArray(existingTicket.messages)
        ? (existingTicket.messages as any[])
        : [];

      const newMsg = {
        id: `msg-${Date.now()}`,
        text: message,
        sender: sender || "System",
        createdAt: new Date().toISOString(),
      };

      updateData.messages = [...existingMessages, newMsg];
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.error("Tickets PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets - Delete ticket
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ticket id is required" }, { status: 400 });
    }

    await prisma.ticket.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error: any) {
    console.error("Tickets DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket", details: error.message },
      { status: 500 }
    );
  }
}
