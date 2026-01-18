// ========================================
// app/api/categories/route.ts - Categories API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { eq, and, isNull, asc, desc, ilike, sql } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAdmin,
  getPaginationParams,
  generateSlug,
} from "@/lib/api-utils";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const parentId = searchParams.get("parentId");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build conditions
    const conditions = [];

    if (parentId === "null" || parentId === "") {
      conditions.push(isNull(categories.parentId));
    } else if (parentId) {
      conditions.push(eq(categories.parentId, parentId));
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(categories.isActive, isActive === "true"));
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      conditions.push(eq(categories.isFeatured, isFeatured === "true"));
    }

    if (search) {
      conditions.push(ilike(categories.name, `%${search}%`));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get categories with sorting
    const orderByColumn =
      sortBy === "name"
        ? categories.name
        : sortBy === "createdAt"
        ? categories.createdAt
        : categories.sortOrder;

    const orderDirection = sortOrder === "desc" ? desc : asc;

    const result = await db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return successResponse({
      categories: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}

// POST /api/categories - Create a new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const {
      name,
      description,
      image,
      icon,
      parentId,
      sortOrder,
      isActive = true,
      isFeatured = false,
      metaTitle,
      metaDescription,
    } = body;

    if (!name) {
      return errorResponse("Category name is required");
    }

    // Generate slug
    let slug = generateSlug(name);

    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existingCategory.length > 0) {
      // Append random string to make slug unique
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Calculate level based on parent
    let level = 0;
    if (parentId) {
      const parentCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.categoryId, parentId))
        .limit(1);

      if (parentCategory.length > 0) {
        level = parentCategory[0].level + 1;
      }
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        image,
        icon,
        parentId,
        level,
        sortOrder: sortOrder || 0,
        isActive,
        isFeatured,
        metaTitle,
        metaDescription,
      })
      .returning();

    return successResponse(newCategory[0], "Category created successfully", 201);
  } catch (error) {
    console.error("Error creating category:", error);
    return errorResponse("Failed to create category", 500);
  }
}
