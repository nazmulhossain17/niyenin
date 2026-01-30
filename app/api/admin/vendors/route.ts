// ========================================
// app/api/admin/vendors/route.ts
// Admin Vendors API - Manage all vendors
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// GET /api/admin/vendors - List all vendors with filters (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!await isAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const verified = searchParams.get("verified");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where conditions
    const conditions = [];

    if (status && ["pending", "approved", "rejected", "suspended"].includes(status)) {
      conditions.push(eq(vendors.status, status as any));
    }

    if (featured === "true") {
      conditions.push(eq(vendors.isFeatured, true));
    } else if (featured === "false") {
      conditions.push(eq(vendors.isFeatured, false));
    }

    if (verified === "true") {
      conditions.push(eq(vendors.isVerified, true));
    } else if (verified === "false") {
      conditions.push(eq(vendors.isVerified, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(vendors.shopName, `%${search}%`),
          ilike(vendors.businessName, `%${search}%`),
          ilike(vendors.businessEmail, `%${search}%`)
        )!
      );
    }

    // Build order by
    const orderByColumn = {
      createdAt: vendors.createdAt,
      shopName: vendors.shopName,
      status: vendors.status,
      totalProducts: vendors.totalProducts,
      totalOrders: vendors.totalOrders,
    }[sortBy] || vendors.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Execute query with user join
    const vendorsList = await db
      .select({
        vendorId: vendors.vendorId,
        userId: vendors.userId,
        shopName: vendors.shopName,
        shopSlug: vendors.shopSlug,
        description: vendors.description,
        logo: vendors.logo,
        businessName: vendors.businessName,
        businessEmail: vendors.businessEmail,
        businessPhone: vendors.businessPhone,
        status: vendors.status,
        commissionRate: vendors.commissionRate,
        averageRating: vendors.averageRating,
        totalRatings: vendors.totalRatings,
        totalProducts: vendors.totalProducts,
        totalOrders: vendors.totalOrders,
        isVerified: vendors.isVerified,
        isFeatured: vendors.isFeatured,
        approvedAt: vendors.approvedAt,
        rejectionReason: vendors.rejectionReason,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
        // User info
        userName: user.name,
        userEmail: user.email,
      })
      .from(vendors)
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(vendors)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get status counts
    const statusCounts = await db
      .select({
        status: vendors.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vendors)
      .groupBy(vendors.status);

    return NextResponse.json({
      success: true,
      data: vendorsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}