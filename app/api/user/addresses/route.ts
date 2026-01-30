// ========================================
// app/api/user/addresses/route.ts
// User Addresses API - List & Create
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userAddresses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema for creating an address
const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(1, "Full name is required").max(100),
  phone: z.string().min(1, "Phone is required").max(20),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required").max(100),
  district: z.string().min(1, "District is required").max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).default("Bangladesh"),
  isDefault: z.boolean().default(false),
});

// GET /api/user/addresses - Get all addresses for current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, session.user.id))
      .orderBy(userAddresses.isDefault, userAddresses.createdAt);

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createAddressSchema.safeParse(body);

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

    // If this is set as default, unset other default addresses
    if (data.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, session.user.id));
    }

    // Check if this is the first address, make it default
    const existingAddresses = await db
      .select({ count: userAddresses.addressId })
      .from(userAddresses)
      .where(eq(userAddresses.userId, session.user.id));

    const isFirstAddress = existingAddresses.length === 0;

    const [newAddress] = await db
      .insert(userAddresses)
      .values({
        userId: session.user.id,
        label: data.label,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        district: data.district,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault || isFirstAddress,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create address" },
      { status: 500 }
    );
  }
}