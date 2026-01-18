// ========================================
// lib/auth.ts - Better Auth Server Configuration
// ========================================

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db/drizzle"
import { schema } from "@/db/schema"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  // ========================================
  // EMAIL & PASSWORD AUTHENTICATION
  // ========================================
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending with your preferred email provider
      console.log(`Password reset link for ${user.email}: ${url}`)
    },
  },

  // ========================================
  // SOCIAL PROVIDERS
  // ========================================
  socialProviders: {
    // Google OAuth
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    // Facebook OAuth
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },

    // Apple OAuth
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      phoneVerified: {
        type: "boolean",
        defaultValue: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
      isBanned: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },

  plugins: [nextCookies()],
})

// Export types
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
