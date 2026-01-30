// ========================================
// app/api/admin/vendors/route.ts
// Admin Vendors API - List & Manage All Vendors
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";

// Helper to check if user is admin
async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 };
  }

  const userRole = (session.user as any).role;
  if (!["admin", "super_admin"].includes(userRole)) {
    return { error: "Forbidden - Admin access required", status: 403 };
  }

  return { session };
}

// GET /api/admin/vendors - List all vendors (admin only)
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
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
    const conditions: any[] = [];

    if (status) {
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
          ilike(vendors.businessEmail, `%${search}%`),
          ilike(vendors.businessName, `%${search}%`)
        )
      );
    }

    // Build order by
    const orderByColumn = {
      createdAt: vendors.createdAt,
      shopName: vendors.shopName,
      rating: vendors.averageRating,
      totalProducts: vendors.totalProducts,
      totalOrders: vendors.totalOrders,
      updatedAt: vendors.updatedAt,
    }[sortBy] || vendors.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Execute query with user info
    const vendorsList = await db
      .select({
        vendorId: vendors.vendorId,
        userId: vendors.userId,
        shopName: vendors.shopName,
        shopSlug: vendors.shopSlug,
        description: vendors.description,
        logo: vendors.logo,
        banner: vendors.banner,
        status: vendors.status,
        businessName: vendors.businessName,
        businessEmail: vendors.businessEmail,
        businessPhone: vendors.businessPhone,
        businessAddress: vendors.businessAddress,
        businessRegistrationNo: vendors.businessRegistrationNo,
        taxId: vendors.taxId,
        averageRating: vendors.averageRating,
        totalRatings: vendors.totalRatings,
        totalProducts: vendors.totalProducts,
        totalOrders: vendors.totalOrders,
        totalEarnings: vendors.totalEarnings,
        isVerified: vendors.isVerified,
        isFeatured: vendors.isFeatured,
        adminNotes: vendors.adminNotes,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
        // User info
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
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

    const counts = {
      all: total,
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    statusCounts.forEach((s) => {
      counts[s.status as keyof typeof counts] = s.count;
    });

    return NextResponse.json({
      success: true,
      data: vendorsList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + vendorsList.length < total,
        counts,
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/vendors - Bulk update vendors
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { vendorIds, action, data } = body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "vendorIds array is required" },
        { status: 400 }
      );
    }

    let updateData: any = { updatedAt: new Date() };
    let message = "";

    switch (action) {
      case "approve":
        updateData.status = "approved";
        message = `${vendorIds.length} vendor(s) approved`;
        break;
      case "reject":
        updateData.status = "rejected";
        if (data?.adminNotes) {
          updateData.adminNotes = data.adminNotes;
        }
        message = `${vendorIds.length} vendor(s) rejected`;
        break;
      case "suspend":
        updateData.status = "suspended";
        if (data?.adminNotes) {
          updateData.adminNotes = data.adminNotes;
        }
        message = `${vendorIds.length} vendor(s) suspended`;
        break;
      case "verify":
        updateData.isVerified = true;
        message = `${vendorIds.length} vendor(s) verified`;
        break;
      case "unverify":
        updateData.isVerified = false;
        message = `${vendorIds.length} vendor(s) unverified`;
        break;
      case "feature":
        updateData.isFeatured = true;
        message = `${vendorIds.length} vendor(s) featured`;
        break;
      case "unfeature":
        updateData.isFeatured = false;
        message = `${vendorIds.length} vendor(s) unfeatured`;
        break;
      case "updateNotes":
        if (data?.adminNotes !== undefined) {
          updateData.adminNotes = data.adminNotes;
        }
        message = "Admin notes updated";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    await db
      .update(vendors)
      .set(updateData)
      .where(inArray(vendors.vendorId, vendorIds));

    // If rejecting or suspending, update user role back to customer
    if (action === "reject") {
      const vendorUsers = await db
        .select({ userId: vendors.userId })
        .from(vendors)
        .where(inArray(vendors.vendorId, vendorIds));

      const userIds = vendorUsers.map((v) => v.userId);
      if (userIds.length > 0) {
        await db
          .update(user)
          .set({ role: "customer" })
          .where(inArray(user.id, userIds));
      }
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error updating vendors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vendors" },
      { status: 500 }
    );
  }
}