// File: app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";

// Validation schema for updating a category
const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(150).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  icon: z.string().max(100).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id] - Get a single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get("includeChildren") === "true";
    const includeParent = searchParams.get("includeParent") === "true";

    // Fetch category by ID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const category = await db
      .select()
      .from(categories)
      .where(isUUID ? eq(categories.categoryId, id) : eq(categories.slug, id))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const result: any = { ...category[0] };

    // Include children if requested
    if (includeChildren) {
      const children = await db
        .select()
        .from(categories)
        .where(eq(categories.parentId, category[0].categoryId));
      result.children = children;
    }

    // Include parent if requested
    if (includeParent && category[0].parentId) {
      const parent = await db
        .select()
        .from(categories)
        .where(eq(categories.categoryId, category[0].parentId))
        .limit(1);
      result.parent = parent[0] || null;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateCategorySchema.safeParse(body);

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

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, id))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // If slug is being updated, check for duplicates
    if (data.slug && data.slug !== existingCategory[0].slug) {
      const duplicateSlug = await db
        .select({ slug: categories.slug })
        .from(categories)
        .where(eq(categories.slug, data.slug))
        .limit(1);

      if (duplicateSlug.length > 0) {
        return NextResponse.json(
          { success: false, error: "Category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If parentId is being updated, calculate new level and prevent circular reference
    let level = existingCategory[0].level;
    if (data.parentId !== undefined) {
      // Prevent setting itself as parent
      if (data.parentId === id) {
        return NextResponse.json(
          { success: false, error: "Category cannot be its own parent" },
          { status: 400 }
        );
      }

      if (data.parentId === null) {
        level = 0;
      } else {
        // Check if new parent exists and is not a descendant
        const newParent = await db
          .select()
          .from(categories)
          .where(eq(categories.categoryId, data.parentId))
          .limit(1);

        if (newParent.length === 0) {
          return NextResponse.json(
            { success: false, error: "Parent category not found" },
            { status: 404 }
          );
        }

        // Check for circular reference (new parent should not be a descendant)
        const isDescendant = await checkIsDescendant(data.parentId, id);
        if (isDescendant) {
          return NextResponse.json(
            { success: false, error: "Cannot set a descendant as parent (circular reference)" },
            { status: 400 }
          );
        }

        level = newParent[0].level + 1;
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image || null;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
      updateData.level = level;
    }
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    // Update category
    const updatedCategory = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.categoryId, id))
      .returning();

    // If parent changed, update children levels recursively
    if (data.parentId !== undefined && data.parentId !== existingCategory[0].parentId) {
      await updateChildrenLevels(id, level + 1);
    }

    return NextResponse.json({ success: true, data: updatedCategory[0] });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cascade = searchParams.get("cascade") === "true";
    const reassignTo = searchParams.get("reassignTo");

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, id))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check for child categories
    const children = await db
      .select({ categoryId: categories.categoryId })
      .from(categories)
      .where(eq(categories.parentId, id));

    if (children.length > 0) {
      if (cascade) {
        // Delete all children recursively
        await deleteChildrenRecursively(id);
      } else if (reassignTo) {
        // Reassign children to another parent
        const newParent = reassignTo === "null" ? null : reassignTo;
        
        if (newParent) {
          const parentExists = await db
            .select({ categoryId: categories.categoryId })
            .from(categories)
            .where(eq(categories.categoryId, newParent))
            .limit(1);

          if (parentExists.length === 0) {
            return NextResponse.json(
              { success: false, error: "Reassign target category not found" },
              { status: 404 }
            );
          }
        }

        await db
          .update(categories)
          .set({ 
            parentId: newParent,
            level: newParent ? (await getParentLevel(newParent)) + 1 : 0,
            updatedAt: new Date(),
          })
          .where(eq(categories.parentId, id));
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Category has child categories. Use cascade=true to delete all, or reassignTo=<categoryId|null> to reassign children.",
            childCount: children.length,
          },
          { status: 400 }
        );
      }
    }

    // Delete the category
    await db.delete(categories).where(eq(categories.categoryId, id));

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// Helper function to check if a category is a descendant of another
async function checkIsDescendant(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
  const children = await db
    .select({ categoryId: categories.categoryId })
    .from(categories)
    .where(eq(categories.parentId, ancestorId));

  for (const child of children) {
    if (child.categoryId === potentialDescendantId) {
      return true;
    }
    const isDescendant = await checkIsDescendant(potentialDescendantId, child.categoryId);
    if (isDescendant) {
      return true;
    }
  }

  return false;
}

// Helper function to update children levels recursively
async function updateChildrenLevels(parentId: string, newLevel: number): Promise<void> {
  const children = await db
    .select({ categoryId: categories.categoryId })
    .from(categories)
    .where(eq(categories.parentId, parentId));

  for (const child of children) {
    await db
      .update(categories)
      .set({ level: newLevel, updatedAt: new Date() })
      .where(eq(categories.categoryId, child.categoryId));

    await updateChildrenLevels(child.categoryId, newLevel + 1);
  }
}

// Helper function to delete children recursively
async function deleteChildrenRecursively(parentId: string): Promise<void> {
  const children = await db
    .select({ categoryId: categories.categoryId })
    .from(categories)
    .where(eq(categories.parentId, parentId));

  for (const child of children) {
    await deleteChildrenRecursively(child.categoryId);
    await db.delete(categories).where(eq(categories.categoryId, child.categoryId));
  }
}

// Helper function to get parent level
async function getParentLevel(parentId: string): Promise<number> {
  const parent = await db
    .select({ level: categories.level })
    .from(categories)
    .where(eq(categories.categoryId, parentId))
    .limit(1);
  return parent[0]?.level ?? -1;
}