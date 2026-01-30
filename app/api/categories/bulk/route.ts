// File: app/api/categories/bulk/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

// Validation schema for bulk operations
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
  data: z.object({
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    parentId: z.string().uuid().nullable().optional(),
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

// PATCH /api/categories/bulk - Bulk update categories
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

      // Update each category's sort order
      const updatePromises = items.map((item) =>
        db
          .update(categories)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
          .where(eq(categories.categoryId, item.id))
      );

      await Promise.all(updatePromises);

      return NextResponse.json({
        success: true,
        message: `${items.length} categories reordered successfully`,
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
    if (data.parentId !== undefined) updateData.parentId = data.parentId;

    // Update categories
    await db
      .update(categories)
      .set(updateData)
      .where(inArray(categories.categoryId, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} categories updated successfully`,
    });
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/bulk - Bulk delete categories
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

    // Check for child categories
    const childCategories = await db
      .select({ categoryId: categories.categoryId, parentId: categories.parentId })
      .from(categories)
      .where(inArray(categories.parentId, ids));

    // Filter out children that are also being deleted
    const orphanedChildren = childCategories.filter(
      (child) => !ids.includes(child.categoryId)
    );

    if (orphanedChildren.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some categories have child categories that would be orphaned",
          orphanedCount: orphanedChildren.length,
          hint: "Either include child categories in the deletion or reassign them first",
        },
        { status: 400 }
      );
    }

    // Delete categories
    await db.delete(categories).where(inArray(categories.categoryId, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} categories deleted successfully`,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk delete" },
      { status: 500 }
    );
  }
}