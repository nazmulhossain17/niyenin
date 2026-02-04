// ========================================
// File: app/api/admin/vendors/[vendorId]/verify/route.ts
// Admin Vendor Verification API
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

// POST /api/admin/vendors/[vendorId]/verify - Toggle verification
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

    // Only allow verification for approved vendors
    if (existingVendor.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Can only verify approved vendors" },
        { status: 400 }
      );
    }

    // Toggle verification status
    const newVerifiedStatus = !existingVendor.isVerified;

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        isVerified: newVerifiedStatus,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return NextResponse.json({
      success: true,
      message: newVerifiedStatus
        ? "Vendor verified successfully"
        : "Vendor verification removed",
      data: {
        vendorId: updatedVendor.vendorId,
        shopName: updatedVendor.shopName,
        isVerified: updatedVendor.isVerified,
      },
    });
  } catch (error) {
    console.error("Error toggling vendor verification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update verification status" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vendors/[vendorId]/verify - Set verification status explicitly
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
    const { isVerified } = body;

    if (typeof isVerified !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isVerified must be a boolean" },
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
        { success: false, error: "Can only verify approved vendors" },
        { status: 400 }
      );
    }

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        isVerified,
        updatedAt: new Date(),
      })
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    return NextResponse.json({
      success: true,
      message: isVerified
        ? "Vendor verified successfully"
        : "Vendor verification removed",
      data: {
        vendorId: updatedVendor.vendorId,
        shopName: updatedVendor.shopName,
        isVerified: updatedVendor.isVerified,
      },
    });
  } catch (error) {
    console.error("Error setting vendor verification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update verification status" },
      { status: 500 }
    );
  }
}