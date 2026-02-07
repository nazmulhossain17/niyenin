// ========================================
// File: app/api/orders/[orderId]/route.ts
// Single Order API - Get and Update Order
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, products, userAddresses, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ orderId: string }>;
};

// Helper to check admin access
const isAdmin = (role: string) => role === "admin" || role === "super_admin";

// ============================================
// GET - Get single order details
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId));

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization - user can only see their own orders (unless admin)
    if (order.userId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Not authorized to view this order" },
        { status: 403 }
      );
    }

    // Get order items
    const items = await db
      .select({
        orderItemId: orderItems.orderItemId,
        productId: orderItems.productId,
        vendorId: orderItems.vendorId,
        productName: orderItems.productName,
        productImage: orderItems.productImage,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        total: orderItems.total,
        status: orderItems.status,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Map items to include totalPrice for frontend
    const mappedItems = items.map(item => ({
      ...item,
      totalPrice: item.total,
    }));

    // Get shipping address
    let shippingAddress = null;
    if (order.shippingAddressId) {
      try {
        const [address] = await db
          .select()
          .from(userAddresses)
          .where(eq(userAddresses.addressId, order.shippingAddressId));
        shippingAddress = address || null;
      } catch {
        // userAddresses might not exist, try alternative
      }
    }

    // Get customer info (for admin)
    let customer = null;
    if (isAdmin(session.user.role)) {
      const [customerData] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, order.userId));
      customer = customerData || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: mappedItems,
        shippingAddress,
        customer,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Update order (admin/vendor only)
// ============================================
const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  internalNote: z.string().max(1000).optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admin can update orders through this endpoint
    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    // Check if order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId));

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;

      // Set delivered/cancelled timestamps
      if (validatedData.status === "delivered") {
        updateData.deliveredAt = new Date();
      } else if (validatedData.status === "cancelled") {
        updateData.cancelledAt = new Date();
      }
    }

    if (validatedData.paymentStatus) {
      updateData.paymentStatus = validatedData.paymentStatus;
      if (validatedData.paymentStatus === "paid") {
        updateData.paidAt = new Date();
      }
    }

    if (validatedData.internalNote !== undefined) {
      updateData.internalNote = validatedData.internalNote;
    }

    // Update order
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.orderId, orderId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}