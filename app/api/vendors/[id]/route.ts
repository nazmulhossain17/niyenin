// ========================================
// app/api/admin/vendors/[id]/route.ts
// Admin Single Vendor API - View & Update Vendor
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

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

// GET /api/admin/vendors/[id] - Get single vendor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;

    const [vendor] = await db
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
        returnPolicy: vendors.returnPolicy,
        shippingPolicy: vendors.shippingPolicy,
        averageRating: vendors.averageRating,
        totalRatings: vendors.totalRatings,
        totalProducts: vendors.totalProducts,
        totalOrders: vendors.totalOrders,
        totalEarnings: vendors.totalEarnings,
        walletBalance: vendors.walletBalance,
        isVerified: vendors.isVerified,
        isFeatured: vendors.isFeatured,
        commissionRate: vendors.commissionRate,
        adminNotes: vendors.adminNotes,
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
      .where(eq(vendors.vendorId, id));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Get product stats
    const [productStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        approved: sql<number>`count(*) filter (where ${products.status} = 'approved')::int`,
        pending: sql<number>`count(*) filter (where ${products.status} = 'pending_review')::int`,
        rejected: sql<number>`count(*) filter (where ${products.status} = 'rejected')::int`,
      })
      .from(products)
      .where(eq(products.vendorId, id));

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
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  commissionRate: z.string().optional(),
  adminNotes: z.string().max(2000).optional(),
  // Allow admin to update shop info
  shopName: z.string().min(2).max(150).optional(),
  shopSlug: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
});

// PUT /api/admin/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = updateVendorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if vendor exists
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, id));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changing
    if (data.shopSlug && data.shopSlug !== existingVendor.shopSlug) {
      const [slugExists] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.shopSlug, data.shopSlug));

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Shop slug is already taken" },
          { status: 400 }
        );
      }
    }

    // Update vendor
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, id))
      .returning();

    // Handle user role changes based on status
    if (data.status) {
      if (data.status === "approved") {
        await db
          .update(user)
          .set({ role: "vendor" })
          .where(eq(user.id, existingVendor.userId));
      } else if (data.status === "rejected") {
        await db
          .update(user)
          .set({ role: "customer" })
          .where(eq(user.id, existingVendor.userId));
      }
    }

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

// DELETE /api/admin/vendors/[id] - Delete vendor (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userRole = (session.user as any).role;
  if (userRole !== "super_admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden - Super admin access required" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    // Get vendor to find user ID
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, id));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Delete vendor
    await db.delete(vendors).where(eq(vendors.vendorId, id));

    // Reset user role to customer
    await db
      .update(user)
      .set({ role: "customer" })
      .where(eq(user.id, vendor.userId));

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