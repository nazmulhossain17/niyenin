// ========================================
// File: lib/auth-client.ts
// Better Auth Client Configuration
// ========================================

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// Define the additional fields type to match server configuration
type AdditionalUserFields = {
  role: string;
  phone: string | null;
  phoneVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason: string | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
};

// Create the auth client with inferAdditionalFields plugin
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<{
      user: AdditionalUserFields;
    }>(),
  ],
});

// ========================================
// TYPE EXPORTS
// ========================================
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

// User role type for convenience
export type UserRole = "super_admin" | "admin" | "moderator" | "vendor" | "customer";