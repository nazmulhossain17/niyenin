// ========================================
// lib/auth-client.ts - Better Auth Client Configuration
// ========================================

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [twoFactorClient()],
});

// User role type
export type UserRole = "super_admin" | "admin" | "moderator" | "vendor" | "customer";

// The type is inferred from the server-side auth configuration
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user & {
  role?: UserRole;
  phone?: string | null;
  phoneVerified?: boolean;
  isActive?: boolean;
  isBanned?: boolean;
  twoFactorEnabled?: boolean;
};

// Helper function to check if user has required role
export const hasRole = (user: User | null, allowedRoles: UserRole[]): boolean => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role as UserRole);
};

// Helper function to check if user is admin (super_admin or admin)
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ["super_admin", "admin"]);
};

// Helper function to check if user is vendor
export const isVendor = (user: User | null): boolean => {
  return hasRole(user, ["vendor"]);
};

// Helper function to check if user is moderator or higher
export const isModerator = (user: User | null): boolean => {
  return hasRole(user, ["super_admin", "admin", "moderator"]);
};
