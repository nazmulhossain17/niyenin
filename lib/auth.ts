// ========================================
// lib/auth.ts - Better Auth Server Configuration
// ========================================

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  // ========================================
  // BASE URL CONFIGURATION
  // ========================================
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  // ========================================
  // SESSION CONFIGURATION
  // ========================================
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // ========================================
  // EMAIL & PASSWORD AUTHENTICATION
  // ========================================
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Set to true in production
    sendResetPassword: async ({ user, url }) => {
      // TODO: Implement email sending with your preferred email provider
      // For now, log the reset link (replace with actual email service)
      console.log(`Password reset link for ${user.email}: ${url}`);
      // Example with Resend, SendGrid, or other email service:
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   html: `<a href="${url}">Click here to reset your password</a>`
      // });
    },
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Implement email verification
      console.log(`Email verification link for ${user.email}: ${url}`);
    },
  },

  // ========================================
  // SOCIAL PROVIDERS (Optional - configure if needed)
  // ========================================
  socialProviders: {
    // Google OAuth - Only enable if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),

    // Facebook OAuth - Only enable if credentials are provided
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // ========================================
  // USER CONFIGURATION
  // ========================================
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // Cannot be set by user during signup
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
      twoFactorEnabled: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },

  // ========================================
  // ACCOUNT CONFIGURATION
  // ========================================
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "facebook"],
    },
  },

  // ========================================
  // PLUGINS
  // ========================================
  plugins: [
    nextCookies(),
    twoFactor({
      issuer: "Niyenin",
    }),
  ],

  // ========================================
  // ADVANCED CONFIGURATION
  // ========================================
  advanced: {
    generateId: () => crypto.randomUUID(),
  },

  // ========================================
  // RATE LIMITING
  // ========================================
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
});

// Export types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
