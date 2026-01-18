// ========================================
// app/api/support/[ticketId]/route.ts - Single Support Ticket API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { supportTickets, ticketMessages, user, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ ticketId: string }>;
}

// GET /api/support/[ticketId] - Get a single ticket with messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { ticketId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the ticket
    const ticket = await db
      .select({
        ticket: supportTickets,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(supportTickets)
      .leftJoin(user, eq(supportTickets.userId, user.id))
      .where(eq(supportTickets.ticketId, ticketId))
      .limit(1);

    if (ticket.length === 0) {
      return errorResponse("Ticket not found", 404);
    }

    // Check authorization
    const isAdmin = ["super_admin", "admin", "moderator"].includes(userRole || "");
    const isOwner = ticket[0].ticket.userId === userId;

    if (!isAdmin && !isOwner) {
      return errorResponse("You don't have permission to view this ticket", 403);
    }

    // Get ticket messages
    const messages = await db
      .select({
        message: ticketMessages,
        sender: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(ticketMessages)
      .leftJoin(user, eq(ticketMessages.senderId, user.id))
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(desc(ticketMessages.createdAt));

    // Get order details if linked
    let order = null;
    if (ticket[0].ticket.orderId) {
      const orderData = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, ticket[0].ticket.orderId))
        .limit(1);
      order = orderData[0] || null;
    }

    return successResponse({
      ...ticket[0].ticket,
      user: isAdmin ? ticket[0].user : undefined,
      messages: messages.map((m) => ({
        ...m.message,
        sender: m.sender,
      })),
      order,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return errorResponse("Failed to fetch ticket", 500);
  }
}

// PUT /api/support/[ticketId] - Update ticket status or add message
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { ticketId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the ticket
    const existingTicket = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.ticketId, ticketId))
      .limit(1);

    if (existingTicket.length === 0) {
      return errorResponse("Ticket not found", 404);
    }

    // Check authorization
    const isAdmin = ["super_admin", "admin", "moderator"].includes(userRole || "");
    const isOwner = existingTicket[0].userId === userId;

    if (!isAdmin && !isOwner) {
      return errorResponse("You don't have permission to update this ticket", 403);
    }

    const body = await request.json();
    const { status, priority, assignedTo, message, attachments = [], isInternal = false } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Status updates
    if (status && isAdmin) {
      updateData.status = status;

      if (status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = userId;
      } else if (status === "closed") {
        updateData.closedAt = new Date();
      }
    }

    // Customers can only close their own tickets
    if (status === "closed" && isOwner && !isAdmin) {
      updateData.status = "closed";
      updateData.closedAt = new Date();
    }

    // Priority updates (admin only)
    if (priority && isAdmin) {
      updateData.priority = priority;
    }

    // Assignment (admin only)
    if (assignedTo !== undefined && isAdmin) {
      updateData.assignedTo = assignedTo;
    }

    // Update ticket
    const updatedTicket = await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.ticketId, ticketId))
      .returning();

    // Add message if provided
    if (message) {
      await db.insert(ticketMessages).values({
        ticketId,
        senderId: userId!,
        senderType: isAdmin ? "admin" : "customer",
        message,
        attachments,
        isInternal: isAdmin ? isInternal : false,
      });

      // Update ticket status based on who replied
      if (!status) {
        const newStatus = isAdmin ? "waiting_customer" : "waiting_admin";
        await db
          .update(supportTickets)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(supportTickets.ticketId, ticketId));
      }
    }

    return successResponse(updatedTicket[0], "Ticket updated successfully");
  } catch (error) {
    console.error("Error updating ticket:", error);
    return errorResponse("Failed to update ticket", 500);
  }
}
