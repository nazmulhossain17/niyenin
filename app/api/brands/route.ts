// ========================================
// File: app/api/brands/route.ts
// Brands API - List and Create Brands
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { brands } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, asc, ilike, and, count, SQL } from "drizzle-orm";
import { z } from "zod";

// Helper to check admin access
const isAdmin = (role: string) => role === "admin" || role === "super_admin";

// ============================================
// GET - List all brands
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: SQL<unknown>[] = [];

    if (search) {
      conditions.push(ilike(brands.name, `%${search}%`));
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      conditions.push(eq(brands.isActive, isActive === "true"));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(brands)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult?.count || 0;

    // Determine sort column
    const sortColumn = sortBy === "createdAt" ? brands.createdAt : brands.name;
    const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Get brands
    const brandsList = await db
      .select()
      .from(brands)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: brandsList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create a new brand (Admin only)
// ============================================
const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
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
    const validatedData = createBrandSchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || 
      validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Check if brand with same name or slug exists
    const [existingBrand] = await db
      .select()
      .from(brands)
      .where(eq(brands.slug, slug));

    if (existingBrand) {
      return NextResponse.json(
        { success: false, error: "Brand with this name already exists" },
        { status: 400 }
      );
    }

    // Create brand
    const [newBrand] = await db
      .insert(brands)
      .values({
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        logo: validatedData.logo || null,
        website: validatedData.website || null,
        isActive: validatedData.isActive ?? true,
        isFeatured: validatedData.isFeatured ?? false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newBrand,
      message: "Brand created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 }
    );
  }
}