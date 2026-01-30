// File: app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, desc, asc, ilike, or, and, gte, lte, sql, inArray } from "drizzle-orm";
import { brands, categories, products, vendors } from "@/db/schema";
import { db } from "@/db/drizzle";
import { requireRoles, ROLES } from "@/lib/api/auth-guard";

// GET /api/products - Get all products (Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const isFlashDeal = searchParams.get("isFlashDeal");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.slug, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.shortDescription, `%${search}%`)
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (brandId) {
      conditions.push(eq(products.brandId, brandId));
    }

    if (vendorId) {
      conditions.push(eq(products.vendorId, vendorId));
    }

    if (status) {
      const statuses = status.split(",");
      conditions.push(inArray(products.status, statuses as any));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(products.isActive, isActive === "true"));
    }

    if (isFeatured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }

    if (isFlashDeal === "true") {
      conditions.push(eq(products.isFlashDeal, true));
    }

    if (minPrice) {
      conditions.push(gte(products.salePrice, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(products.salePrice, maxPrice));
    }

    if (inStock === "true") {
      conditions.push(gte(products.stockQuantity, 1));
    }

    // Define valid sort columns
    const sortColumns = {
      name: products.name,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      originalPrice: products.originalPrice,
      salePrice: products.salePrice,
      stockQuantity: products.stockQuantity,
      soldCount: products.soldCount,
      viewCount: products.viewCount,
      averageRating: products.averageRating,
    } as const;

    const sortColumn = sortColumns[sortBy as keyof typeof sortColumns] ?? products.createdAt;

    // Execute query with joins
    const offset = (page - 1) * limit;

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
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Format response
    const formattedResult = result.map((row) => ({
      ...row.product,
      category: row.category,
      brand: row.brand,
      vendor: row.vendor,
    }));

    return NextResponse.json({
      success: true,
      data: formattedResult,
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

// POST /api/products - Create a new product
// Only super_admin, admin, moderator, and vendor can create products
export async function POST(request: NextRequest) {
  try {
    // Check authorization - only product managers can create products
    const authResult = await requireRoles(ROLES.PRODUCT_MANAGERS);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const user = authResult.user!;
    const userRole = authResult.user?.role;

    const body = await request.json();

    // Basic validation
    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.slug?.trim()) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    if (!body.vendorId) {
      return NextResponse.json(
        { success: false, error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    if (!body.originalPrice || isNaN(Number(body.originalPrice))) {
      return NextResponse.json(
        { success: false, error: "Valid original price is required" },
        { status: 400 }
      );
    }

    // Vendors can only create products for their own shop
    if (userRole === "vendor") {
      // Get vendor profile for this user
      const vendorProfile = await db
        .select({ vendorId: vendors.vendorId })
        .from(vendors)
        .where(eq(vendors.userId, user.id))
        .limit(1);

      if (vendorProfile.length === 0) {
        return NextResponse.json(
          { success: false, error: "You don't have a vendor profile" },
          { status: 403 }
        );
      }

      if (vendorProfile[0].vendorId !== body.vendorId) {
        return NextResponse.json(
          { success: false, error: "You can only create products for your own shop" },
          { status: 403 }
        );
      }
    }

    // Check if slug already exists
    const existingProduct = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.slug, body.slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 409 }
      );
    }

    // Check if SKU already exists (if provided)
    if (body.sku) {
      const existingSku = await db
        .select({ sku: products.sku })
        .from(products)
        .where(eq(products.sku, body.sku))
        .limit(1);

      if (existingSku.length > 0) {
        return NextResponse.json(
          { success: false, error: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    // Verify vendor exists
    const vendorExists = await db
      .select({ vendorId: vendors.vendorId })
      .from(vendors)
      .where(eq(vendors.vendorId, body.vendorId))
      .limit(1);

    if (vendorExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Verify category exists
    const categoryExists = await db
      .select({ categoryId: categories.categoryId })
      .from(categories)
      .where(eq(categories.categoryId, body.categoryId))
      .limit(1);

    if (categoryExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Vendors create products as 'pending_review', admins can set any status
    const status = userRole === "vendor" ? "pending_review" : (body.status || "draft");

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        vendorId: body.vendorId,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        name: body.name,
        slug: body.slug,
        sku: body.sku || null,
        shortDescription: body.shortDescription || null,
        description: body.description || null,
        originalPrice: body.originalPrice.toString(),
        salePrice: body.salePrice?.toString() || null,
        costPrice: body.costPrice?.toString() || null,
        stockQuantity: body.stockQuantity || 0,
        lowStockThreshold: body.lowStockThreshold || 5,
        trackInventory: body.trackInventory ?? true,
        allowBackorders: body.allowBackorders ?? false,
        mainImage: body.mainImage || null,
        images: body.images || [],
        videoUrl: body.videoUrl || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        tags: body.tags || [],
        weight: body.weight?.toString() || null,
        length: body.length?.toString() || null,
        width: body.width?.toString() || null,
        height: body.height?.toString() || null,
        isFreeShipping: body.isFreeShipping ?? false,
        status: status,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        isFlashDeal: body.isFlashDeal ?? false,
        flashDealStartAt: body.flashDealStartAt ? new Date(body.flashDealStartAt) : null,
        flashDealEndAt: body.flashDealEndAt ? new Date(body.flashDealEndAt) : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newProduct[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}