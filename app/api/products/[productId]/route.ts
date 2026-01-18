// ========================================
// app/api/products/[productId]/route.ts - Single Product API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands, productVariants, reviews } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  generateSlug,
  getSession,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// GET /api/products/[productId] - Get a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const result = await db
      .select({
        product: products,
        vendor: {
          vendorId: vendors.vendorId,
          shopName: vendors.shopName,
          shopSlug: vendors.shopSlug,
          logo: vendors.logo,
          averageRating: vendors.averageRating,
          totalRatings: vendors.totalRatings,
        },
        category: {
          categoryId: categories.categoryId,
          name: categories.name,
          slug: categories.slug,
        },
        brand: {
          brandId: brands.brandId,
          name: brands.name,
          slug: brands.slug,
          logo: brands.logo,
        },
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(eq(products.productId, productId))
      .limit(1);

    if (result.length === 0) {
      return errorResponse("Product not found", 404);
    }

    const product = result[0];

    // Check if product is accessible
    const session = await getSession();
    const userRole = (session?.user as { role?: string })?.role;
    const isAdminOrModerator = ["super_admin", "admin", "moderator"].includes(userRole || "");

    if (!isAdminOrModerator && (product.product.status !== "approved" || !product.product.isActive)) {
      return errorResponse("Product not found", 404);
    }

    // Get product variants
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    // Get review summary
    const reviewSummary = await db
      .select({
        totalReviews: sql<number>`count(*)`,
        averageRating: sql<number>`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));

    // Increment view count
    await db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.productId, productId));

    return successResponse({
      ...product.product,
      vendor: product.vendor,
      category: product.category,
      brand: product.brand,
      variants,
      reviewSummary: {
        totalReviews: Number(reviewSummary[0]?.totalReviews || 0),
        averageRating: Number(reviewSummary[0]?.averageRating || 0).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}

// PUT /api/products/[productId] - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { productId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the product
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return errorResponse("Product not found", 404);
    }

    // Check authorization
    const isAdminOrModerator = ["super_admin", "admin", "moderator"].includes(userRole || "");

    if (!isAdminOrModerator) {
      // Check if user is the vendor owner
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.vendorId, existingProduct[0].vendorId))
        .limit(1);

      if (vendor.length === 0 || vendor[0].userId !== userId) {
        return errorResponse("You don't have permission to update this product", 403);
      }
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Fields that vendors can update
    const vendorFields = [
      "name",
      "shortDescription",
      "description",
      "originalPrice",
      "salePrice",
      "costPrice",
      "stockQuantity",
      "lowStockThreshold",
      "trackInventory",
      "allowBackorders",
      "mainImage",
      "images",
      "videoUrl",
      "metaTitle",
      "metaDescription",
      "tags",
      "weight",
      "length",
      "width",
      "height",
      "isFreeShipping",
      "sku",
      "categoryId",
      "brandId",
    ];

    // Fields that only admins/moderators can update
    const adminFields = [
      "status",
      "isActive",
      "isFeatured",
      "isFlashDeal",
      "flashDealStartAt",
      "flashDealEndAt",
      "moderatedBy",
      "moderatedAt",
      "rejectionReason",
    ];

    for (const field of vendorFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update slug if name changed
    if (body.name && body.name !== existingProduct[0].name) {
      updateData.slug = generateSlug(body.name);
    }

    // Admin-only fields
    if (isAdminOrModerator) {
      for (const field of adminFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      // If status is being changed, record moderation info
      if (body.status && body.status !== existingProduct[0].status) {
        updateData.moderatedBy = userId;
        updateData.moderatedAt = new Date();
      }
    } else {
      // If vendor updates, set status back to pending_review
      if (existingProduct[0].status === "approved") {
        updateData.status = "pending_review";
      }
    }

    const updatedProduct = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, productId))
      .returning();

    return successResponse(updatedProduct[0], "Product updated successfully");
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse("Failed to update product", 500);
  }
}

// DELETE /api/products/[productId] - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { productId } = await params;
    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Get the product
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (existingProduct.length === 0) {
      return errorResponse("Product not found", 404);
    }

    // Check authorization
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");

    if (!isAdmin) {
      // Check if user is the vendor owner
      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.vendorId, existingProduct[0].vendorId))
        .limit(1);

      if (vendor.length === 0 || vendor[0].userId !== userId) {
        return errorResponse("You don't have permission to delete this product", 403);
      }
    }

    // Delete the product
    await db.delete(products).where(eq(products.productId, productId));

    // Update vendor's total products count
    await db
      .update(vendors)
      .set({
        totalProducts: sql`GREATEST(${vendors.totalProducts} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, existingProduct[0].vendorId));

    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse("Failed to delete product", 500);
  }
}
