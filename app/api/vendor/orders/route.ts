// ========================================
// File: app/api/vendor/orders/route.ts
// Vendor Orders API - List vendor's orders
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, products, vendors, user, userAddresses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, sql, count, inArray, ilike } from "drizzle-orm";

// ============================================
// GET - List orders containing vendor's products
// ============================================
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    // Get all order IDs that contain this vendor's products
    const vendorOrderItems = await db
      .selectDistinct({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.vendorId, vendor.vendorId));

    const orderIds = vendorOrderItems.map((item) => item.orderId);

    if (orderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }

    // Build where conditions
    const conditions = [inArray(orders.orderId, orderIds)];

    if (status && status !== "all") {
      conditions.push(eq(orders.status, status as any));
    }

    if (search) {
      // Search by order number only for simplicity
      conditions.push(ilike(orders.orderNumber, `%${search}%`));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions));

    const total = totalResult?.count || 0;

    // Get orders
    const vendorOrders = await db
      .select({
        orderId: orders.orderId,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        subtotal: orders.subtotal,
        shippingCost: orders.shippingCost,
        discount: orders.discount,
        totalAmount: orders.totalAmount,
        customerNote: orders.customerNote,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        shippingAddressId: orders.shippingAddressId,
      })
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get items, customer info, and shipping address for each order
    const ordersWithDetails = await Promise.all(
      vendorOrders.map(async (order) => {
        // Get only this vendor's items from the order
        const items = await db
          .select({
            orderItemId: orderItems.orderItemId,
            productId: orderItems.productId,
            productName: orderItems.productName,
            productImage: orderItems.productImage,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            total: orderItems.total,
            status: orderItems.status,
          })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, order.orderId),
              eq(orderItems.vendorId, vendor.vendorId)
            )
          );

        // Calculate vendor's portion of the order
        const vendorSubtotal = items.reduce(
          (sum, item) => sum + parseFloat(item.total),
          0
        );

        // Map items to include totalPrice for frontend
        const mappedItems = items.map(item => ({
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
              .select({
                fullName: userAddresses.fullName,
                phone: userAddresses.phone,
                addressLine1: userAddresses.addressLine1,
                addressLine2: userAddresses.addressLine2,
                city: userAddresses.city,
                district: userAddresses.district,
                postalCode: userAddresses.postalCode,
              })
              .from(userAddresses)
              .where(eq(userAddresses.addressId, order.shippingAddressId));
            shippingAddress = address || null;
          } catch {
            // userAddresses might have different column names
          }
        }

        return {
          ...order,
          items: mappedItems,
          itemCount: items.length,
          vendorSubtotal,
          customer,
          shippingAddress,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithDetails,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}