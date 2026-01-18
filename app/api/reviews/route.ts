// ========================================
// app/api/reviews/route.ts - Reviews API
// ========================================

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { reviews, products, orderItems, user } from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  requireAuth,
  getPaginationParams,
  getSession,
} from "@/lib/api-utils";

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(searchParams);

    const productId = searchParams.get("productId");
    const vendorId = searchParams.get("vendorId");
    const userId = searchParams.get("userId");
    const rating = searchParams.get("rating");
    const isApproved = searchParams.get("isApproved");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions
    const conditions = [];

    // Check if user is admin
    const session = await getSession();
    const userRole = (session?.user as { role?: string })?.role;
    const isAdmin = ["super_admin", "admin", "moderator"].includes(userRole || "");

    // Non-admins can only see approved reviews
    if (!isAdmin) {
      conditions.push(eq(reviews.isApproved, true));
    } else if (isApproved !== null && isApproved !== undefined) {
      conditions.push(eq(reviews.isApproved, isApproved === "true"));
    }

    if (productId) {
      conditions.push(eq(reviews.productId, productId));
    }

    if (vendorId) {
      conditions.push(eq(reviews.vendorId, vendorId));
    }

    if (userId) {
      conditions.push(eq(reviews.userId, userId));
    }

    if (rating) {
      conditions.push(eq(reviews.rating, parseInt(rating)));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count || 0);

    // Get reviews with sorting
    let orderByColumn;
    switch (sortBy) {
      case "rating":
        orderByColumn = reviews.rating;
        break;
      case "helpfulCount":
        orderByColumn = reviews.helpfulCount;
        break;
      default:
        orderByColumn = reviews.createdAt;
    }

    const orderDirection = sortOrder === "asc" ? asc : desc;

    const result = await db
      .select({
        review: reviews,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        product: {
          productId: products.productId,
          name: products.name,
          slug: products.slug,
          mainImage: products.mainImage,
        },
      })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id))
      .leftJoin(products, eq(reviews.productId, products.productId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    return successResponse({
      reviews: result.map((r) => ({
        ...r.review,
        user: r.user,
        product: r.product,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews", 500);
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const userId = session?.user?.id;
    if (!userId) {
      return errorResponse("User ID not found", 401);
    }

    const body = await request.json();
    const { productId, rating, title, comment, images = [] } = body;

    if (!productId || !rating) {
      return errorResponse("Product ID and rating are required");
    }

    if (rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5");
    }

    // Check if product exists
    const product = await db
      .select()
      .from(products)
      .where(eq(products.productId, productId))
      .limit(1);

    if (product.length === 0) {
      return errorResponse("Product not found", 404);
    }

    // Check if user has purchased this product
    const purchasedItems = await db
      .select()
      .from(orderItems)
      .innerJoin(
        db
          .select()
          .from(reviews)
          .where(eq(reviews.productId, productId))
          .as("orders_subquery"),
        sql`1=1`
      )
      .where(eq(orderItems.productId, productId))
      .limit(1);

    // Check if user already reviewed this product
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
      .limit(1);

    if (existingReview.length > 0) {
      return errorResponse("You have already reviewed this product", 400);
    }

    // Create review
    const newReview = await db
      .insert(reviews)
      .values({
        userId,
        productId,
        vendorId: product[0].vendorId,
        rating,
        title,
        comment,
        images,
        isVerifiedPurchase: purchasedItems.length > 0,
        isApproved: false, // Reviews need approval
      })
      .returning();

    return successResponse(newReview[0], "Review submitted successfully", 201);
  } catch (error) {
    console.error("Error creating review:", error);
    return errorResponse("Failed to create review", 500);
  }
}
