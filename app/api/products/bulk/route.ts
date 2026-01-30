// File: app/api/products/bulk/route.ts

import { NextRequest, NextResponse } from "next/server";
import { inArray, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";

// PATCH /api/products/bulk - Bulk update products
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one ID is required" },
        { status: 400 }
      );
    }

    // Handle different bulk actions
    switch (action) {
      case "updateStatus": {
        if (!data?.status) {
          return NextResponse.json(
            { success: false, error: "Status is required" },
            { status: 400 }
          );
        }

        await db
          .update(products)
          .set({ status: data.status, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products status updated to ${data.status}`,
        });
      }

      case "activate": {
        await db
          .update(products)
          .set({ isActive: true, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products activated`,
        });
      }

      case "deactivate": {
        await db
          .update(products)
          .set({ isActive: false, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products deactivated`,
        });
      }

      case "feature": {
        await db
          .update(products)
          .set({ isFeatured: true, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products marked as featured`,
        });
      }

      case "unfeature": {
        await db
          .update(products)
          .set({ isFeatured: false, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products unmarked as featured`,
        });
      }

      case "updateCategory": {
        if (!data?.categoryId) {
          return NextResponse.json(
            { success: false, error: "Category ID is required" },
            { status: 400 }
          );
        }

        await db
          .update(products)
          .set({ categoryId: data.categoryId, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products moved to new category`,
        });
      }

      case "updateBrand": {
        await db
          .update(products)
          .set({ brandId: data?.brandId || null, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products brand updated`,
        });
      }

      case "updateStock": {
        if (data?.stockQuantity === undefined) {
          return NextResponse.json(
            { success: false, error: "Stock quantity is required" },
            { status: 400 }
          );
        }

        await db
          .update(products)
          .set({ stockQuantity: data.stockQuantity, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products stock updated`,
        });
      }

      case "applyDiscount": {
        if (!data?.discountPercent || data.discountPercent <= 0 || data.discountPercent > 100) {
          return NextResponse.json(
            { success: false, error: "Valid discount percent (1-100) is required" },
            { status: 400 }
          );
        }

        // Get products and apply discount
        const productsToUpdate = await db
          .select({ productId: products.productId, originalPrice: products.originalPrice })
          .from(products)
          .where(inArray(products.productId, ids));

        for (const product of productsToUpdate) {
          const originalPrice = parseFloat(product.originalPrice);
          const salePrice = originalPrice * (1 - data.discountPercent / 100);
          
          await db
            .update(products)
            .set({ salePrice: salePrice.toFixed(2), updatedAt: new Date() })
            .where(eq(products.productId, product.productId));
        }

        return NextResponse.json({
          success: true,
          message: `${data.discountPercent}% discount applied to ${ids.length} products`,
        });
      }

      case "removeDiscount": {
        await db
          .update(products)
          .set({ salePrice: null, updatedAt: new Date() })
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `Discount removed from ${ids.length} products`,
        });
      }

      default: {
        // Generic bulk update
        if (!data || Object.keys(data).length === 0) {
          return NextResponse.json(
            { success: false, error: "Update data is required" },
            { status: 400 }
          );
        }

        const updateData: any = { updatedAt: new Date() };

        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.brandId !== undefined) updateData.brandId = data.brandId;

        await db
          .update(products)
          .set(updateData)
          .where(inArray(products.productId, ids));

        return NextResponse.json({
          success: true,
          message: `${ids.length} products updated`,
        });
      }
    }
  } catch (error) {
    console.error("Error in bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/bulk - Bulk delete products
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one ID is required" },
        { status: 400 }
      );
    }

    // Delete products (cascades to variants, specs, etc.)
    await db.delete(products).where(inArray(products.productId, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} products deleted successfully`,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk delete" },
      { status: 500 }
    );
  }
}