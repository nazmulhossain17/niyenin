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

// Product status enum: "approved" | "rejected" | "suspended" | "draft" | "pending_review"
type ProductStatus = "approved" | "rejected" | "suspended" | "draft" | "pending_review";

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// Validation schema
const statusChangeSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "unsuspend", "pending_review"]),
  reason: z.string().max(1000).optional(),
});

// PATCH /api/admin/products/[productId]/status
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
    const validation = statusChangeSchema.safeParse(body);

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

    const { action, reason } = validation.data;
    const now = new Date();

    let updateData: Partial<typeof products.$inferInsert> = {
      updatedAt: now,
    };

    switch (action) {
      case "approve":
        // Can approve pending_review or draft products
        if (existingProduct.status !== "pending_review" && existingProduct.status !== "draft") {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot approve product with status: ${existingProduct.status}`,
            },
            { status: 400 }
          );
        }
        updateData.status = "approved";
        // Increment vendor's approved product count
        await db
          .update(vendors)
          .set({ totalProducts: sql`${vendors.totalProducts} + 1` })
          .where(eq(vendors.vendorId, existingProduct.vendorId));
        break;

      case "reject":
        // Can reject pending_review or draft products
        if (existingProduct.status !== "pending_review" && existingProduct.status !== "draft") {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot reject product with status: ${existingProduct.status}`,
            },
            { status: 400 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        updateData.status = "rejected";
        break;

      case "suspend":
        // Can only suspend approved products
        if (existingProduct.status !== "approved") {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot suspend product with status: ${existingProduct.status}`,
            },
            { status: 400 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Suspension reason is required" },
            { status: 400 }
          );
        }
        updateData.status = "suspended";
        break;

      case "unsuspend":
        // Can only unsuspend suspended products
        if (existingProduct.status !== "suspended") {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot unsuspend product with status: ${existingProduct.status}`,
            },
            { status: 400 }
          );
        }
        updateData.status = "approved";
        break;

      case "pending_review":
        // Reset to pending_review (e.g., for re-review)
        updateData.status = "pending_review";
        // If was approved, decrement count
        if (existingProduct.status === "approved") {
          await db
            .update(vendors)
            .set({ totalProducts: sql`GREATEST(${vendors.totalProducts} - 1, 0)` })
            .where(eq(vendors.vendorId, existingProduct.vendorId));
        }
        break;
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, productId))
      .returning();

    const messages: Record<string, string> = {
      approve: "Product approved successfully",
      reject: "Product rejected",
      suspend: "Product suspended",
      unsuspend: "Product unsuspended",
      pending_review: "Product moved to pending review",
    };

    return NextResponse.json({
      success: true,
      message: messages[action],
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

// GET /api/admin/products/[productId]/status
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const [product] = await db
      .select({
        productId: products.productId,
        name: products.name,
        status: products.status,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        vendorName: vendors.shopName,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .where(eq(products.productId, productId));

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product status" },
      { status: 500 }
    );
  }
}