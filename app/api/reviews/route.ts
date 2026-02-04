// ========================================
// File: app/api/reviews/route.ts
// Product Reviews API
// GET: Public - fetch reviews for a product
// POST: Auth required - create a new review
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { reviews, products, user, orderItems, orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, desc, asc, sql, avg } from "drizzle-orm";
import { z } from "zod";

// ============================================
// GET - Public: Fetch reviews for a product
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt, rating, helpful
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    // Build order by
    const orderByColumn =
      {
        createdAt: reviews.createdAt,
        rating: reviews.rating,
        helpful: reviews.helpfulCount,
      }[sortBy] || reviews.createdAt;

    const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Fetch reviews with user info
    const reviewsList = await db
      .select({
        reviewId: reviews.reviewId,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        images: reviews.images,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        // User info (safe fields only)
        userName: user.name,
        userImage: user.image,
      })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.productId, productId))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    // Get rating distribution
    const ratingDistribution = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .groupBy(reviews.rating);

    // Build rating breakdown (1-5 stars)
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      breakdown[r.rating] = r.count;
    });

    // Calculate average
    const [avgResult] = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const averageRating = avgResult?.avg ? parseFloat(avgResult.avg) : 0;

    return NextResponse.json({
      success: true,
      data: reviewsList,
      summary: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: total,
        ratingBreakdown: breakdown,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Auth required: Create a new review
// ============================================

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment, images } = validation.data;
    const userId = session.user.id;

    // Check if product exists and is approved
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.productId, productId),
          eq(products.status, "approved"),
          eq(products.isActive, true)
        )
      );

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found or not available" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.productId, productId), eq(reviews.userId, userId))
      );

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this product. You can edit your existing review.",
        },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (verified purchase)
    let isVerifiedPurchase = false;
    try {
      const purchaseCheck = await db
        .select()
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.orderId))
        .where(
          and(
            eq(orderItems.productId, productId),
            eq(orders.userId, userId),
            eq(orders.status, "delivered")
          )
        )
        .limit(1);

      isVerifiedPurchase = purchaseCheck.length > 0;
    } catch {
      // If orders table doesn't exist yet, just continue without verified purchase
    }

    // Create the review
    const [newReview] = await db
      .insert(reviews)
      .values({
        productId,
        userId,
        rating,
        title: title || null,
        comment,
        images: images || null,
        isVerifiedPurchase,
        helpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update product's average rating and total ratings
    await updateProductRating(productId);

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// Helper function to update product's rating stats
async function updateProductRating(productId: string) {
  try {
    const [stats] = await db
      .select({
        avgRating: avg(reviews.rating),
        totalRatings: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    await db
      .update(products)
      .set({
        averageRating: stats.avgRating ? stats.avgRating.toString() : "0",
        totalRatings: stats.totalRatings || 0,
        updatedAt: new Date(),
      })
      .where(eq(products.productId, productId));
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
}