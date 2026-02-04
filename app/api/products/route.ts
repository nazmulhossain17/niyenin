// ========================================
// File: app/api/products/route.ts
// Public Products API - No auth required
// Only returns approved & active products
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
import { eq, and, desc, asc, ilike, or, sql, gte, lte } from "drizzle-orm";

// GET /api/products - Public product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const vendorId = searchParams.get("vendorId");
    const featured = searchParams.get("featured");
    const flashDeal = searchParams.get("flashDeal");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // =============================================
    // ENFORCED: Only approved + active products
    // =============================================
    const conditions: any[] = [
      eq(products.status, "approved"),
      eq(products.isActive, true),
    ];

    // Search
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.slug, `%${search}%`)
        )!
      );
    }

    // Category filter
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    // Brand filter
    if (brandId) {
      conditions.push(eq(products.brandId, brandId));
    }

    // Vendor filter
    if (vendorId) {
      conditions.push(eq(products.vendorId, vendorId));
    }

    // Featured filter
    if (featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }

    // Flash deal filter
    if (flashDeal === "true") {
      conditions.push(eq(products.isFlashDeal, true));
      const now = new Date();
      conditions.push(lte(products.flashDealStartAt, now));
      conditions.push(gte(products.flashDealEndAt, now));
    }

    // Price range
    if (minPrice) {
      conditions.push(gte(products.salePrice, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(products.salePrice, maxPrice));
    }

    // Build order by
    const orderByColumn =
      {
        createdAt: products.createdAt,
        name: products.name,
        price: products.salePrice,
        rating: products.averageRating,
        popularity: products.soldCount,
        views: products.viewCount,
      }[sortBy] || products.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Execute query - only return public-safe fields
    const productsList = await db
      .select({
        productId: products.productId,
        name: products.name,
        slug: products.slug,
        mainImage: products.mainImage,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        stockQuantity: products.stockQuantity,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        flashDealStartAt: products.flashDealStartAt,
        flashDealEndAt: products.flashDealEndAt,
        averageRating: products.averageRating,
        totalRatings: products.totalRatings,
        soldCount: products.soldCount,
        createdAt: products.createdAt,
        // Vendor info (public)
        vendorId: products.vendorId,
        vendorName: vendors.shopName,
        vendorSlug: vendors.shopSlug,
        vendorLogo: vendors.logo,
        // Category info
        categoryId: products.categoryId,
        categoryName: categories.name,
        // Brand info
        brandId: products.brandId,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: productsList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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