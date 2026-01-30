// ========================================
// File: lib/auth.ts
// Better Auth Server Configuration
// ========================================

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { schema } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

// Conditionally import and initialize Resend only if API key exists
const resend = process.env.RESEND_API_KEY
  ? new (require("resend").Resend)(process.env.RESEND_API_KEY)
  : null;

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
      if (resend) {
        // Production: Send email via Resend
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: user.email,
          subject: "Reset Your Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } else {
        // Development fallback: Log to console
        console.log("\n========================================");
        console.log("📧 PASSWORD RESET EMAIL (Dev Mode)");
        console.log("========================================");
        console.log(`To: ${user.email}`);
        console.log(`Name: ${user.name || "User"}`);
        console.log(`Reset URL: ${url}`);
        console.log("========================================\n");
      }
    },
  },

  // ========================================
  // EMAIL VERIFICATION
  // ========================================
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (resend) {
        // Production: Send email via Resend
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: user.email,
          subject: "Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Verify Your Email</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Welcome! Please verify your email address by clicking the button below:</p>
              <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Verify Email
              </a>
              <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
        });
      } else {
        // Development fallback: Log to console
        console.log("\n========================================");
        console.log("📧 VERIFICATION EMAIL (Dev Mode)");
        console.log("========================================");
        console.log(`To: ${user.email}`);
        console.log(`Name: ${user.name || "User"}`);
        console.log(`Verification URL: ${url}`);
        console.log("========================================\n");
      }
    },
    sendOnSignUp: true,
  },

  // ========================================
  // SOCIAL PROVIDERS
  // ========================================
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  // ========================================
  // CUSTOM USER FIELDS
  // ========================================
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
      banReason: {
        type: "string",
        required: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
      lastLoginIp: {
        type: "string",
        required: false,
      },
    },
  },

  // ========================================
  // SESSION CONFIGURATION
  // ========================================
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  plugins: [nextCookies()],
});

// ========================================
// TYPE EXPORTS
// ========================================
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;