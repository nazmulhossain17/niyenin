// ========================================
// File: app/api/admin/customers/route.ts
// Admin Customers Management API
// GET: List all customers with filters
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user, orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, or, ilike, desc, asc, sql, count, isNull, isNotNull } from "drizzle-orm";

// Role type from schema
type UserRole = "super_admin" | "admin" | "moderator" | "vendor" | "customer";

// Helper to check admin access
const isAdmin = (role: string) => role === "admin" || role === "super_admin";

// ============================================
// GET - Admin only: List all customers
// ============================================
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || ""; // customer, vendor, admin, etc.
    const status = searchParams.get("status") || ""; // active, banned, all
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where conditions
    const conditions = [];

    // Search by name or email
    if (search) {
      conditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        )
      );
    }

    // Filter by role
    if (role && role !== "all") {
      const validRoles: UserRole[] = ["super_admin", "admin", "moderator", "vendor", "customer"];
      if (validRoles.includes(role as UserRole)) {
        conditions.push(eq(user.role, role as UserRole));
      }
    }

    // Filter by banned status (using bannedAt field)
    if (status === "active") {
      conditions.push(isNull(user.bannedAt));
    } else if (status === "banned") {
      conditions.push(isNotNull(user.bannedAt));
    }

    // Get total count for pagination
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(user)
      .where(whereClause);

    const total = totalResult?.count || 0;

    // Build order by
    let orderByClause;
    const direction = sortOrder === "asc" ? asc : desc;

    switch (sortBy) {
      case "name":
        orderByClause = direction(user.name);
        break;
      case "email":
        orderByClause = direction(user.email);
        break;
      case "role":
        orderByClause = direction(user.role);
        break;
      default:
        orderByClause = direction(user.createdAt);
    }

    // Get customers
    const customers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        bannedAt: user.bannedAt,
        banReason: user.banReason,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get order stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        // Get order count and total spent
        const [orderStats] = await db
          .select({
            orderCount: count(),
            totalSpent: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          })
          .from(orders)
          .where(eq(orders.userId, customer.id));

        return {
          ...customer,
          banned: !!customer.bannedAt, // Convert bannedAt to boolean
          orderCount: orderStats?.orderCount || 0,
          totalSpent: parseFloat(orderStats?.totalSpent || "0"),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: customersWithStats,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}