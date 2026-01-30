// File: app/api/brands/bulk/route.ts

import { NextRequest, NextResponse } from "next/server";
import { inArray, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { brands } from "@/db/schema";

// Validation schema for bulk operations
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
  data: z.object({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    })
  ),
});

// PATCH /api/brands/bulk - Bulk update brands
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "reorder") {
      // Handle reordering
      const validationResult = reorderSchema.safeParse(body);

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

      const { items } = validationResult.data;

      // Update each brand's sort order
      const updatePromises = items.map((item) =>
        db
          .update(brands)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(brands.brandId, item.id))
      );

      await Promise.all(updatePromises);

      return NextResponse.json({
        success: true,
        message: `${items.length} brands reordered successfully`,
      });
    }

    // Handle bulk update
    const validationResult = bulkUpdateSchema.safeParse(body);

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

    const { ids, data } = validationResult.data;

    // Build update object
    const updateData: any = { updatedAt: new Date() };

    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    // Update brands
    await db
      .update(brands)
      .set(updateData)
      .where(inArray(brands.brandId, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} brands updated successfully`,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/bulk - Bulk delete brands
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = bulkDeleteSchema.safeParse(body);

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

    const { ids } = validationResult.data;

    // Delete brands (products will have brandId set to null due to ON DELETE SET NULL)
    await db.delete(brands).where(inArray(brands.brandId, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} brands deleted successfully`,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk delete" },
      { status: 500 }
    );
  }
}