// ========================================
// File: app/api/categories/route.ts
// Categories API - List and Create Categories
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, asc, ilike, and, count, isNull, SQL } from "drizzle-orm";
import { z } from "zod";

// Helper to check admin access
const isAdmin = (role: string) => role === "admin" || role === "super_admin";

// ============================================
// GET - List all categories
// ============================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");
    const tree = searchParams.get("tree") === "true";
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(ilike(categories.name, `%${search}%`));
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(categories.isActive, isActive === "true"));
    }

    if (parentId === "null" || parentId === "") {
      conditions.push(isNull(categories.parentId));
    } else if (parentId) {
      conditions.push(eq(categories.parentId, parentId));
    }

    if (level !== null && level !== undefined && level !== "") {
      conditions.push(eq(categories.level, parseInt(level)));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult?.count || 0;

    // Determine sort column
    let sortColumn;
    switch (sortBy) {
      case "name":
        sortColumn = categories.name;
        break;
      case "createdAt":
        sortColumn = categories.createdAt;
        break;
      default:
        sortColumn = categories.sortOrder;
    }
    const orderByClause = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Get categories
    const categoriesList = await db
      .select()
      .from(categories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // If tree format is requested, build hierarchical structure
    if (tree) {
      const buildTree = (items: typeof categoriesList, parentId: string | null = null): any[] => {
        return items
          .filter((item) => item.parentId === parentId)
          .map((item) => ({
            ...item,
            children: buildTree(items, item.categoryId),
          }));
      };

      // Get all categories for tree building
      const allCategories = await db
        .select()
        .from(categories)
        .where(isActive === "true" ? eq(categories.isActive, true) : undefined)
        .orderBy(asc(categories.sortOrder));

      const treeData = buildTree(allCategories);

      return NextResponse.json({
        success: true,
        data: treeData,
        meta: {
          total: allCategories.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: categoriesList,
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

// ============================================
// POST - Create a new category (Admin only)
// ============================================
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().url().optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Generate slug if not provided
    const slug =
      validatedData.slug ||
      validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check if category with same slug exists
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    // Determine level based on parent
    let level = 0;
    if (validatedData.parentId) {
      const [parentCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.categoryId, validatedData.parentId));

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: "Parent category not found" },
          { status: 400 }
        );
      }
      level = parentCategory.level + 1;
    }

    // Create category
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        icon: validatedData.icon || null,
        parentId: validatedData.parentId || null,
        level,
        sortOrder: validatedData.sortOrder ?? 0,
        isActive: validatedData.isActive ?? true,
        isFeatured: validatedData.isFeatured ?? false,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}