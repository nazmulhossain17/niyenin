// ========================================
// File: app/api/admin/vendors/[vendorId]/status/route.ts
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
  adminNotes: z.string().max(1000).optional(),
  commissionRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
});

// PATCH /api/admin/vendors/[vendorId]/status - Change vendor status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { action, reason, adminNotes, commissionRate } = validationResult.data;
    const adminId = session!.user.id;
    const now = new Date();

    let updateData: Partial<typeof vendors.$inferInsert> = {
      updatedAt: now,
    };

    switch (action) {
      case "approve":
        // Can approve pending, rejected, or suspended vendors
        if (!["pending", "rejected", "suspended"].includes(existingVendor.status)) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot approve vendor with status: ${existingVendor.status}`,
            },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "approved",
          approvedAt: now,
          approvedBy: adminId,
          rejectionReason: null,
          adminNotes: adminNotes || existingVendor.adminNotes,
          commissionRate: commissionRate || existingVendor.commissionRate || "10.00",
        };
        // Update user role to vendor
        await db
          .update(user)
          .set({ role: "vendor" })
          .where(eq(user.id, existingVendor.userId));
        break;

      case "reject":
        if (existingVendor.status !== "pending") {
          return NextResponse.json(
            { success: false, error: "Can only reject pending vendors" },
            { status: 400 }
          );
        }
        if (!reason && !adminNotes) {
          return NextResponse.json(
            { success: false, error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "rejected",
          rejectionReason: reason || adminNotes || "Application rejected by admin",
          adminNotes: adminNotes || reason,
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
        if (!reason && !adminNotes) {
          return NextResponse.json(
            { success: false, error: "Suspension reason is required" },
            { status: 400 }
          );
        }
        updateData = {
          ...updateData,
          status: "suspended",
          rejectionReason: reason || adminNotes || "Account suspended by admin",
          adminNotes: adminNotes || reason,
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
          adminNotes: adminNotes || existingVendor.adminNotes,
        };
        break;
    }

    const [updatedVendor] = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.vendorId, vendorId))
      .returning();

    // Get updated vendor with user info
    const [vendorWithUser] = await db
      .select({
        vendorId: vendors.vendorId,
        shopName: vendors.shopName,
        status: vendors.status,
        isVerified: vendors.isVerified,
        isFeatured: vendors.isFeatured,
        adminNotes: vendors.adminNotes,
        rejectionReason: vendors.rejectionReason,
        approvedAt: vendors.approvedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(vendors)
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(eq(vendors.vendorId, vendorId));

    // Map action to success message
    const messages: Record<string, string> = {
      approve: "Vendor approved successfully",
      reject: "Vendor application rejected",
      suspend: "Vendor account suspended",
      unsuspend: "Vendor suspension lifted",
    };

    return NextResponse.json({
      success: true,
      message: messages[action],
      data: vendorWithUser,
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vendor status" },
      { status: 500 }
    );
  }
}

// GET /api/admin/vendors/[vendorId]/status - Get vendor status history (optional)
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const [vendor] = await db
      .select({
        vendorId: vendors.vendorId,
        shopName: vendors.shopName,
        status: vendors.status,
        approvedAt: vendors.approvedAt,
        approvedBy: vendors.approvedBy,
        rejectionReason: vendors.rejectionReason,
        adminNotes: vendors.adminNotes,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
      })
      .from(vendors)
      .where(eq(vendors.vendorId, vendorId));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Build status timeline
    const timeline = [
      {
        status: "pending",
        date: vendor.createdAt,
        description: "Application submitted",
      },
    ];

    if (vendor.status === "approved" && vendor.approvedAt) {
      timeline.push({
        status: "approved",
        date: vendor.approvedAt,
        description: "Application approved",
      });
    }

    if (vendor.status === "rejected") {
      timeline.push({
        status: "rejected",
        date: vendor.updatedAt,
        description: vendor.rejectionReason || "Application rejected",
      });
    }

    if (vendor.status === "suspended") {
      timeline.push({
        status: "suspended",
        date: vendor.updatedAt,
        description: vendor.rejectionReason || "Account suspended",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: vendor.status,
        adminNotes: vendor.adminNotes,
        timeline,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendor status" },
      { status: 500 }
    );
  }
}