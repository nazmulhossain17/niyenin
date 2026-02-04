// ========================================
// File: app/api/admin/products/route.ts
// Admin Products API - List & Bulk Actions
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";
import { z } from "zod";

// Product status enum: "approved" | "rejected" | "suspended" | "draft" | "pending_review"
type ProductStatus = "approved" | "rejected" | "suspended" | "draft" | "pending_review";

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// GET /api/admin/products - List all products with filters
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
    const status = searchParams.get("status") as ProductStatus | null;
    const vendorId = searchParams.get("vendorId");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");
    const flashDeal = searchParams.get("flashDeal");
    const active = searchParams.get("active");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where conditions
    const conditions = [];

    if (status && ["pending_review", "approved", "rejected", "suspended", "draft"].includes(status)) {
      conditions.push(eq(products.status, status));
    }

    if (vendorId) {
      conditions.push(eq(products.vendorId, vendorId));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }

    if (flashDeal === "true") {
      conditions.push(eq(products.isFlashDeal, true));
    }

    if (active === "true") {
      conditions.push(eq(products.isActive, true));
    } else if (active === "false") {
      conditions.push(eq(products.isActive, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )!
      );
    }

    // Build order by
    const orderByColumn =
      {
        createdAt: products.createdAt,
        name: products.name,
        originalPrice: products.originalPrice,
        stockQuantity: products.stockQuantity,
        soldCount: products.soldCount,
      }[sortBy] || products.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Execute query with joins
    const productsList = await db
      .select({
        productId: products.productId,
        vendorId: products.vendorId,
        categoryId: products.categoryId,
        brandId: products.brandId,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        mainImage: products.mainImage,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        stockQuantity: products.stockQuantity,
        status: products.status,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        averageRating: products.averageRating,
        totalRatings: products.totalRatings,
        soldCount: products.soldCount,
        viewCount: products.viewCount,
        createdAt: products.createdAt,
        // Vendor info
        vendorName: vendors.shopName,
        vendorStatus: vendors.status,
        // Category info
        categoryName: categories.name,
        // Brand info
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get status counts
    const statusCounts = await db
      .select({
        status: products.status,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.status);

    const counts = {
      all: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
      draft: 0,
    };

    statusCounts.forEach(({ status, count }) => {
      if (status in counts) {
        counts[status as keyof typeof counts] = count;
      }
      counts.all += count;
    });

    return NextResponse.json({
      success: true,
      data: productsList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        counts,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Bulk action schema
const bulkActionSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  action: z.enum([
    "approve",
    "reject",
    "suspend",
    "activate",
    "deactivate",
    "feature",
    "unfeature",
    "flashDeal",
    "removeFlashDeal",
    "delete",
  ]),
  data: z
    .object({
      reason: z.string().max(1000).optional(),
    })
    .optional(),
});

// PATCH /api/admin/products - Bulk actions on products
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

    const { productIds, action, data } = validation.data;
    const now = new Date();

    // Fetch existing products
    const existingProducts = await db
      .select()
      .from(products)
      .where(inArray(products.productId, productIds));

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No products found" },
        { status: 404 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const results: { productId: string; success: boolean; message: string }[] = [];

    for (const product of existingProducts) {
      let canProcess = true;
      let message = "";
      let updateData: Partial<typeof products.$inferInsert> = {
        updatedAt: now,
      };

      switch (action) {
        case "approve":
          if (product.status === "pending_review" || product.status === "draft") {
            updateData.status = "approved";
            // Update vendor's product count
            await db
              .update(vendors)
              .set({
                totalProducts: sql`${vendors.totalProducts} + 1`,
              })
              .where(eq(vendors.vendorId, product.vendorId));
            message = "Approved";
          } else {
            canProcess = false;
            message = `Cannot approve product with status: ${product.status}`;
          }
          break;

        case "reject":
          if (product.status === "pending_review" || product.status === "draft") {
            updateData.status = "rejected";
            message = "Rejected";
          } else {
            canProcess = false;
            message = `Cannot reject product with status: ${product.status}`;
          }
          break;

        case "suspend":
          if (product.status === "approved") {
            updateData.status = "suspended";
            message = "Suspended";
          } else {
            canProcess = false;
            message = `Cannot suspend product with status: ${product.status}`;
          }
          break;

        case "activate":
          updateData.isActive = true;
          message = "Activated";
          break;

        case "deactivate":
          updateData.isActive = false;
          message = "Deactivated";
          break;

        case "feature":
          updateData.isFeatured = true;
          message = "Featured";
          break;

        case "unfeature":
          updateData.isFeatured = false;
          message = "Unfeatured";
          break;

        case "flashDeal":
          updateData.isFlashDeal = true;
          message = "Added to flash deals";
          break;

        case "removeFlashDeal":
          updateData.isFlashDeal = false;
          message = "Removed from flash deals";
          break;

        case "delete":
          if (product.soldCount === 0) {
            await db.delete(products).where(eq(products.productId, product.productId));
            message = "Deleted";
          } else {
            canProcess = false;
            message = "Cannot delete product with sales history";
          }
          break;
      }

      if (canProcess && action !== "delete") {
        await db
          .update(products)
          .set(updateData)
          .where(eq(products.productId, product.productId));
        successCount++;
      } else if (canProcess && action === "delete") {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        productId: product.productId,
        success: canProcess,
        message,
      });
    }

    const actionMessages: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      suspend: "suspended",
      activate: "activated",
      deactivate: "deactivated",
      feature: "featured",
      unfeature: "unfeatured",
      flashDeal: "added to flash deals",
      removeFlashDeal: "removed from flash deals",
      delete: "deleted",
    };

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionMessages[action]} ${successCount} product(s)${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
      data: { successCount, failedCount, results },
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform action" },
      { status: 500 }
    );
  }
}