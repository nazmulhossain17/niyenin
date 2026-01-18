// ========================================
// lib/api-utils.ts - API Utility Functions
// ========================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Success response helper
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  );
}

// Error response helper
export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse,
    { status }
  );
}

// Get current session from request
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// Check if user is authenticated
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { error: errorResponse("Unauthorized", 401), session: null };
  }
  return { error: null, session };
}

// Check if user has required role
export async function requireRole(allowedRoles: string[]) {
  const { error, session } = await requireAuth();
  if (error) {
    return { error, session: null };
  }

  const userRole = (session?.user as { role?: string })?.role || "customer";
  if (!allowedRoles.includes(userRole)) {
    return { error: errorResponse("Forbidden - Insufficient permissions", 403), session: null };
  }

  return { error: null, session };
}

// Check if user is admin (super_admin or admin)
export async function requireAdmin() {
  return requireRole(["super_admin", "admin"]);
}

// Check if user is vendor
export async function requireVendor() {
  return requireRole(["vendor"]);
}

// Check if user is moderator or higher
export async function requireModerator() {
  return requireRole(["super_admin", "admin", "moderator"]);
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Generate unique ticket number
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

// Generate unique dispute number
export function generateDisputeNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DSP-${timestamp}-${random}`;
}
