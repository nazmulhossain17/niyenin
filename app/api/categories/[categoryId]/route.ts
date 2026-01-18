// ========================================
// app/api/categories/[categoryId]/route.ts - Single Category API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAdmin,
  generateSlug,
} from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

// GET /api/categories/[categoryId] - Get a single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { categoryId } = await params;

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);

    if (category.length === 0) {
      return errorResponse("Category not found", 404);
    }

    // Get subcategories
    const subcategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, categoryId));

    return successResponse({
      ...category[0],
      subcategories,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return errorResponse("Failed to fetch category", 500);
  }
}

// PUT /api/categories/[categoryId] - Update a category (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { categoryId } = await params;
    const body = await request.json();

    const {
      name,
      description,
      image,
      icon,
      parentId,
      sortOrder,
      isActive,
      isFeatured,
      metaTitle,
      metaDescription,
    } = body;

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return errorResponse("Category not found", 404);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
      // Update slug if name changed
      if (name !== existingCategory[0].name) {
        updateData.slug = generateSlug(name);
      }
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (icon !== undefined) updateData.icon = icon;
    if (parentId !== undefined) {
      updateData.parentId = parentId;
      // Recalculate level
      if (parentId) {
        const parentCategory = await db
          .select()
          .from(categories)
          .where(eq(categories.categoryId, parentId))
          .limit(1);
        updateData.level = parentCategory.length > 0 ? parentCategory[0].level + 1 : 0;
      } else {
        updateData.level = 0;
      }
    }
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    const updatedCategory = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.categoryId, categoryId))
      .returning();

    return successResponse(updatedCategory[0], "Category updated successfully");
  } catch (error) {
    console.error("Error updating category:", error);
    return errorResponse("Failed to update category", 500);
  }
}

// DELETE /api/categories/[categoryId] - Delete a category (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { categoryId } = await params;

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return errorResponse("Category not found", 404);
    }

    // Check if category has subcategories
    const subcategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, categoryId))
      .limit(1);

    if (subcategories.length > 0) {
      return errorResponse(
        "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
        400
      );
    }

    await db.delete(categories).where(eq(categories.categoryId, categoryId));

    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse("Failed to delete category", 500);
  }
}
