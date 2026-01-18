// ========================================
// lib/auth-client.ts - Better Auth Client Configuration
// ========================================

import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

// The type is inferred from the server-side auth configuration
export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user & {
  role?: "super_admin" | "admin" | "moderator" | "vendor" | "customer"
  phone?: string | null
  phoneVerified?: boolean
  isActive?: boolean
  isBanned?: boolean
}
