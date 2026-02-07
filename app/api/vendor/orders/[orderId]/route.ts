// ========================================
// File: app/api/vendor/orders/[orderId]/route.ts
// Vendor Single Order API
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, vendors, user, userAddresses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ orderId: string }>;
};

// Valid status values for order items
type OrderItemStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

// ============================================
// GET - Get single order details for vendor
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

    // Get vendor for current user
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor account not found" },
        { status: 403 }
      );
    }

    // Check if this order contains vendor's products
    const vendorItems = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderId, orderId),
          eq(orderItems.vendorId, vendor.vendorId)
        )
      );

    if (vendorItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found or does not contain your products" },
        { status: 404 }
      );
    }

    // Get order details
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

    // Calculate vendor's portion
    const vendorSubtotal = vendorItems.reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    );

    // Map items to include totalPrice for frontend
    const mappedItems = vendorItems.map(item => ({
      ...item,
      totalPrice: item.total,
    }));

    // Get customer info
    const [customer] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, order.userId));

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
        // userAddresses might not exist
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: mappedItems,
        itemCount: vendorItems.length,
        vendorSubtotal,
        customer,
        shippingAddress,
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
// PATCH - Update order item status (vendor can update their items)
// ============================================
const updateOrderItemSchema = z.object({
  itemId: z.string().uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
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

    // Get vendor for current user
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor account not found" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateOrderItemSchema.parse(body);

    // Check if this item belongs to the vendor
    const [existingItem] = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderItemId, validatedData.itemId),
          eq(orderItems.orderId, orderId),
          eq(orderItems.vendorId, vendor.vendorId)
        )
      );

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Order item not found" },
        { status: 404 }
      );
    }

    // Update the item status
    const [updatedItem] = await db
      .update(orderItems)
      .set({
        status: validatedData.status as OrderItemStatus,
        updatedAt: new Date(),
      })
      .where(eq(orderItems.orderItemId, validatedData.itemId))
      .returning();

    // Check if all items in the order are shipped/delivered to update main order status
    const allItems = await db
      .select({ status: orderItems.status })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const allShipped = allItems.every((item) =>
      ["shipped", "delivered"].includes(item.status || "pending")
    );
    const allDelivered = allItems.every(
      (item) => item.status === "delivered"
    );

    if (allDelivered) {
      await db
        .update(orders)
        .set({ status: "delivered", deliveredAt: new Date(), updatedAt: new Date() })
        .where(eq(orders.orderId, orderId));
    } else if (allShipped) {
      await db
        .update(orders)
        .set({ status: "shipped", updatedAt: new Date() })
        .where(eq(orders.orderId, orderId));
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Order item status updated",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order item" },
      { status: 500 }
    );
  }
}