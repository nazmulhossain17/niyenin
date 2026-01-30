// File: lib/api/auth-guard.ts
// API Route Authentication & Authorization Helper

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// User roles type
export type UserRole = "super_admin" | "admin" | "moderator" | "vendor" | "customer";

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  moderator: 3,
  vendor: 2,
  customer: 1,
};

// Get current session and user
export async function getAuthSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Auth session error:", error);
    return null;
  }
}

// Check if user is authenticated
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session?.user) {
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      ),
      session: null,
      user: null,
    };
  }

  return {
    authorized: true,
    error: null,
    session,
    user: session.user,
  };
}

// Check if user has one of the required roles
export async function requireRoles(allowedRoles: UserRole[]) {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  const userRole = (authResult.user?.role as UserRole) || "customer";

  if (!allowedRoles.includes(userRole)) {
    return {
      authorized: false,
      error: NextResponse.json(
        { 
          success: false, 
          error: "Forbidden - You don't have permission to perform this action",
          requiredRoles: allowedRoles,
          yourRole: userRole,
        },
        { status: 403 }
      ),
      session: authResult.session,
      user: authResult.user,
    };
  }

  return {
    authorized: true,
    error: null,
    session: authResult.session,
    user: authResult.user,
    role: userRole,
  };
}

// Check if user has minimum role level
export async function requireMinRole(minRole: UserRole) {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  const userRole = (authResult.user?.role as UserRole) || "customer";
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[minRole] || 0;

  if (userLevel < requiredLevel) {
    return {
      authorized: false,
      error: NextResponse.json(
        { 
          success: false, 
          error: "Forbidden - Insufficient permissions",
          requiredMinRole: minRole,
          yourRole: userRole,
        },
        { status: 403 }
      ),
      session: authResult.session,
      user: authResult.user,
    };
  }

  return {
    authorized: true,
    error: null,
    session: authResult.session,
    user: authResult.user,
    role: userRole,
  };
}

// Predefined role groups for common use cases
export const ROLES = {
  // Can manage everything
  SUPER_ADMIN: ["super_admin"] as UserRole[],
  
  // Can manage most things
  ADMINS: ["super_admin", "admin"] as UserRole[],
  
  // Can moderate content
  MODERATORS: ["super_admin", "admin", "moderator"] as UserRole[],
  
  // Can create/manage products
  PRODUCT_MANAGERS: ["super_admin", "admin", "moderator", "vendor"] as UserRole[],
  
  // Can manage their own shop
  VENDORS: ["super_admin", "admin", "vendor"] as UserRole[],
  
  // All authenticated users
  ALL_AUTHENTICATED: ["super_admin", "admin", "moderator", "vendor", "customer"] as UserRole[],
};

// Helper to check if user owns a resource (for vendors)
export function isResourceOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

// Helper to check if user can manage resource
export async function canManageResource(
  resourceOwnerId: string,
  allowedRoles: UserRole[] = ROLES.ADMINS
) {
  const authResult = await requireAuth();

  if (!authResult.authorized) {
    return authResult;
  }

  const userRole = (authResult.user?.role as UserRole) || "customer";
  const userId = authResult.user?.id;

  // Admins can manage any resource
  if (allowedRoles.includes(userRole)) {
    return {
      authorized: true,
      error: null,
      session: authResult.session,
      user: authResult.user,
      isOwner: userId === resourceOwnerId,
    };
  }

  // Vendors can only manage their own resources
  if (userRole === "vendor" && userId === resourceOwnerId) {
    return {
      authorized: true,
      error: null,
      session: authResult.session,
      user: authResult.user,
      isOwner: true,
    };
  }

  return {
    authorized: false,
    error: NextResponse.json(
      { success: false, error: "Forbidden - You can only manage your own resources" },
      { status: 403 }
    ),
    session: authResult.session,
    user: authResult.user,
    isOwner: false,
  };
}