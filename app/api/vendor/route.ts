// ========================================
// app/api/vendor/route.ts
// Vendor API - Register & Get Current Vendor Profile
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema for vendor registration
const registerVendorSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(150),
  shopSlug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(2000).optional(),
  logo: z.string().url().max(500).optional(),
  banner: z.string().url().max(500).optional(),
  businessName: z.string().max(200).optional(),
  businessRegistrationNo: z.string().max(100).optional(),
  taxId: z.string().max(100).optional(),
  businessEmail: z.string().email().max(100).optional(),
  businessPhone: z.string().max(20).optional(),
  businessAddress: z.string().max(500).optional(),
  returnPolicy: z.string().max(5000).optional(),
  shippingPolicy: z.string().max(5000).optional(),
});

// Helper function to generate slug from shop name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/vendor - Get current user's vendor profile
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

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendor profile" },
      { status: 500 }
    );
  }
}

// POST /api/vendor - Register as a vendor
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

    // Check if user is already a vendor
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (existingVendor) {
      return NextResponse.json(
        { success: false, error: "You are already registered as a vendor" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Auto-generate slug if not provided
    if (!body.shopSlug && body.shopName) {
      body.shopSlug = generateSlug(body.shopName);
    }

    const validationResult = registerVendorSchema.safeParse(body);

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

    // Check if shop slug is already taken
    const [existingSlug] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.shopSlug, data.shopSlug));

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Shop slug is already taken" },
        { status: 400 }
      );
    }

    // Create vendor profile
    const [newVendor] = await db
      .insert(vendors)
      .values({
        userId: session.user.id,
        shopName: data.shopName,
        shopSlug: data.shopSlug,
        description: data.description,
        logo: data.logo,
        banner: data.banner,
        businessName: data.businessName,
        businessRegistrationNo: data.businessRegistrationNo,
        taxId: data.taxId,
        businessEmail: data.businessEmail || session.user.email,
        businessPhone: data.businessPhone,
        businessAddress: data.businessAddress,
        returnPolicy: data.returnPolicy,
        shippingPolicy: data.shippingPolicy,
        status: "pending", // Requires admin approval
      })
      .returning();

    // Update user role to vendor
    await db
      .update(user)
      .set({ role: "vendor" })
      .where(eq(user.id, session.user.id));

    return NextResponse.json(
      {
        success: true,
        message: "Vendor registration submitted successfully. Awaiting approval.",
        data: newVendor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering vendor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register as vendor" },
      { status: 500 }
    );
  }
}

// PUT /api/vendor - Update current vendor profile
export async function PUT(request: NextRequest) {
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

    // Check if user is a vendor
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Vendor cannot change their own slug after registration
    delete body.shopSlug;

    const updateSchema = registerVendorSchema.partial().omit({ shopSlug: true });
    const validationResult = updateSchema.safeParse(body);

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

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(vendors.userId, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Vendor profile updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vendor profile" },
      { status: 500 }
    );
  }
}