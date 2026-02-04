// ========================================
// File: app/api/vendor/onboarding/route.ts
// Vendor Onboarding API - Multi-step Registration
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, vendorPaymentDetails, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Helper to handle optional strings that could be empty
const optionalString = z
  .string()
  .optional()
  .transform((val) => (val && val.trim() !== "" ? val : undefined));

const optionalUrl = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") return undefined;
    return val;
  });

// Step 1: Shop Information Schema
const shopInfoSchema = z.object({
  step: z.literal(1),
  shopName: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(150, "Shop name cannot exceed 150 characters"),
  shopSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  logo: optionalUrl,
  banner: optionalUrl,
});

// Step 2: Business Details Schema
const businessDetailsSchema = z.object({
  step: z.literal(2),
  businessName: optionalString,
  businessRegistrationNo: optionalString,
  taxId: optionalString,
  businessEmail: z.string().email("Invalid email address").max(100),
  businessPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^[+]?[\d\s-]+$/, "Invalid phone number format"),
  businessAddress: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address cannot exceed 500 characters"),
});

// Step 3: Payment Details Schema
const paymentDetailsSchema = z.object({
  step: z.literal(3),
  preferredMethod: z.enum(["bank", "bkash", "nagad", "rocket"]),
  bankName: optionalString,
  accountName: optionalString,
  accountNumber: optionalString,
  branchName: optionalString,
  routingNumber: optionalString,
  bkashNumber: optionalString,
  nagadNumber: optionalString,
  rocketNumber: optionalString,
});

// Step 4: Policies Schema
const policiesSchema = z.object({
  step: z.literal(4),
  returnPolicy: z
    .string()
    .min(50, "Return policy must be at least 50 characters")
    .max(5000, "Return policy cannot exceed 5000 characters"),
  shippingPolicy: z
    .string()
    .min(50, "Shipping policy must be at least 50 characters")
    .max(5000, "Shipping policy cannot exceed 5000 characters"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Combined schema for full submission
const fullOnboardingSchema = z.object({
  shopName: z.string().min(2).max(150),
  shopSlug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(20).max(2000),
  logo: optionalUrl,
  banner: optionalUrl,
  businessName: optionalString,
  businessRegistrationNo: optionalString,
  taxId: optionalString,
  businessEmail: z.string().email().max(100),
  businessPhone: z.string().min(10).max(20),
  businessAddress: z.string().min(10).max(500),
  preferredMethod: z.enum(["bank", "bkash", "nagad", "rocket"]),
  bankName: optionalString,
  accountName: optionalString,
  accountNumber: optionalString,
  branchName: optionalString,
  routingNumber: optionalString,
  bkashNumber: optionalString,
  nagadNumber: optionalString,
  rocketNumber: optionalString,
  returnPolicy: z.string().min(50).max(5000),
  shippingPolicy: z.string().min(50).max(5000),
  termsAccepted: z.boolean().optional(),
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

// GET /api/vendor/onboarding - Get onboarding status & draft data
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

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (existingVendor) {
      const [paymentDetails] = await db
        .select()
        .from(vendorPaymentDetails)
        .where(eq(vendorPaymentDetails.vendorId, existingVendor.vendorId));

      return NextResponse.json({
        success: true,
        data: {
          status: existingVendor.status,
          isComplete: true,
          vendor: existingVendor,
          paymentDetails,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: null,
        isComplete: false,
        vendor: null,
        paymentDetails: null,
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
}

// POST /api/vendor/onboarding - Validate step or complete registration
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

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, session.user.id));

    if (existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: "You are already registered as a vendor",
          data: { status: existingVendor.status },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Validate individual step
    if (action === "validate") {
      const { step } = body;

      let schema;
      switch (step) {
        case 1:
          schema = shopInfoSchema;
          break;
        case 2:
          schema = businessDetailsSchema;
          break;
        case 3:
          schema = paymentDetailsSchema;
          break;
        case 4:
          schema = policiesSchema;
          break;
        default:
          return NextResponse.json(
            { success: false, error: "Invalid step" },
            { status: 400 }
          );
      }

      const validation = schema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json({
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        });
      }

      // Additional validations for step 1
      if (step === 1) {
        const slug = body.shopSlug || generateSlug(body.shopName);
        const [existingSlug] = await db
          .select()
          .from(vendors)
          .where(eq(vendors.shopSlug, slug));

        if (existingSlug) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: { shopSlug: ["This shop URL is already taken"] },
          });
        }
      }

      // Additional validations for step 3
      if (step === 3) {
        const {
          preferredMethod,
          bankName,
          accountNumber,
          bkashNumber,
          nagadNumber,
          rocketNumber,
        } = body;

        if (preferredMethod === "bank" && (!bankName || !accountNumber)) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: {
              bankName: !bankName ? ["Bank name is required"] : [],
              accountNumber: !accountNumber
                ? ["Account number is required"]
                : [],
            },
          });
        }

        if (preferredMethod === "bkash" && !bkashNumber) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: { bkashNumber: ["bKash number is required"] },
          });
        }

        if (preferredMethod === "nagad" && !nagadNumber) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: { nagadNumber: ["Nagad number is required"] },
          });
        }

        if (preferredMethod === "rocket" && !rocketNumber) {
          return NextResponse.json({
            success: false,
            error: "Validation failed",
            details: { rocketNumber: ["Rocket number is required"] },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Step ${step} validated successfully`,
      });
    }

    // Complete registration
    if (action === "submit") {
      const validation = fullOnboardingSchema.safeParse(body);

      if (!validation.success) {
        console.error("Validation errors:", validation.error.flatten());
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const data = validation.data;
      const shopSlug = data.shopSlug || generateSlug(data.shopName);

      // Check if slug is taken
      const [existingSlug] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.shopSlug, shopSlug));

      if (existingSlug) {
        return NextResponse.json(
          {
            success: false,
            error: "Shop URL is already taken",
            details: { shopSlug: ["This shop URL is already taken"] },
          },
          { status: 400 }
        );
      }

      // Create vendor profile (no transaction - Neon HTTP doesn't support it)
      const [newVendor] = await db
        .insert(vendors)
        .values({
          userId: session.user.id,
          shopName: data.shopName,
          shopSlug: shopSlug,
          description: data.description,
          logo: data.logo || null,
          banner: data.banner || null,
          businessName: data.businessName || null,
          businessRegistrationNo: data.businessRegistrationNo || null,
          taxId: data.taxId || null,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          businessAddress: data.businessAddress,
          returnPolicy: data.returnPolicy,
          shippingPolicy: data.shippingPolicy,
          status: "pending",
          commissionRate: "10.00",
        })
        .returning();

      // Create payment details
      const [paymentDetails] = await db
        .insert(vendorPaymentDetails)
        .values({
          vendorId: newVendor.vendorId,
          preferredMethod: data.preferredMethod,
          bankName: data.bankName || null,
          accountName: data.accountName || null,
          accountNumber: data.accountNumber || null,
          branchName: data.branchName || null,
          routingNumber: data.routingNumber || null,
          bkashNumber: data.bkashNumber || null,
          nagadNumber: data.nagadNumber || null,
          rocketNumber: data.rocketNumber || null,
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
          message:
            "Vendor registration submitted successfully! Your application is pending review.",
          data: { vendor: newVendor, paymentDetails },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in vendor onboarding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process onboarding" },
      { status: 500 }
    );
  }
}