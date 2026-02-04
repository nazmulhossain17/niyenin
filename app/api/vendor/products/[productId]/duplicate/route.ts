// ========================================
// File: app/api/vendor/products/[productId]/duplicate/route.ts
// Vendor Product Duplicate API
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { products, vendors } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

type RouteParams = {
  params: Promise<{ productId: string }>;
};

// Helper to get vendor for current user
async function getVendorForUser(userId: string) {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.userId, userId), eq(vendors.status, "approved")));
  return vendor;
}

// Helper to generate slug
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    nanoid(6)
  );
}

// POST /api/vendor/products/[productId]/duplicate - Duplicate a product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await getVendorForUser(session.user.id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor account not found or not approved" },
        { status: 403 }
      );
    }

    // Get original product - must belong to this vendor
    const [originalProduct] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productId, productId),
          eq(products.vendorId, vendor.vendorId)
        )
      );

    if (!originalProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Create duplicated product
    const newName = `${originalProduct.name} (Copy)`;
    const [newProduct] = await db
      .insert(products)
      .values({
        vendorId: vendor.vendorId,
        categoryId: originalProduct.categoryId,
        brandId: originalProduct.brandId,
        name: newName,
        slug: generateSlug(newName),
        sku: originalProduct.sku ? `${originalProduct.sku}-COPY` : null,
        description: originalProduct.description,
        shortDescription: originalProduct.shortDescription,
        mainImage: originalProduct.mainImage,
        images: originalProduct.images,
        originalPrice: originalProduct.originalPrice,
        salePrice: originalProduct.salePrice,
        costPrice: originalProduct.costPrice,
        stockQuantity: originalProduct.stockQuantity,
        lowStockThreshold: originalProduct.lowStockThreshold,
        weight: originalProduct.weight,
        length: originalProduct.length,
        width: originalProduct.width,
        height: originalProduct.height,
        metaTitle: originalProduct.metaTitle,
        metaDescription: originalProduct.metaDescription,
        tags: originalProduct.tags,
        status: "draft", // Always create as draft
        isActive: false,
        isFeatured: false,
        isFlashDeal: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Product duplicated successfully as draft",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error duplicating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to duplicate product" },
      { status: 500 }
    );
  }
}