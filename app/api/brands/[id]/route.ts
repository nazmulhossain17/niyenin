// File: app/api/brands/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { brands, products } from "@/db/schema";

// Validation schema for updating a brand
const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(150).optional(),
  description: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable().or(z.literal("")),
  website: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/brands/[id] - Get a single brand
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeProductCount = searchParams.get("includeProductCount") === "true";

    // Fetch brand by ID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const brand = await db
      .select()
      .from(brands)
      .where(isUUID ? eq(brands.brandId, id) : eq(brands.slug, id))
      .limit(1);

    if (brand.length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    const result: any = { ...brand[0] };

    // Include product count if requested
    if (includeProductCount) {
      const productCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.brandId, brand[0].brandId));
      result.productCount = Number(productCount[0]?.count || 0);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[id] - Update a brand
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateBrandSchema.safeParse(body);

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

    // Check if brand exists
    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.brandId, id))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // If slug is being updated, check for duplicates
    if (data.slug && data.slug !== existingBrand[0].slug) {
      const duplicateSlug = await db
        .select({ slug: brands.slug })
        .from(brands)
        .where(eq(brands.slug, data.slug))
        .limit(1);

      if (duplicateSlug.length > 0) {
        return NextResponse.json(
          { success: false, error: "Brand with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logo !== undefined) updateData.logo = data.logo || null;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Update brand
    const updatedBrand = await db
      .update(brands)
      .set(updateData)
      .where(eq(brands.brandId, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedBrand[0] });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete a brand
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Check if brand exists
    const existingBrand = await db
      .select()
      .from(brands)
      .where(eq(brands.brandId, id))
      .limit(1);

    if (existingBrand.length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check for associated products
    const productCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.brandId, id));

    const count = Number(productCount[0]?.count || 0);

    if (count > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          error: `Brand has ${count} associated products. Use force=true to delete anyway (products will have null brand).`,
          productCount: count,
        },
        { status: 400 }
      );
    }

    // Delete the brand (products.brandId will be set to null due to ON DELETE SET NULL)
    await db.delete(brands).where(eq(brands.brandId, id));

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
      ...(count > 0 && { note: `${count} products were disassociated from this brand` }),
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}

// PATCH /api/brands/[id] - Partial update (same as PUT but more semantic)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params });
}