// ========================================
// File: app/api/products/[productId]/route.ts
// Public Single Product API + Vendor Update/Delete
// GET: Anyone can view approved products
// PATCH/DELETE: Only the owning vendor
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ productId: string }>;
};

// Helper to get vendor for current user
async function getVendorForUser(userId: string) {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.userId, userId), eq(vendors.status, "approved")));
  return vendor;
}

// ============================================
// GET - Public (no auth required)
// Only returns approved & active products
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    // Determine if it's a UUID or slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        productId
      );

    const condition = isUUID
      ? eq(products.productId, productId)
      : eq(products.slug, productId);

    // Fetch product - MUST be approved and active
    const [product] = await db
      .select({
        productId: products.productId,
        vendorId: products.vendorId,
        categoryId: products.categoryId,
        brandId: products.brandId,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        mainImage: products.mainImage,
        images: products.images,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        stockQuantity: products.stockQuantity,
        sku: products.sku,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        flashDealStartAt: products.flashDealStartAt,
        flashDealEndAt: products.flashDealEndAt,
        averageRating: products.averageRating,
        totalRatings: products.totalRatings,
        soldCount: products.soldCount,
        viewCount: products.viewCount,
        weight: products.weight,
        length: products.length,
        width: products.width,
        height: products.height,
        tags: products.tags,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        createdAt: products.createdAt,
        // Vendor info (public)
        vendorName: vendors.shopName,
        vendorSlug: vendors.shopSlug,
        vendorLogo: vendors.logo,
        // Category info
        categoryName: categories.name,
        // Brand info
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(
        and(condition, eq(products.status, "approved"), eq(products.isActive, true))
      )
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    db.update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.productId, product.productId))
      .catch(() => {});

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Vendor only (update own product)
// ============================================

const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional().nullable(),
  mainImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional().nullable(),
  originalPrice: z.string().optional(),
  salePrice: z.string().optional().nullable(),
  costPrice: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  weight: z.string().optional().nullable(),
  length: z.string().optional().nullable(),
  width: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(255).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
  // Vendor can only set draft or submit for review
  status: z.enum(["draft", "pending_review"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await getVendorForUser(session.user.id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor account not found or not approved" },
        { status: 403 }
      );
    }

    // Verify product belongs to THIS vendor
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productId, productId),
          eq(products.vendorId, vendor.vendorId)
        )
      );

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found or you don't own this product" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

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

    const data = validation.data;

    // If product is rejected and vendor is re-submitting, allow pending_review
    let newStatus = data.status;
    if (
      existingProduct.status === "rejected" &&
      data.status === "pending_review"
    ) {
      newStatus = "pending_review";
    }

    // Vendor cannot activate a product that isn't approved
    if (data.isActive === true && existingProduct.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot activate a product that isn't approved",
        },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (newStatus) {
      updateData.status = newStatus;
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, productId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Vendor only (delete own product)
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await getVendorForUser(session.user.id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor account not found or not approved" },
        { status: 403 }
      );
    }

    // Verify product belongs to THIS vendor
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productId, productId),
          eq(products.vendorId, vendor.vendorId)
        )
      );

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found or you don't own this product" },
        { status: 404 }
      );
    }

    // Can't delete products with sales
    if (existingProduct.soldCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete product with sales history. Consider deactivating instead.",
        },
        { status: 400 }
      );
    }

    // Delete product
    await db.delete(products).where(eq(products.productId, productId));

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}