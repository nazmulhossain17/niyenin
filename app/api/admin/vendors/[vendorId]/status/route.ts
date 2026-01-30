// ========================================
// app/api/admin/vendors/[vendorId]/status/route.ts
// Admin Vendor Status API - Approve, Reject, Suspend
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ vendorId: string }>;
};

// Helper to check if user is admin
async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const role = session.user.role;
  return role === "admin" || role === "super_admin";
}

// Validation schema for status change
const statusChangeSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "unsuspend"]),
  reason: z.string().max(1000).optional(),
  commissionRate: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

// PATCH /api/admin/vendors/[vendorId]/status - Change vendor status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { vendorId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!await isAdmin(session)) {
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

    const body = await request.json();
    const validationResult = statusChangeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, reason, commissionRate } = validationResult.data;

    let updateData: Partial<typeof vendors.$inferInsert> = {
      updatedAt: new Date(),
    };

    switch (action) {
      case "approve":
        if (existingVendor.status !== "pending") {
          return NextResponse.json(
            { success: false, error: "Can only approve pending vendors" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "approved",
          approvedAt: new Date(),
          approvedBy: session!.user.id,
          rejectionReason: null,
          commissionRate: commissionRate || "10.00", // Default 10% commission
        };
        break;

      case "reject":
        if (existingVendor.status !== "pending") {
          return NextResponse.json(
            { success: false, error: "Can only reject pending vendors" },
            { status: 400 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "rejected",
          rejectionReason: reason,
        };
        // Revert user role to customer
        await db
          .update(user)
          .set({ role: "customer" })
          .where(eq(user.id, existingVendor.userId));
        break;

      case "suspend":
        if (existingVendor.status !== "approved") {
          return NextResponse.json(
            { success: false, error: "Can only suspend approved vendors" },
            { status: 400 }
          );
        }
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Suspension reason is required" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "suspended",
          rejectionReason: reason,
        };
        break;

      case "unsuspend":
        if (existingVendor.status !== "suspended") {
          return NextResponse.json(
            { success: false, error: "Can only unsuspend suspended vendors" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "approved",
          rejectionReason: null,
        };
        break;
    }

    const [updatedVendor] = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    // Map action to success message
    const messages: Record<string, string> = {
      approve: "Vendor approved successfully",
      reject: "Vendor rejected",
      suspend: "Vendor suspended",
      unsuspend: "Vendor suspension lifted",
    };

    return NextResponse.json({
      success: true,
      message: messages[action],
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vendor status" },
      { status: 500 }
    );
  }
}