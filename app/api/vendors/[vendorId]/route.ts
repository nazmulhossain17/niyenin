// ========================================
// app/api/vendors/[vendorId]/route.ts - Single Vendor API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user, products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  requireAdmin,
  generateSlug,
  getSession,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ vendorId: string }>;
}

// GET /api/vendors/[vendorId] - Get a single vendor
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const result = await db
      .select({
        vendor: vendors,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(vendors)
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(eq(vendors.vendorId, vendorId))
      .limit(1);

    if (result.length === 0) {
      return errorResponse("Vendor not found", 404);
    }

    const vendor = result[0];

    // Check if vendor is accessible
    const session = await getSession();
    const userRole = (session?.user as { role?: string })?.role;
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");
    const isOwner = session?.user?.id === vendor.vendor.userId;

    if (!isAdmin && !isOwner && vendor.vendor.status !== "approved") {
      return errorResponse("Vendor not found", 404);
    }

    // Get product count
    const productCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        and(
          eq(products.vendorId, vendorId),
          eq(products.status, "approved"),
          eq(products.isActive, true)
        )
      );

    return successResponse({
      ...vendor.vendor,
      user: isAdmin || isOwner ? vendor.user : undefined,
      productCount: Number(productCount[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return errorResponse("Failed to fetch vendor", 500);
  }
}

// PUT /api/vendors/[vendorId] - Update a vendor
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { vendorId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the vendor
    const existingVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId))
      .limit(1);

    if (existingVendor.length === 0) {
      return errorResponse("Vendor not found", 404);
    }

    // Check authorization
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");
    const isOwner = existingVendor[0].userId === userId;

    if (!isAdmin && !isOwner) {
      return errorResponse("You don't have permission to update this vendor", 403);
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Fields that vendors can update
    const vendorFields = [
      "shopName",
      "description",
      "logo",
      "banner",
      "businessName",
      "businessRegistrationNo",
      "taxId",
      "businessEmail",
      "businessPhone",
      "businessAddress",
      "returnPolicy",
      "shippingPolicy",
    ];

    // Fields that only admins can update
    const adminFields = [
      "status",
      "approvedAt",
      "approvedBy",
      "rejectionReason",
      "commissionRate",
      "isVerified",
      "isFeatured",
    ];

    for (const field of vendorFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update slug if shop name changed
    if (body.shopName && body.shopName !== existingVendor[0].shopName) {
      updateData.shopSlug = generateSlug(body.shopName);
    }

    // Admin-only fields
    if (isAdmin) {
      for (const field of adminFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      // If status is being changed to approved, update user role
      if (body.status === "approved" && existingVendor[0].status !== "approved") {
        updateData.approvedAt = new Date();
        updateData.approvedBy = userId;

        // Update user role to vendor
        await db
          .update(user)
          .set({ role: "vendor", updatedAt: new Date() })
          .where(eq(user.id, existingVendor[0].userId));
      }
    }

    const updatedVendor = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return successResponse(updatedVendor[0], "Vendor updated successfully");
  } catch (error) {
    console.error("Error updating vendor:", error);
    return errorResponse("Failed to update vendor", 500);
  }
}

// DELETE /api/vendors/[vendorId] - Delete a vendor (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { vendorId } = await params;

    // Get the vendor
    const existingVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId))
      .limit(1);

    if (existingVendor.length === 0) {
      return errorResponse("Vendor not found", 404);
    }

    // Delete the vendor (cascade will handle related records)
    await db.delete(vendors).where(eq(vendors.vendorId, vendorId));

    // Reset user role to customer
    await db
      .update(user)
      .set({ role: "customer", updatedAt: new Date() })
      .where(eq(user.id, existingVendor[0].userId));

    return successResponse(null, "Vendor deleted successfully");
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return errorResponse("Failed to delete vendor", 500);
  }
}
