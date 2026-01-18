// ========================================
// app/api/orders/[orderId]/route.ts - Single Order API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, orderStatusHistory, vendors, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

// GET /api/orders/[orderId] - Get a single order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { orderId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the order
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (order.length === 0) {
      return errorResponse("Order not found", 404);
    }

    // Check authorization
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");
    const isOwner = order[0].userId === userId;

    // Check if vendor has access (has items in this order)
    let isVendorWithAccess = false;
    if (userRole === "vendor") {
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId!))
        .limit(1);

      if (vendor.length > 0) {
        const vendorItems = await db
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, orderId),
              eq(orderItems.vendorId, vendor[0].vendorId)
            )
          )
          .limit(1);

        isVendorWithAccess = vendorItems.length > 0;
      }
    }

    if (!isAdmin && !isOwner && !isVendorWithAccess) {
      return errorResponse("You don't have permission to view this order", 403);
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Get order status history
    const statusHistory = await db
      .select({
        history: orderStatusHistory,
        changedByUser: {
          id: user.id,
          name: user.name,
        },
      })
      .from(orderStatusHistory)
      .leftJoin(user, eq(orderStatusHistory.changedBy, user.id))
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.createdAt));

    // Get customer info (only for admins and vendors)
    let customer = null;
    if (isAdmin || isVendorWithAccess) {
      const customerData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        })
        .from(user)
        .where(eq(user.id, order[0].userId))
        .limit(1);

      customer = customerData[0] || null;
    }

    return successResponse({
      ...order[0],
      items,
      statusHistory: statusHistory.map((h) => ({
        ...h.history,
        changedBy: h.changedByUser,
      })),
      customer,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return errorResponse("Failed to fetch order", 500);
  }
}

// PUT /api/orders/[orderId] - Update order status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { orderId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the order
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return errorResponse("Order not found", 404);
    }

    const body = await request.json();
    const { status, paymentStatus, trackingNumber, trackingUrl, note } = body;

    // Check authorization
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");
    const isOwner = existingOrder[0].userId === userId;

    // Check if vendor has access
    let isVendorWithAccess = false;
    if (userRole === "vendor") {
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId!))
        .limit(1);

      if (vendor.length > 0) {
        const vendorItems = await db
          .select()
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, orderId),
              eq(orderItems.vendorId, vendor[0].vendorId)
            )
          )
          .limit(1);

        isVendorWithAccess = vendorItems.length > 0;
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Status updates
    if (status) {
      // Validate status transitions
      const currentStatus = existingOrder[0].status;
      const validTransitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["processing", "cancelled"],
        processing: ["shipped", "cancelled"],
        shipped: ["out_for_delivery", "delivered"],
        out_for_delivery: ["delivered"],
        delivered: ["returned"],
        cancelled: [],
        returned: ["refunded"],
        refunded: [],
      };

      // Customers can only cancel pending orders
      if (isOwner && !isAdmin && !isVendorWithAccess) {
        if (status !== "cancelled" || currentStatus !== "pending") {
          return errorResponse("You can only cancel pending orders", 403);
        }
      }

      // Vendors can update to processing, shipped, out_for_delivery, delivered
      if (isVendorWithAccess && !isAdmin) {
        const vendorAllowedStatuses = ["processing", "shipped", "out_for_delivery", "delivered"];
        if (!vendorAllowedStatuses.includes(status)) {
          return errorResponse("You don't have permission to set this status", 403);
        }
      }

      if (!validTransitions[currentStatus]?.includes(status)) {
        return errorResponse(`Cannot transition from ${currentStatus} to ${status}`, 400);
      }

      updateData.status = status;

      // Update timestamps based on status
      if (status === "confirmed") {
        updateData.confirmedAt = new Date();
      } else if (status === "shipped") {
        updateData.shippedAt = new Date();
      } else if (status === "delivered") {
        updateData.deliveredAt = new Date();
        // Update payment status for COD orders
        if (existingOrder[0].paymentMethod === "cash_on_delivery") {
          updateData.paymentStatus = "paid";
          updateData.paidAt = new Date();
        }
      } else if (status === "cancelled") {
        updateData.cancelledAt = new Date();
        updateData.cancelledBy = userId;
      }

      // Create status history
      await db.insert(orderStatusHistory).values({
        orderId,
        fromStatus: currentStatus,
        toStatus: status,
        note,
        changedBy: userId,
      });
    }

    // Payment status updates (admin only)
    if (paymentStatus && isAdmin) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updateData.paidAt = new Date();
      }
    }

    // Tracking info (admin and vendor)
    if (trackingNumber !== undefined && (isAdmin || isVendorWithAccess)) {
      updateData.trackingNumber = trackingNumber;
    }
    if (trackingUrl !== undefined && (isAdmin || isVendorWithAccess)) {
      updateData.trackingUrl = trackingUrl;
    }

    const updatedOrder = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.orderId, orderId))
      .returning();

    return successResponse(updatedOrder[0], "Order updated successfully");
  } catch (error) {
    console.error("Error updating order:", error);
    return errorResponse("Failed to update order", 500);
  }
}
