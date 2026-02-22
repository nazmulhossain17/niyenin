// ========================================
// File: app/api/admin/customers/[userId]/route.ts
// Admin Single Customer Management API
// GET: Get customer details
// PATCH: Update customer (role, ban/unban)
// DELETE: Delete customer
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user, orders, reviews } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, count, sql, isNull } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ userId: string }>;
};

// Role type from schema
type UserRole = "super_admin" | "admin" | "moderator" | "vendor" | "customer";

// Helper to check admin access
const isAdmin = (role: string) => role === "admin" || role === "super_admin";

// ============================================
// GET - Admin only: Get customer details
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get customer
    const [customer] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get order stats
    const [orderStats] = await db
      .select({
        orderCount: count(),
        totalSpent: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    // Get review count
    let reviewCount = 0;
    try {
      const [reviewStats] = await db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, userId));
      reviewCount = reviewStats?.count || 0;
    } catch {
      // Reviews table might not exist
    }

    // Get recent orders
    const recentOrders = await db
      .select({
        orderId: orders.orderId,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        banned: !!customer.bannedAt, // Convert bannedAt to boolean
        stats: {
          orderCount: orderStats?.orderCount || 0,
          totalSpent: parseFloat(orderStats?.totalSpent || "0"),
          reviewCount,
          addressCount: 0, // Address table may not exist
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Admin only: Update customer
// ============================================
const updateCustomerSchema = z.object({
  role: z.enum(["super_admin", "admin", "moderator", "vendor", "customer"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(500).optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Prevent self-modification of critical fields
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot modify your own account through this endpoint" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    // Check if customer exists
    const [existingCustomer] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }

    if (validatedData.banned !== undefined) {
      if (validatedData.banned) {
        // Ban the user
        updateData.bannedAt = new Date();
        updateData.banReason = validatedData.banReason || null;
      } else {
        // Unban - clear ban fields
        updateData.bannedAt = null;
        updateData.banReason = null;
      }
    }

    // Update customer
    const [updatedCustomer] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCustomer,
        banned: !!updatedCustomer.bannedAt,
      },
      message: validatedData.banned
        ? "Customer has been banned"
        : validatedData.banned === false
        ? "Customer has been unbanned"
        : "Customer updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Admin only: Delete customer
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const [existingCustomer] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Prevent deleting other admins/super_admins
    if (existingCustomer.role === "admin" || existingCustomer.role === "super_admin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete admin accounts" },
        { status: 400 }
      );
    }

    // Delete the customer (cascades will handle related data)
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}