// ========================================
// File: app/api/admin/vendors/[vendorId]/feature/route.ts
// Admin Vendor Feature API
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ vendorId: string }>;
};

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// POST /api/admin/vendors/[vendorId]/feature - Toggle featured status
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Only allow featuring approved vendors
    if (existingVendor.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Can only feature approved vendors" },
        { status: 400 }
      );
    }

    // Toggle featured status
    const newFeaturedStatus = !existingVendor.isFeatured;

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        isFeatured: newFeaturedStatus,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return NextResponse.json({
      success: true,
      message: newFeaturedStatus
        ? "Vendor featured successfully"
        : "Vendor removed from featured",
      data: {
        vendorId: updatedVendor.vendorId,
        shopName: updatedVendor.shopName,
        isFeatured: updatedVendor.isFeatured,
      },
    });
  } catch (error) {
    console.error("Error toggling vendor featured status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vendors/[vendorId]/feature - Set featured status explicitly
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isFeatured } = body;

    if (typeof isFeatured !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isFeatured must be a boolean" },
        { status: 400 }
      );
    }

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    if (existingVendor.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Can only feature approved vendors" },
        { status: 400 }
      );
    }

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return NextResponse.json({
      success: true,
      message: isFeatured
        ? "Vendor featured successfully"
        : "Vendor removed from featured",
      data: {
        vendorId: updatedVendor.vendorId,
        shopName: updatedVendor.shopName,
        isFeatured: updatedVendor.isFeatured,
      },
    });
  } catch (error) {
    console.error("Error setting vendor featured status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}