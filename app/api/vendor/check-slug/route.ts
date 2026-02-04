// ========================================
// File: app/api/vendor/check-slug/route.ts
// Check if vendor shop slug is available
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/vendor/check-slug?slug=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: "Slug must contain only lowercase letters, numbers, and hyphens",
        },
      });
    }

    // Check minimum length
    if (slug.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: "Slug must be at least 2 characters",
        },
      });
    }

    // Reserved slugs
    const reservedSlugs = [
      "admin",
      "api",
      "vendor",
      "shop",
      "store",
      "marketplace",
      "support",
      "help",
      "about",
      "contact",
      "terms",
      "privacy",
      "settings",
      "dashboard",
      "account",
      "profile",
      "checkout",
      "cart",
      "orders",
      "products",
      "categories",
      "brands",
      "search",
      "login",
      "register",
      "sign-in",
      "sign-up",
      "forgot-password",
      "reset-password",
    ];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: "This URL is reserved and cannot be used",
        },
      });
    }

    // Check if slug exists in database
    const [existingVendor] = await db
      .select({ shopSlug: vendors.shopSlug })
      .from(vendors)
      .where(eq(vendors.shopSlug, slug.toLowerCase()));

    return NextResponse.json({
      success: true,
      data: {
        available: !existingVendor,
        message: existingVendor
          ? "This shop URL is already taken"
          : "This shop URL is available",
        slug: slug.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}