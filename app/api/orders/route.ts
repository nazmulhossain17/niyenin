// ========================================
// File: app/api/orders/route.ts
// Orders API - Create and List Orders
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, products, vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { z } from "zod";

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// ============================================
// GET - List orders for authenticated user
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(orders.userId, session.user.id)];
    if (status && status !== "all") {
      conditions.push(eq(orders.status, status as any));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...conditions));

    const total = totalResult?.count || 0;

    // Get orders with items
    const userOrders = await db
      .select({
        orderId: orders.orderId,
        orderNumber: orders.orderNumber,
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
      })
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            orderItemId: orderItems.orderItemId,
            productId: orderItems.productId,
            productName: orderItems.productName,
            productImage: orderItems.productImage,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            total: orderItems.total,
            vendorId: orderItems.vendorId,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.orderId));

        return { 
          ...order, 
          items: items.map(item => ({
            ...item,
            totalPrice: item.total, // Map for frontend compatibility
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create new order
// ============================================
const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  paymentMethod: z.enum([
    "cash_on_delivery",
    "bkash",
    "nagad",
    "rocket",
    "sslcommerz",
  ]),
  couponCode: z.string().optional().nullable(),
  customerNote: z.string().max(500).optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional().nullable(),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Fetch product details and validate stock
    const productIds = validatedData.items.map((item) => item.productId);
    const productDetails = await db
      .select({
        productId: products.productId,
        vendorId: products.vendorId,
        name: products.name,
        mainImage: products.mainImage,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        stockQuantity: products.stockQuantity,
        status: products.status,
        isActive: products.isActive,
      })
      .from(products)
      .where(inArray(products.productId, productIds));

    // Get vendor commission rates
    const vendorIds = [...new Set(productDetails.map(p => p.vendorId))];
    const vendorData = await db
      .select({
        vendorId: vendors.vendorId,
        commissionRate: vendors.commissionRate,
      })
      .from(vendors)
      .where(inArray(vendors.vendorId, vendorIds));
    
    const vendorCommissionMap = new Map(
      vendorData.map(v => [v.vendorId, parseFloat(v.commissionRate || "10")])
    );

    // Validate all products exist and are available
    const productMap = new Map(productDetails.map((p) => [p.productId, p]));
    const orderItemsData: Array<{
      productId: string;
      vendorId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      unitPrice: string;
      subtotal: string;
      commissionRate: string;
      commissionAmount: string;
      vendorEarnings: string;
      total: string;
    }> = [];

    let subtotal = 0;

    for (const item of validatedData.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.isActive || product.status !== "approved") {
        return NextResponse.json(
          { success: false, error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
          },
          { status: 400 }
        );
      }

      const unitPrice = product.salePrice
        ? parseFloat(product.salePrice)
        : parseFloat(product.originalPrice);
      const itemSubtotal = unitPrice * item.quantity;
      const commissionRate = vendorCommissionMap.get(product.vendorId) || 10;
      const commissionAmount = (itemSubtotal * commissionRate) / 100;
      const vendorEarnings = itemSubtotal - commissionAmount;

      orderItemsData.push({
        productId: item.productId,
        vendorId: product.vendorId,
        productName: product.name,
        productImage: product.mainImage,
        quantity: item.quantity,
        unitPrice: unitPrice.toString(),
        subtotal: itemSubtotal.toString(),
        commissionRate: commissionRate.toString(),
        commissionAmount: commissionAmount.toString(),
        vendorEarnings: vendorEarnings.toString(),
        total: itemSubtotal.toString(),
      });

      subtotal += itemSubtotal;
    }

    // Calculate shipping (default to 120 for now)
    const shippingCost = subtotal >= 5000 ? 0 : 120;

    // Calculate discount from coupon (simplified - would need coupon validation)
    let discount = 0;
    // TODO: Implement coupon validation

    const totalAmount = subtotal - discount + shippingCost;

    // Fetch shipping address details
    let shippingAddressData = null;
    try {
      const { userAddresses } = await import("@/db/schema");
      const [address] = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.addressId, validatedData.shippingAddressId));
      shippingAddressData = address;
    } catch {
      // Try alternative table name
    }

    if (!shippingAddressData) {
      return NextResponse.json(
        { success: false, error: "Shipping address not found" },
        { status: 400 }
      );
    }

    // Create order with embedded shipping address
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        orderNumber: generateOrderNumber(),
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: validatedData.paymentMethod,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        discount: discount.toString(),
        totalAmount: totalAmount.toString(),
        // Shipping address fields (embedded in order)
        shippingAddress: shippingAddressData.addressLine1 + (shippingAddressData.addressLine2 ? `, ${shippingAddressData.addressLine2}` : ""),
        shippingFullName: shippingAddressData.fullName,
        shippingPhone: shippingAddressData.phone,
        shippingCity: shippingAddressData.city,
        shippingDistrict: shippingAddressData.district,
        shippingPostalCode: shippingAddressData.postalCode || null,
        customerNote: validatedData.customerNote || null,
        couponCode: validatedData.couponCode || null,
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        orderId: newOrder.orderId,
        productId: item.productId,
        vendorId: item.vendorId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        commissionRate: item.commissionRate,
        commissionAmount: item.commissionAmount,
        vendorEarnings: item.vendorEarnings,
        total: item.total,
      }))
    );

    // Update product stock
    for (const item of validatedData.items) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
          soldCount: sql`${products.soldCount} + ${item.quantity}`,
        })
        .where(eq(products.productId, item.productId));
    }

    // For online payment methods, would return payment URL
    let paymentUrl = null;
    if (validatedData.paymentMethod !== "cash_on_delivery") {
      // TODO: Integrate with payment gateway
      // paymentUrl = await initiatePayment(newOrder.orderId, totalAmount);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: newOrder.orderId,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
      },
      paymentUrl,
      message: "Order placed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid order data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}