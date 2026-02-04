// ========================================
// File: app/api/vendor/products/route.ts
// Vendor Products API - List & Create
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors, categories, brands } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";

// Helper to get vendor for current user
async function getVendorForUser(userId: string) {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.userId, userId), eq(vendors.status, "approved")));
  return vendor;
}

// GET /api/vendor/products - List vendor's own products
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("active");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions - always filter by vendor
    const conditions = [eq(products.vendorId, vendor.vendorId)];

    if (status && ["draft", "pending_review", "approved", "rejected", "suspended"].includes(status)) {
      conditions.push(eq(products.status, status as any));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (isActive === "true") {
      conditions.push(eq(products.isActive, true));
    } else if (isActive === "false") {
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

    // Build order
    const orderByColumn =
      {
        createdAt: products.createdAt,
        name: products.name,
        originalPrice: products.originalPrice,
        stockQuantity: products.stockQuantity,
        soldCount: products.soldCount,
      }[sortBy] || products.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Execute query
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
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        averageRating: products.averageRating,
        totalRatings: products.totalRatings,
        soldCount: products.soldCount,
        viewCount: products.viewCount,
        createdAt: products.createdAt,
        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(products)
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

    // Get status counts for this vendor
    const statusCounts = await db
      .select({
        status: products.status,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.vendorId, vendor.vendorId))
      .groupBy(products.status);

    const counts = {
      all: 0,
      draft: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
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
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Create product schema
const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  sku: z.string().max(100).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable(),
  mainImage: z.string().url(),
  images: z.array(z.string().url()).optional().nullable(),
  originalPrice: z.string(),
  salePrice: z.string().optional().nullable(),
  costPrice: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight: z.string().optional().nullable(),
  length: z.string().optional().nullable(),
  width: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(255).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
});

// Helper to generate slug
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    nanoid(6)
  );
}

// POST /api/vendor/products - Create new product
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

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

    // Verify category exists
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, data.categoryId));

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    // Verify brand if provided
    if (data.brandId) {
      const [brand] = await db
        .select()
        .from(brands)
        .where(eq(brands.brandId, data.brandId));

      if (!brand) {
        return NextResponse.json(
          { success: false, error: "Invalid brand" },
          { status: 400 }
        );
      }
    }

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        vendorId: vendor.vendorId,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        name: data.name,
        slug: generateSlug(data.name),
        sku: data.sku || null,
        description: data.description || null,
        shortDescription: data.shortDescription || null,
        mainImage: data.mainImage,
        images: data.images || null,
        originalPrice: data.originalPrice,
        salePrice: data.salePrice || null,
        costPrice: data.costPrice || null,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        weight: data.weight || null,
        length: data.length || null,
        width: data.width || null,
        height: data.height || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        tags: data.tags || null,
        status: data.isActive ? "pending_review" : "draft",
        isActive: false, // Will be activated after approval
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: data.isActive
        ? "Product created and submitted for review"
        : "Product saved as draft",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}