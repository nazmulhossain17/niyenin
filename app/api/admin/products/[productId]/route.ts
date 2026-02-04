// ========================================
// File: app/api/admin/products/[productId]/route.ts
// Admin Single Product API - Get, Update, Delete
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
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

// GET /api/admin/products/[productId] - Get product details
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

    // Get product with relations
    const [product] = await db
      .select({
        productId: products.productId,
        vendorId: products.vendorId,
        categoryId: products.categoryId,
        brandId: products.brandId,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        description: products.description,
        shortDescription: products.shortDescription,
        mainImage: products.mainImage,
        images: products.images,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        costPrice: products.costPrice,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        weight: products.weight,
        length: products.length,
        width: products.width,
        height: products.height,
        status: products.status,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        flashDealStartAt: products.flashDealStartAt,
        flashDealEndAt: products.flashDealEndAt,
        averageRating: products.averageRating,
        totalRatings: products.totalRatings,
        soldCount: products.soldCount,
        viewCount: products.viewCount,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        tags: products.tags,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Relations
        vendorName: vendors.shopName,
        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
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
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update schema
const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).optional(),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  mainImage: z.string().url().optional().nullable(),
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
  status: z.enum(["draft", "pending_review", "approved", "rejected", "suspended"]).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFlashDeal: z.boolean().optional(),
  flashDealStartAt: z.string().datetime().optional().nullable(),
  flashDealEndAt: z.string().datetime().optional().nullable(),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(255).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

// PATCH /api/admin/products/[productId] - Update product
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

    const updateData: any = {
      ...validation.data,
      updatedAt: new Date(),
    };

    // Handle date conversions
    if (updateData.flashDealStartAt) {
      updateData.flashDealStartAt = new Date(updateData.flashDealStartAt);
    }
    if (updateData.flashDealEndAt) {
      updateData.flashDealEndAt = new Date(updateData.flashDealEndAt);
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

// DELETE /api/admin/products/[productId] - Delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if product has orders
    if (existingProduct.soldCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete product with sales history. Consider deactivating instead.",
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