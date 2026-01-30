// File: app/api/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, desc, asc, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { categories } from "@/db/schema";
import { db } from "@/db/drizzle";
import { requireRoles, ROLES } from "@/lib/api/auth-guard";

// Validation schema for creating a category
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(150),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  icon: z.string().max(100).optional(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().optional(),
});

// GET /api/categories - Get all categories (Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const includeInactive = searchParams.get("includeInactive") === "true";
    const parentId = searchParams.get("parentId");
    const featured = searchParams.get("featured") === "true";
    const tree = searchParams.get("tree") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build query conditions
    const conditions = [];
    
    if (!includeInactive) {
      conditions.push(eq(categories.isActive, true));
    }
    
    if (parentId === "null" || parentId === "root") {
      conditions.push(isNull(categories.parentId));
    } else if (parentId) {
      conditions.push(eq(categories.parentId, parentId));
    }
    
    if (featured) {
      conditions.push(eq(categories.isFeatured, true));
    }

    // Execute query
    const offset = (page - 1) * limit;

    // Define valid sort columns
    const sortColumns = {
      sortOrder: categories.sortOrder,
      name: categories.name,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      level: categories.level,
    } as const;

    const sortColumn = sortColumns[sortBy as keyof typeof sortColumns] ?? categories.sortOrder;
    
    const result = await db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    const total = Number(countResult[0]?.count || 0);

    // If tree structure is requested, build hierarchical data
    if (tree) {
      const allCategories = await db
        .select()
        .from(categories)
        .where(!includeInactive ? eq(categories.isActive, true) : undefined)
        .orderBy(asc(categories.sortOrder));

      const categoryTree = buildCategoryTree(allCategories);
      
      return NextResponse.json({
        success: true,
        data: categoryTree,
        meta: {
          total: allCategories.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
// Only super_admin and admin can create categories
export async function POST(request: NextRequest) {
  try {
    // Check authorization - only admins can create categories
    const authResult = await requireRoles(ROLES.ADMINS);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = createCategorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingCategory = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.slug, data.slug))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 409 }
      );
    }

    // Calculate level based on parent
    let level = 0;
    if (data.parentId) {
      const parentCategory = await db
        .select({ level: categories.level })
        .from(categories)
        .where(eq(categories.categoryId, data.parentId))
        .limit(1);

      if (parentCategory.length === 0) {
        return NextResponse.json(
          { success: false, error: "Parent category not found" },
          { status: 404 }
        );
      }
      level = parentCategory[0].level + 1;
    }

    // Create category
    const newCategory = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        icon: data.icon || null,
        parentId: data.parentId || null,
        level,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newCategory[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// Helper function to build category tree
function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildCategoryTree(categories, cat.categoryId),
    }));
}