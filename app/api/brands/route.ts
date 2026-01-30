// File: app/api/brands/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, desc, asc, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { brands } from "@/db/schema";
import { db } from "@/db/drizzle";
import { requireRoles, ROLES } from "@/lib/api/auth-guard";

// Validation schema for creating a brand
const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(150),
  description: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// GET /api/brands - Get all brands (Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const includeInactive = searchParams.get("includeInactive") === "true";
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build query conditions
    const conditions = [];

    if (!includeInactive) {
      conditions.push(eq(brands.isActive, true));
    }

    if (featured) {
      conditions.push(eq(brands.isFeatured, true));
    }

    if (search) {
      conditions.push(
        or(
          ilike(brands.name, `%${search}%`),
          ilike(brands.slug, `%${search}%`),
          ilike(brands.description, `%${search}%`)
        )
      );
    }

    // Execute query
    const offset = (page - 1) * limit;

    // Define valid sort columns
    const sortColumns = {
      sortOrder: brands.sortOrder,
      name: brands.name,
      createdAt: brands.createdAt,
      updatedAt: brands.updatedAt,
    } as const;

    const sortColumn = sortColumns[sortBy as keyof typeof sortColumns] ?? brands.sortOrder;

    const result = await db
      .select()
      .from(brands)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(brands)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    const total = Number(countResult[0]?.count || 0);

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
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand
// Only super_admin and admin can create brands
export async function POST(request: NextRequest) {
  try {
    // Check authorization - only admins can create brands
    const authResult = await requireRoles(ROLES.ADMINS);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createBrandSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if slug already exists
    const existingBrand = await db
      .select({ slug: brands.slug })
      .from(brands)
      .where(eq(brands.slug, data.slug))
      .limit(1);

    if (existingBrand.length > 0) {
      return NextResponse.json(
        { success: false, error: "Brand with this slug already exists" },
        { status: 409 }
      );
    }

    // Create brand
    const newBrand = await db
      .insert(brands)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: newBrand[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create brand" },
      { status: 500 }
    );
  }
}