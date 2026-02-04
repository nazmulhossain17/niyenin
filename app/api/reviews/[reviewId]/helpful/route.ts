// ========================================
// File: app/api/reviews/[reviewId]/helpful/route.ts
// Mark Review as Helpful API
// POST: Auth required - toggle helpful vote
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { reviews, reviewHelpful } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ reviewId: string }>;
};

// ============================================
// POST - Auth required: Toggle helpful vote
// ============================================
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const userId = session.user.id;

    // Find the review
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewId, reviewId));

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Can't vote on your own review
    if (review.userId === userId) {
      return NextResponse.json(
        { success: false, error: "You cannot mark your own review as helpful" },
        { status: 400 }
      );
    }

    // Check if reviewHelpful table exists and user already voted
    try {
      const [existingVote] = await db
        .select()
        .from(reviewHelpful)
        .where(
          and(
            eq(reviewHelpful.reviewId, reviewId),
            eq(reviewHelpful.userId, userId)
          )
        );

      if (existingVote) {
        // Remove the vote (toggle off)
        await db
          .delete(reviewHelpful)
          .where(
            and(
              eq(reviewHelpful.reviewId, reviewId),
              eq(reviewHelpful.userId, userId)
            )
          );

        // Decrement helpful count
        await db
          .update(reviews)
          .set({
            helpfulCount: sql`GREATEST(${reviews.helpfulCount} - 1, 0)`,
          })
          .where(eq(reviews.reviewId, reviewId));

        return NextResponse.json({
          success: true,
          message: "Helpful vote removed",
          isHelpful: false,
        });
      } else {
        // Add the vote
        await db.insert(reviewHelpful).values({
          reviewId,
          userId,
          createdAt: new Date(),
        });

        // Increment helpful count
        await db
          .update(reviews)
          .set({
            helpfulCount: sql`${reviews.helpfulCount} + 1`,
          })
          .where(eq(reviews.reviewId, reviewId));

        return NextResponse.json({
          success: true,
          message: "Marked as helpful",
          isHelpful: true,
        });
      }
    } catch (tableError) {
      // If reviewHelpful table doesn't exist, just increment/decrement without tracking
      // This is a fallback - the table should be created
      await db
        .update(reviews)
        .set({
          helpfulCount: sql`${reviews.helpfulCount} + 1`,
        })
        .where(eq(reviews.reviewId, reviewId));

      return NextResponse.json({
        success: true,
        message: "Marked as helpful",
        isHelpful: true,
      });
    }
  } catch (error) {
    console.error("Error toggling helpful vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle helpful vote" },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Check if current user voted helpful
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = await params;

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        isHelpful: false,
      });
    }

    const userId = session.user.id;

    try {
      const [existingVote] = await db
        .select()
        .from(reviewHelpful)
        .where(
          and(
            eq(reviewHelpful.reviewId, reviewId),
            eq(reviewHelpful.userId, userId)
          )
        );

      return NextResponse.json({
        success: true,
        isHelpful: !!existingVote,
      });
    } catch {
      // Table might not exist
      return NextResponse.json({
        success: true,
        isHelpful: false,
      });
    }
  } catch (error) {
    console.error("Error checking helpful vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check helpful vote" },
      { status: 500 }
    );
  }
}