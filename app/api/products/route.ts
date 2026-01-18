// ========================================
// app/api/products/route.ts - Products API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
import { eq, and, gte, lte, ilike, sql, desc, asc, or } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  getPaginationParams,
  generateSlug,
  getSession,
} from "@/lib/api-utils";

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const vendorId = searchParams.get("vendorId");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const isFlashDeal = searchParams.get("isFlashDeal");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions
    const conditions = [];

    // By default, only show approved and active products for public
    const session = await getSession();
    const userRole = (session?.user as { role?: string })?.role;
    const isAdminOrModerator = ["super_admin", "admin", "moderator"].includes(userRole || "");

    if (!isAdminOrModerator) {
      conditions.push(eq(products.status, "approved"));
      conditions.push(eq(products.isActive, true));
    } else {
      if (status) {
        conditions.push(eq(products.status, status as "draft" | "pending_review" | "approved" | "rejected" | "suspended"));
      }
      if (isActive !== null && isActive !== undefined) {
        conditions.push(eq(products.isActive, isActive === "true"));
      }
    }

    if (vendorId) {
      conditions.push(eq(products.vendorId, vendorId));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (brandId) {
      conditions.push(eq(products.brandId, brandId));
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured === "true"));
    }

    if (isFlashDeal !== null && isFlashDeal !== undefined) {
      conditions.push(eq(products.isFlashDeal, isFlashDeal === "true"));
    }

    if (minPrice) {
      conditions.push(gte(products.salePrice, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(products.salePrice, maxPrice));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.shortDescription, `%${search}%`)
        )
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get products with sorting
    let orderByColumn;
    switch (sortBy) {
      case "name":
        orderByColumn = products.name;
        break;
      case "price":
        orderByColumn = products.salePrice;
        break;
      case "rating":
        orderByColumn = products.averageRating;
        break;
      case "soldCount":
        orderByColumn = products.soldCount;
        break;
      default:
        orderByColumn = products.createdAt;
    }

    const orderDirection = sortOrder === "asc" ? asc : desc;

    const result = await db
      .select({
        product: products,
        vendor: {
          vendorId: vendors.vendorId,
          shopName: vendors.shopName,
          shopSlug: vendors.shopSlug,
          logo: vendors.logo,
          averageRating: vendors.averageRating,
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
        },
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.vendorId))
      .leftJoin(categories, eq(products.categoryId, categories.categoryId))
      .leftJoin(brands, eq(products.brandId, brands.brandId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return successResponse({
      products: result.map((r) => ({
        ...r.product,
        vendor: r.vendor,
        category: r.category,
        brand: r.brand,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}

// POST /api/products - Create a new product (Vendor only)
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Check if user is a vendor
    if (userRole !== "vendor") {
      return errorResponse("Only vendors can create products", 403);
    }

    // Get vendor ID
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId!))
      .limit(1);

    if (vendor.length === 0) {
      return errorResponse("Vendor profile not found", 404);
    }

    if (vendor[0].status !== "approved") {
      return errorResponse("Your vendor account is not approved yet", 403);
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      brandId,
      shortDescription,
      description,
      originalPrice,
      salePrice,
      costPrice,
      stockQuantity = 0,
      lowStockThreshold = 5,
      trackInventory = true,
      allowBackorders = false,
      mainImage,
      images = [],
      videoUrl,
      metaTitle,
      metaDescription,
      tags = [],
      weight,
      length,
      width,
      height,
      isFreeShipping = false,
      sku,
    } = body;

    if (!name || !categoryId || !originalPrice) {
      return errorResponse("Name, category, and original price are required");
    }

    // Generate slug
    let slug = generateSlug(name);

    // Check if slug already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length > 0) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const newProduct = await db
      .insert(products)
      .values({
        vendorId: vendor[0].vendorId,
        categoryId,
        brandId,
        name,
        slug,
        sku,
        shortDescription,
        description,
        originalPrice,
        salePrice: salePrice || originalPrice,
        costPrice,
        stockQuantity,
        lowStockThreshold,
        trackInventory,
        allowBackorders,
        mainImage,
        images,
        videoUrl,
        metaTitle,
        metaDescription,
        tags,
        weight,
        length,
        width,
        height,
        isFreeShipping,
        status: "pending_review", // Products need approval
      })
      .returning();

    // Update vendor's total products count
    await db
      .update(vendors)
      .set({
        totalProducts: sql`${vendors.totalProducts} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendor[0].vendorId));

    return successResponse(newProduct[0], "Product created successfully", 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return errorResponse("Failed to create product", 500);
  }
}
