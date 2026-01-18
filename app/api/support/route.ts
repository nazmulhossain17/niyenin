// ========================================
// app/api/support/route.ts - Support Tickets API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { supportTickets, ticketMessages, user, orders } from "@/db/schema";
import { eq, and, desc, asc, sql, or, ilike } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  getPaginationParams,
  generateTicketNumber,
} from "@/lib/api-utils";

// GET /api/support - Get support tickets
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions based on user role
    const conditions = [];

    const isAdmin = ["super_admin", "admin", "moderator"].includes(userRole || "");

    if (!isAdmin) {
      // Customers can only see their own tickets
      conditions.push(eq(supportTickets.userId, userId!));
    }

    if (status) {
      conditions.push(eq(supportTickets.status, status as "open" | "in_progress" | "waiting_customer" | "waiting_admin" | "escalated" | "resolved" | "closed"));
    }

    if (priority) {
      conditions.push(eq(supportTickets.priority, priority as "low" | "medium" | "high" | "urgent"));
    }

    if (category) {
      conditions.push(eq(supportTickets.category, category as "general" | "order" | "payment" | "shipping" | "return" | "refund" | "product" | "vendor" | "technical" | "other"));
    }

    if (search) {
      conditions.push(
        or(
          ilike(supportTickets.ticketNumber, `%${search}%`),
          ilike(supportTickets.subject, `%${search}%`)
        )
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get tickets with sorting
    let orderByColumn;
    switch (sortBy) {
      case "ticketNumber":
        orderByColumn = supportTickets.ticketNumber;
        break;
      case "priority":
        orderByColumn = supportTickets.priority;
        break;
      case "status":
        orderByColumn = supportTickets.status;
        break;
      case "updatedAt":
        orderByColumn = supportTickets.updatedAt;
        break;
      default:
        orderByColumn = supportTickets.createdAt;
    }

    const orderDirection = sortOrder === "asc" ? asc : desc;

    const result = await db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return successResponse({
      tickets: result.map((r) => ({
        ...r.ticket,
        user: isAdmin ? r.user : undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return errorResponse("Failed to fetch tickets", 500);
  }
}

// POST /api/support - Create a support ticket
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse("User ID not found", 401);
    }

    const body = await request.json();
    const {
      subject,
      category = "general",
      priority = "medium",
      orderId,
      message,
      attachments = [],
    } = body;

    if (!subject || !message) {
      return errorResponse("Subject and message are required");
    }

    // Validate order if provided
    if (orderId) {
      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.orderId, orderId), eq(orders.userId, userId)))
        .limit(1);

      if (order.length === 0) {
        return errorResponse("Order not found", 404);
      }
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const newTicket = await db
      .insert(supportTickets)
      .values({
        userId,
        ticketNumber,
        subject,
        category: category as "general" | "order" | "payment" | "shipping" | "return" | "refund" | "product" | "vendor" | "technical" | "other",
        priority: priority as "low" | "medium" | "high" | "urgent",
        orderId,
        status: "open",
      })
      .returning();

    // Create initial message
    await db.insert(ticketMessages).values({
      ticketId: newTicket[0].ticketId,
      senderId: userId,
      senderType: "customer",
      message,
      attachments,
    });

    return successResponse(newTicket[0], "Support ticket created successfully", 201);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return errorResponse("Failed to create ticket", 500);
  }
}
