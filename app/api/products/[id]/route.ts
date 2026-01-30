// File: app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  products,
  categories,
  brands,
  vendors,
  productVariants,
  productSpecifications,
  reviews,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeVariants = searchParams.get("includeVariants") === "true";
    const includeSpecs = searchParams.get("includeSpecs") === "true";
    const includeReviews = searchParams.get("includeReviews") === "true";

    // Fetch product by ID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const result = await db
      .select({
        product: products,
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
        vendor: {
          vendorId: vendors.vendorId,
          shopName: vendors.shopName,
          shopSlug: vendors.shopSlug,
          logo: vendors.logo,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .where(isUUID ? eq(products.productId, id) : eq(products.slug, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const productData: any = {
      ...result[0].product,
      category: result[0].category,
      brand: result[0].brand,
      vendor: result[0].vendor,
    };

    // Include variants if requested
    if (includeVariants) {
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, result[0].product.productId));
      productData.variants = variants;
    }

    // Include specifications if requested
    if (includeSpecs) {
      const specs = await db
        .select()
        .from(productSpecifications)
        .where(eq(productSpecifications.productId, result[0].product.productId));
      productData.specifications = specs;
    }

    // Include reviews summary if requested
    if (includeReviews) {
      const reviewsData = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, result[0].product.productId))
        .limit(10);
      productData.reviews = reviewsData;
    }

    return NextResponse.json({ success: true, data: productData });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.productId, id))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // If slug is being updated, check for duplicates
    if (body.slug && body.slug !== existingProduct[0].slug) {
      const duplicateSlug = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.slug, body.slug))
        .limit(1);

      if (duplicateSlug.length > 0) {
        return NextResponse.json(
          { success: false, error: "Product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If SKU is being updated, check for duplicates
    if (body.sku && body.sku !== existingProduct[0].sku) {
      const duplicateSku = await db
        .select({ sku: products.sku })
        .from(products)
        .where(eq(products.sku, body.sku))
        .limit(1);

      if (duplicateSku.length > 0) {
        return NextResponse.json(
          { success: false, error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku || null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.brandId !== undefined) updateData.brandId = body.brandId || null;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription || null;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice.toString();
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice?.toString() || null;
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice?.toString() || null;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = body.stockQuantity;
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold;
    if (body.trackInventory !== undefined) updateData.trackInventory = body.trackInventory;
    if (body.allowBackorders !== undefined) updateData.allowBackorders = body.allowBackorders;
    if (body.mainImage !== undefined) updateData.mainImage = body.mainImage || null;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl || null;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle || null;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription || null;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.weight !== undefined) updateData.weight = body.weight?.toString() || null;
    if (body.length !== undefined) updateData.length = body.length?.toString() || null;
    if (body.width !== undefined) updateData.width = body.width?.toString() || null;
    if (body.height !== undefined) updateData.height = body.height?.toString() || null;
    if (body.isFreeShipping !== undefined) updateData.isFreeShipping = body.isFreeShipping;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isFlashDeal !== undefined) updateData.isFlashDeal = body.isFlashDeal;
    if (body.flashDealStartAt !== undefined) {
      updateData.flashDealStartAt = body.flashDealStartAt ? new Date(body.flashDealStartAt) : null;
    }
    if (body.flashDealEndAt !== undefined) {
      updateData.flashDealEndAt = body.flashDealEndAt ? new Date(body.flashDealEndAt) : null;
    }

    // Update product
    const updatedProduct = await db
      .update(products)
      .set(updateData)
      .where(eq(products.productId, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.productId, id))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product (cascades to variants, specs, etc.)
    await db.delete(products).where(eq(products.productId, id));

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

// PATCH /api/products/[id] - Partial update
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}