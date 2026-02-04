// ========================================
// File: app/api/reviews/[reviewId]/route.ts
// Single Review API
// GET: Public - fetch single review
// PATCH: Auth required - update own review
// DELETE: Auth required - delete own review
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { reviews, products, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, avg, sql } from "drizzle-orm";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ reviewId: string }>;
};

// ============================================
// GET - Public: Fetch single review
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    const [review] = await db
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
        userName: user.name,
        userImage: user.image,
      })
      .from(reviews)
      .leftJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.reviewId, reviewId))
      .limit(1);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Auth required: Update own review
// ============================================

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(3).max(100).optional().nullable(),
  comment: z.string().min(10).max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

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

    // Find the review
    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewId, reviewId));

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateReviewSchema.safeParse(body);

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

    const updateData = {
      ...validation.data,
      updatedAt: new Date(),
    };

    const [updatedReview] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.reviewId, reviewId))
      .returning();

    // Update product's average rating if rating changed
    if (validation.data.rating !== undefined) {
      await updateProductRating(existingReview.productId);
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Auth required: Delete own review
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

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

    // Find the review
    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewId, reviewId));

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check ownership (or admin)
    const isAdmin =
      session.user.role === "admin" || session.user.role === "super_admin";
    if (existingReview.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const productId = existingReview.productId;

    // Delete the review
    await db.delete(reviews).where(eq(reviews.reviewId, reviewId));

    // Update product's average rating
    await updateProductRating(productId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
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