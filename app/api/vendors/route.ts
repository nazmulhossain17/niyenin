// ========================================
// app/api/vendors/route.ts - Vendors API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { eq, and, ilike, sql, desc, asc, or } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  getPaginationParams,
  generateSlug,
  getSession,
} from "@/lib/api-utils";

// GET /api/vendors - Get all vendors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const status = searchParams.get("status");
    const isVerified = searchParams.get("isVerified");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions
    const conditions = [];

    // Check if user is admin
    const session = await getSession();
    const userRole = (session?.user as { role?: string })?.role;
    const isAdmin = ["super_admin", "admin"].includes(userRole || "");

    // Non-admins can only see approved vendors
    if (!isAdmin) {
      conditions.push(eq(vendors.status, "approved"));
    } else if (status) {
      conditions.push(eq(vendors.status, status as "pending" | "approved" | "rejected" | "suspended"));
    }

    if (isVerified !== null && isVerified !== undefined) {
      conditions.push(eq(vendors.isVerified, isVerified === "true"));
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      conditions.push(eq(vendors.isFeatured, isFeatured === "true"));
    }

    if (search) {
      conditions.push(
        or(
          ilike(vendors.shopName, `%${search}%`),
          ilike(vendors.businessName, `%${search}%`)
        )
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(vendors)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get vendors with sorting
    let orderByColumn;
    switch (sortBy) {
      case "shopName":
        orderByColumn = vendors.shopName;
        break;
      case "rating":
        orderByColumn = vendors.averageRating;
        break;
      case "totalProducts":
        orderByColumn = vendors.totalProducts;
        break;
      case "totalOrders":
        orderByColumn = vendors.totalOrders;
        break;
      default:
        orderByColumn = vendors.createdAt;
    }

    const orderDirection = sortOrder === "asc" ? asc : desc;

    const result = await db
      .select({
        vendor: vendors,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(vendors)
      .leftJoin(user, eq(vendors.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return successResponse({
      vendors: result.map((r) => ({
        ...r.vendor,
        user: isAdmin ? r.user : undefined, // Only show user info to admins
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return errorResponse("Failed to fetch vendors", 500);
  }
}

// POST /api/vendors - Register as a vendor
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    const userRole = (session?.user as { role?: string })?.role;

    // Check if user is already a vendor
    if (userRole === "vendor") {
      return errorResponse("You are already registered as a vendor", 400);
    }

    // Check if user already has a vendor application
    const existingVendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId!))
      .limit(1);

    if (existingVendor.length > 0) {
      return errorResponse("You already have a vendor application", 400);
    }

    const body = await request.json();
    const {
      shopName,
      description,
      logo,
      banner,
      businessName,
      businessRegistrationNo,
      taxId,
      businessEmail,
      businessPhone,
      businessAddress,
      returnPolicy,
      shippingPolicy,
    } = body;

    if (!shopName) {
      return errorResponse("Shop name is required");
    }

    // Generate slug
    let shopSlug = generateSlug(shopName);

    // Check if slug already exists
    const existingSlug = await db
      .select()
      .from(vendors)
      .where(eq(vendors.shopSlug, shopSlug))
      .limit(1);

    if (existingSlug.length > 0) {
      shopSlug = `${shopSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const newVendor = await db
      .insert(vendors)
      .values({
        userId: userId!,
        shopName,
        shopSlug,
        description,
        logo,
        banner,
        businessName,
        businessRegistrationNo,
        taxId,
        businessEmail,
        businessPhone,
        businessAddress,
        returnPolicy,
        shippingPolicy,
        status: "pending",
      })
      .returning();

    return successResponse(newVendor[0], "Vendor application submitted successfully", 201);
  } catch (error) {
    console.error("Error creating vendor:", error);
    return errorResponse("Failed to submit vendor application", 500);
  }
}
