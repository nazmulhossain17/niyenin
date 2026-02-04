// ========================================
// File: app/api/admin/vendors/route.ts
// Admin Vendors API - List & Bulk Actions
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";
import { z } from "zod";

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// GET /api/admin/vendors - List all vendors with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
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
    const orderByColumn =
      {
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
        banner: vendors.banner,
        businessName: vendors.businessName,
        businessEmail: vendors.businessEmail,
        businessPhone: vendors.businessPhone,
        businessAddress: vendors.businessAddress,
        status: vendors.status,
        commissionRate: vendors.commissionRate,
        averageRating: vendors.averageRating,
        totalRatings: vendors.totalRatings,
        totalProducts: vendors.totalProducts,
        totalOrders: vendors.totalOrders,
        totalEarnings: vendors.totalEarnings,
        isVerified: vendors.isVerified,
        isFeatured: vendors.isFeatured,
        adminNotes: vendors.adminNotes,
        approvedAt: vendors.approvedAt,
        rejectionReason: vendors.rejectionReason,
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

    // Get all status counts (for tabs)
    const allStatusCounts = await db
      .select({
        status: vendors.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vendors)
      .groupBy(vendors.status);

    // Convert to object and calculate all
    const counts = {
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    allStatusCounts.forEach(({ status, count }) => {
      counts[status as keyof typeof counts] = count;
      counts.all += count;
    });

    return NextResponse.json({
      success: true,
      data: vendorsList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

// Bulk action schema
const bulkActionSchema = z.object({
  vendorIds: z.array(z.string().uuid()).min(1, "At least one vendor ID is required"),
  action: z.enum([
    "approve",
    "reject",
    "suspend",
    "unsuspend",
    "verify",
    "unverify",
    "feature",
    "unfeature",
    "delete",
  ]),
  data: z
    .object({
      adminNotes: z.string().max(1000).optional(),
      commissionRate: z.string().optional(),
    })
    .optional(),
});

// PATCH /api/admin/vendors - Bulk actions on vendors
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { vendorIds, action, data } = validation.data;
    const adminId = session!.user.id;
    const now = new Date();

    // Fetch existing vendors
    const existingVendors = await db
      .select()
      .from(vendors)
      .where(inArray(vendors.vendorId, vendorIds));

    if (existingVendors.length === 0) {
      return NextResponse.json(
        { success: false, error: "No vendors found with the provided IDs" },
        { status: 404 }
      );
    }

    let updateData: Partial<typeof vendors.$inferInsert> = {
      updatedAt: now,
    };

    let successCount = 0;
    let failedCount = 0;
    const results: { vendorId: string; success: boolean; message: string }[] = [];

    // Process each vendor based on action
    for (const vendor of existingVendors) {
      let canProcess = true;
      let message = "";

      switch (action) {
        case "approve":
          if (vendor.status === "pending" || vendor.status === "rejected" || vendor.status === "suspended") {
            updateData = {
              updatedAt: now,
              status: "approved",
              approvedAt: now,
              approvedBy: adminId,
              rejectionReason: null,
              adminNotes: data?.adminNotes || vendor.adminNotes,
              commissionRate: data?.commissionRate || vendor.commissionRate || "10.00",
            };
            // Update user role to vendor
            await db.update(user).set({ role: "vendor" }).where(eq(user.id, vendor.userId));
            message = "Approved successfully";
          } else {
            canProcess = false;
            message = `Cannot approve vendor with status: ${vendor.status}`;
          }
          break;

        case "reject":
          if (vendor.status === "pending") {
            updateData = {
              updatedAt: now,
              status: "rejected",
              rejectionReason: data?.adminNotes || "Application rejected by admin",
              adminNotes: data?.adminNotes || vendor.adminNotes,
            };
            // Revert user role to customer
            await db.update(user).set({ role: "customer" }).where(eq(user.id, vendor.userId));
            message = "Rejected successfully";
          } else {
            canProcess = false;
            message = `Cannot reject vendor with status: ${vendor.status}`;
          }
          break;

        case "suspend":
          if (vendor.status === "approved") {
            updateData = {
              updatedAt: now,
              status: "suspended",
              rejectionReason: data?.adminNotes || "Account suspended by admin",
              adminNotes: data?.adminNotes || vendor.adminNotes,
            };
            message = "Suspended successfully";
          } else {
            canProcess = false;
            message = `Cannot suspend vendor with status: ${vendor.status}`;
          }
          break;

        case "unsuspend":
          if (vendor.status === "suspended") {
            updateData = {
              updatedAt: now,
              status: "approved",
              rejectionReason: null,
              adminNotes: data?.adminNotes || vendor.adminNotes,
            };
            message = "Unsuspended successfully";
          } else {
            canProcess = false;
            message = `Cannot unsuspend vendor with status: ${vendor.status}`;
          }
          break;

        case "verify":
          updateData = {
            updatedAt: now,
            isVerified: true,
            adminNotes: data?.adminNotes || vendor.adminNotes,
          };
          message = "Verified successfully";
          break;

        case "unverify":
          updateData = {
            updatedAt: now,
            isVerified: false,
            adminNotes: data?.adminNotes || vendor.adminNotes,
          };
          message = "Verification removed";
          break;

        case "feature":
          updateData = {
            updatedAt: now,
            isFeatured: true,
            adminNotes: data?.adminNotes || vendor.adminNotes,
          };
          message = "Featured successfully";
          break;

        case "unfeature":
          updateData = {
            updatedAt: now,
            isFeatured: false,
            adminNotes: data?.adminNotes || vendor.adminNotes,
          };
          message = "Removed from featured";
          break;

        case "delete":
          // Soft delete or hard delete based on your needs
          // For now, we'll just reject and mark as deleted
          canProcess = vendor.status !== "approved" || vendor.totalOrders === 0;
          if (canProcess) {
            await db.delete(vendors).where(eq(vendors.vendorId, vendor.vendorId));
            await db.update(user).set({ role: "customer" }).where(eq(user.id, vendor.userId));
            message = "Deleted successfully";
          } else {
            message = "Cannot delete vendor with active orders";
          }
          break;

        default:
          canProcess = false;
          message = "Invalid action";
      }

      if (canProcess && action !== "delete") {
        await db.update(vendors).set(updateData).where(eq(vendors.vendorId, vendor.vendorId));
        successCount++;
      } else if (canProcess && action === "delete") {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        vendorId: vendor.vendorId,
        success: canProcess,
        message,
      });
    }

    // Generate response message
    const actionMessages: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      suspend: "suspended",
      unsuspend: "unsuspended",
      verify: "verified",
      unverify: "unverified",
      feature: "featured",
      unfeature: "unfeatured",
      delete: "deleted",
    };

    const responseMessage =
      failedCount === 0
        ? `Successfully ${actionMessages[action]} ${successCount} vendor(s)`
        : `${actionMessages[action]} ${successCount} vendor(s), ${failedCount} failed`;

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        successCount,
        failedCount,
        results,
      },
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}