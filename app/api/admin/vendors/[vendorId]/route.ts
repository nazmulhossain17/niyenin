// ========================================
// File: app/api/admin/vendors/[vendorId]/route.ts
// Admin Single Vendor API - Get, Update, Delete
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ vendorId: string }>;
};

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// GET /api/admin/vendors/[vendorId] - Get vendor details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get vendor with user info
    const [vendor] = await db
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
        approvedBy: vendors.approvedBy,
        rejectionReason: vendors.rejectionReason,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
        // User info
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        userCreatedAt: user.createdAt,
      })
      .from(vendors)
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(eq(vendors.vendorId, vendorId));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Get additional stats
    const [productStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${products.isActive} = true)::int`,
        approved: sql<number>`count(*) filter (where ${products.status} = 'approved')::int`,
        pendingReview: sql<number>`count(*) filter (where ${products.status} = 'pending_review')::int`,
      })
      .from(products)
      .where(eq(products.vendorId, vendorId));

    return NextResponse.json({
      success: true,
      data: {
        ...vendor,
        productStats,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

// Update schema
const updateVendorSchema = z.object({
  shopName: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  businessName: z.string().max(200).optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().max(20).optional(),
  businessAddress: z.string().max(500).optional(),
  commissionRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  adminNotes: z.string().max(1000).optional(),
});

// PATCH /api/admin/vendors/[vendorId] - Update vendor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateVendorSchema.safeParse(body);

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

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vendors/[vendorId] - Delete vendor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if vendor has orders
    if (existingVendor.totalOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete vendor with existing orders. Consider suspending instead.",
        },
        { status: 400 }
      );
    }

    // Delete vendor's products first
    await db.delete(products).where(eq(products.vendorId, vendorId));

    // Delete vendor
    await db.delete(vendors).where(eq(vendors.vendorId, vendorId));

    // Update user role back to customer
    await db
      .update(user)
      .set({ role: "customer" })
      .where(eq(user.id, existingVendor.userId));

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}