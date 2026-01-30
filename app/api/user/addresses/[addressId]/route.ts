// ========================================
// app/api/user/addresses/[addressId]/route.ts
// User Addresses API - Get, Update, Delete single address
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userAddresses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema for updating an address
const updateAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  district: z.string().min(1).max(100).optional(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

type RouteParams = {
  params: Promise<{ addressId: string }>;
};

// GET /api/user/addresses/[addressId] - Get a single address
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { addressId } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [address] = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.addressId, addressId),
          eq(userAddresses.userId, session.user.id)
        )
      );

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}

// PUT /api/user/addresses/[addressId] - Update an address
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { addressId } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if address exists and belongs to user
    const [existingAddress] = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.addressId, addressId),
          eq(userAddresses.userId, session.user.id)
        )
      );

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateAddressSchema.safeParse(body);

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

    const data = validationResult.data;

    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, session.user.id));
    }

    const [updatedAddress] = await db
      .update(userAddresses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userAddresses.addressId, addressId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/addresses/[addressId] - Delete an address
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { addressId } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if address exists and belongs to user
    const [existingAddress] = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.addressId, addressId),
          eq(userAddresses.userId, session.user.id)
        )
      );

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    await db
      .delete(userAddresses)
      .where(eq(userAddresses.addressId, addressId));

    // If deleted address was default, make the first remaining address default
    if (existingAddress.isDefault) {
      const [firstAddress] = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userId, session.user.id))
        .limit(1);

      if (firstAddress) {
        await db
          .update(userAddresses)
          .set({ isDefault: true })
          .where(eq(userAddresses.addressId, firstAddress.addressId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 }
    );
  }
}