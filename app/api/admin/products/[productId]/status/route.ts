// ========================================
// File: app/api/admin/products/[productId]/status/route.ts
// Admin Product Status API - Approve, Reject, Suspend
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ productId: string }>;
};

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// Status update schema - accepts either action (approve/reject/suspend/unsuspend)
// or direct status (approved/rejected/suspended/pending_review)
const statusUpdateSchema = z.object({
  // Frontend sends "action" like "approve", "reject", "suspend", "unsuspend"
  action: z.enum(["approve", "reject", "suspend", "unsuspend"]).optional(),
  // Or direct status value
  status: z.enum(["approved", "rejected", "suspended", "pending_review"]).optional(),
  reason: z.string().max(1000).optional(),
}).refine(
  (data) => data.action || data.status,
  { message: "Either 'action' or 'status' must be provided" }
);

// Map action names to status values
const actionToStatus: Record<string, string> = {
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
  unsuspend: "approved",
};

// PATCH /api/admin/products/[productId]/status - Update product status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get existing product
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.productId, productId));

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

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

    const { action, status: directStatus, reason } = validation.data;

    // Resolve the target status from either action or direct status
    const status = directStatus || (action ? actionToStatus[action] : null);

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Could not determine target status" },
        { status: 400 }
      );
    }

    const previousStatus = existingProduct.status;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ["pending_review", "approved", "rejected"],
      pending_review: ["approved", "rejected"],
      approved: ["suspended", "rejected"],
      rejected: ["pending_review", "approved"],
      suspended: ["approved", "rejected"],
    };

    if (!validTransitions[previousStatus]?.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change status from "${previousStatus}" to "${status}"`,
        },
        { status: 400 }
      );
    }

    // Update product status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If approving, also activate the product
    if (status === "approved" && previousStatus !== "approved") {
      updateData.isActive = true;
    }

    // If suspending or rejecting, deactivate the product
    if (status === "suspended" || status === "rejected") {
      updateData.isActive = false;
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, productId))
      .returning();

    // Update vendor's product count if approving for first time
    if (status === "approved" && (previousStatus === "pending_review" || previousStatus === "draft")) {
      await db
        .update(vendors)
        .set({
          totalProducts: sql`${vendors.totalProducts} + 1`,
        })
        .where(eq(vendors.vendorId, existingProduct.vendorId));
    }

    // If previously approved and now rejected/suspended, decrease count
    if (previousStatus === "approved" && (status === "rejected" || status === "suspended")) {
      await db
        .update(vendors)
        .set({
          totalProducts: sql`GREATEST(${vendors.totalProducts} - 1, 0)`,
        })
        .where(eq(vendors.vendorId, existingProduct.vendorId));
    }

    const statusMessages: Record<string, string> = {
      approved: "Product approved successfully",
      rejected: "Product rejected",
      suspended: "Product suspended",
      pending_review: "Product sent back for review",
    };

    return NextResponse.json({
      success: true,
      message: statusMessages[status],
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product status" },
      { status: 500 }
    );
  }
}