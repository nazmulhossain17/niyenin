// ========================================
// app/api/orders/route.ts - Orders API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import {
  orders,
  orderItems,
  orderStatusHistory,
  products,
  productVariants,
  vendors,
  carts,
  cartItems,
  coupons,
  couponUsage,
  vendorEarnings,
  userAddresses,
} from "@/db/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  getPaginationParams,
  generateOrderNumber,
} from "@/lib/api-utils";

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const vendorId = searchParams.get("vendorId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions based on user role
    const conditions = [];

    const isAdmin = ["super_admin", "admin"].includes(userRole || "");

    if (!isAdmin) {
      if (userRole === "vendor") {
        // Vendors see orders containing their products
        // This requires a subquery approach
        const vendor = await db
          .select()
          .from(vendors)
          .where(eq(vendors.userId, userId!))
          .limit(1);

        if (vendor.length > 0 && vendorId !== vendor[0].vendorId) {
          // If vendor is trying to access other vendor's orders
          return errorResponse("Forbidden", 403);
        }
      } else {
        // Customers see only their own orders
        conditions.push(eq(orders.userId, userId!));
      }
    }

    if (status) {
      conditions.push(eq(orders.status, status as "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned" | "refunded"));
    }

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus as "pending" | "processing" | "paid" | "failed" | "refunded" | "partially_refunded"));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get orders with sorting
    let orderByColumn;
    switch (sortBy) {
      case "orderNumber":
        orderByColumn = orders.orderNumber;
        break;
      case "totalAmount":
        orderByColumn = orders.totalAmount;
        break;
      case "status":
        orderByColumn = orders.status;
        break;
      default:
        orderByColumn = orders.createdAt;
    }

    const orderDirection = sortOrder === "asc" ? asc : desc;

    const result = await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Get order items for each order
    const orderIds = result.map((o) => o.orderId);
    const items = orderIds.length > 0
      ? await db
          .select()
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
      : [];

    // Group items by order
    const itemsByOrder = items.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return successResponse({
      orders: result.map((order) => ({
        ...order,
        items: itemsByOrder[order.orderId] || [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

// POST /api/orders - Create a new order (Checkout)
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
      shippingAddressId,
      shippingFullName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingDistrict,
      shippingPostalCode,
      billingAddress,
      paymentMethod,
      couponCode,
      customerNote,
    } = body;

    // Validate required fields
    if (!paymentMethod) {
      return errorResponse("Payment method is required");
    }

    // Get shipping address
    let shippingInfo = {
      fullName: shippingFullName,
      phone: shippingPhone,
      address: shippingAddress,
      city: shippingCity,
      district: shippingDistrict,
      postalCode: shippingPostalCode,
    };

    if (shippingAddressId) {
      const address = await db
        .select()
        .from(userAddresses)
        .where(
          and(
            eq(userAddresses.addressId, shippingAddressId),
            eq(userAddresses.userId, userId)
          )
        )
        .limit(1);

      if (address.length > 0) {
        shippingInfo = {
          fullName: address[0].fullName,
          phone: address[0].phone,
          address: address[0].addressLine1 + (address[0].addressLine2 ? `, ${address[0].addressLine2}` : ""),
          city: address[0].city,
          district: address[0].district,
          postalCode: address[0].postalCode || "",
        };
      }
    }

    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.district) {
      return errorResponse("Complete shipping address is required");
    }

    // Get user's cart
    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (cart.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    // Get cart items with product details
    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
        variant: productVariants,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.productId))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.variantId))
      .where(eq(cartItems.cartId, cart[0].cartId));

    // Filter valid items
    const validItems = items.filter(
      (item) =>
        item.product &&
        item.product.isActive &&
        item.product.status === "approved"
    );

    if (validItems.length === 0) {
      return errorResponse("No valid items in cart", 400);
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of validItems) {
      const price = item.variant?.price || item.product?.salePrice || item.product?.originalPrice || "0";
      const itemSubtotal = Number(price) * item.cartItem.quantity;
      subtotal += itemSubtotal;

      // Get vendor info
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.vendorId, item.product!.vendorId))
        .limit(1);

      const commissionRate = Number(vendor[0]?.commissionRate || 10);
      const commissionAmount = (itemSubtotal * commissionRate) / 100;
      const vendorEarning = itemSubtotal - commissionAmount;

      orderItemsData.push({
        vendorId: item.product!.vendorId,
        productId: item.product!.productId,
        variantId: item.variant?.variantId || null,
        productName: item.product!.name,
        productSku: item.variant?.sku || item.product!.sku,
        productImage: item.variant?.image || item.product!.mainImage,
        variantName: item.variant?.name || null,
        unitPrice: price,
        quantity: item.cartItem.quantity,
        subtotal: itemSubtotal.toFixed(2),
        discount: "0",
        total: itemSubtotal.toFixed(2),
        commissionRate: commissionRate.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        vendorEarnings: vendorEarning.toFixed(2),
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let couponId = null;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, couponCode.toUpperCase()),
            eq(coupons.isActive, true)
          )
        )
        .limit(1);

      if (coupon.length > 0) {
        const c = coupon[0];
        const now = new Date();

        // Validate coupon
        if (now >= c.startDate && now <= c.endDate) {
          if (!c.usageLimit || c.usedCount < c.usageLimit) {
            // Check user usage limit
            const userUsage = await db
              .select({ count: sql<number>`count(*)` })
              .from(couponUsage)
              .where(
                and(
                  eq(couponUsage.couponId, c.couponId),
                  eq(couponUsage.userId, userId)
                )
              );

            if (!c.usageLimitPerUser || Number(userUsage[0]?.count || 0) < c.usageLimitPerUser) {
              // Check minimum order amount
              if (subtotal >= Number(c.minOrderAmount || 0)) {
                // Calculate discount
                if (c.discountType === "percentage") {
                  discount = (subtotal * Number(c.discountValue)) / 100;
                  if (c.maxDiscount) {
                    discount = Math.min(discount, Number(c.maxDiscount));
                  }
                } else {
                  discount = Number(c.discountValue);
                }

                couponId = c.couponId;
                appliedCouponCode = c.code;
              }
            }
          }
        }
      }
    }

    // Calculate shipping cost (simplified - you can implement zone-based shipping)
    const shippingCost = 60; // Default shipping cost in BDT

    // Calculate total
    const totalAmount = subtotal - discount + shippingCost;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const newOrder = await db
      .insert(orders)
      .values({
        userId,
        orderNumber,
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        discount: discount.toFixed(2),
        tax: "0",
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: paymentMethod as "cash_on_delivery" | "sslcommerz" | "bkash" | "nagad" | "rocket" | "stripe" | "google_pay" | "credit_card" | "debit_card",
        shippingAddressId,
        shippingFullName: shippingInfo.fullName,
        shippingPhone: shippingInfo.phone,
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingDistrict: shippingInfo.district,
        shippingPostalCode: shippingInfo.postalCode,
        billingAddress,
        couponId,
        couponCode: appliedCouponCode,
        customerNote,
      })
      .returning();

    const order = newOrder[0];

    // Create order items
    for (const itemData of orderItemsData) {
      const newOrderItem = await db
        .insert(orderItems)
        .values({
          orderId: order.orderId,
          ...itemData,
        })
        .returning();

      // Create vendor earning record
      await db.insert(vendorEarnings).values({
        vendorId: itemData.vendorId,
        orderId: order.orderId,
        orderItemId: newOrderItem[0].orderItemId,
        orderAmount: itemData.total,
        commissionRate: itemData.commissionRate,
        commissionAmount: itemData.commissionAmount,
        netEarning: itemData.vendorEarnings,
      });

      // Update product stock
      if (itemData.variantId) {
        await db
          .update(productVariants)
          .set({
            stockQuantity: sql`GREATEST(${productVariants.stockQuantity} - ${itemData.quantity}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.variantId, itemData.variantId));
      } else {
        await db
          .update(products)
          .set({
            stockQuantity: sql`GREATEST(${products.stockQuantity} - ${itemData.quantity}, 0)`,
            soldCount: sql`${products.soldCount} + ${itemData.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.productId, itemData.productId));
      }

      // Update vendor order count
      await db
        .update(vendors)
        .set({
          totalOrders: sql`${vendors.totalOrders} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(vendors.vendorId, itemData.vendorId));
    }

    // Create order status history
    await db.insert(orderStatusHistory).values({
      orderId: order.orderId,
      toStatus: "pending",
      note: "Order placed",
      changedBy: userId,
    });

    // Update coupon usage if applied
    if (couponId) {
      await db.insert(couponUsage).values({
        couponId,
        userId,
        orderId: order.orderId,
        discountAmount: discount.toFixed(2),
      });

      await db
        .update(coupons)
        .set({
          usedCount: sql`${coupons.usedCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(coupons.couponId, couponId));
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].cartId));

    return successResponse(
      {
        order,
        orderNumber: order.orderNumber,
      },
      "Order placed successfully",
      201
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order", 500);
  }
}
