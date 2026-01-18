// ========================================
// middleware.ts - Next.js Middleware for Authentication & Authorization
// ========================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  // Admin routes - only super_admin and admin
  "/admin": ["super_admin", "admin"],
  "/admin/users": ["super_admin", "admin"],
  "/admin/vendors": ["super_admin", "admin"],
  "/admin/products": ["super_admin", "admin", "moderator"],
  "/admin/orders": ["super_admin", "admin"],
  "/admin/categories": ["super_admin", "admin"],
  "/admin/brands": ["super_admin", "admin"],
  "/admin/coupons": ["super_admin", "admin"],
  "/admin/banners": ["super_admin", "admin"],
  "/admin/settings": ["super_admin"],
  "/admin/reports": ["super_admin", "admin"],
  "/admin/support": ["super_admin", "admin", "moderator"],
  "/admin/disputes": ["super_admin", "admin"],

  // Vendor routes
  "/vendor": ["vendor"],
  "/vendor/dashboard": ["vendor"],
  "/vendor/products": ["vendor"],
  "/vendor/orders": ["vendor"],
  "/vendor/earnings": ["vendor"],
  "/vendor/payouts": ["vendor"],
  "/vendor/settings": ["vendor"],

  // Customer routes (authenticated users)
  "/account": ["customer", "vendor", "moderator", "admin", "super_admin"],
  "/account/orders": ["customer", "vendor", "moderator", "admin", "super_admin"],
  "/account/addresses": ["customer", "vendor", "moderator", "admin", "super_admin"],
  "/account/wishlist": ["customer", "vendor", "moderator", "admin", "super_admin"],
  "/account/settings": ["customer", "vendor", "moderator", "admin", "super_admin"],

  // Checkout requires authentication
  "/checkout": ["customer", "vendor", "moderator", "admin", "super_admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/shop",
  "/product",
  "/category",
  "/vendor",
  "/about-us",
  "/contact",
  "/faq",
  "/api/auth",
];

// Check if a path matches any of the public routes
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Check if a path matches any of the protected routes
function getRequiredRoles(pathname: string): string[] | null {
  // Check exact match first
  if (protectedRoutes[pathname]) {
    return protectedRoutes[pathname];
  }

  // Check prefix match
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(`${route}/`)) {
      return roles;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except protected ones)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session from cookies
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Check if user is authenticated
  if (!sessionCookie) {
    // Redirect to sign-in for protected routes
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // For role-based access control, we need to verify the session
  // This is done by making a request to the auth API
  try {
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionResponse.ok) {
      // Session is invalid, redirect to sign-in
      const requiredRoles = getRequiredRoles(pathname);
      if (requiredRoles) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }
      return NextResponse.next();
    }

    const session = await sessionResponse.json();
    const userRole = session?.user?.role || "customer";

    // Check if user has required role for the route
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      // User doesn't have required role, redirect based on their role
      if (userRole === "vendor") {
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
      } else if (userRole === "admin" || userRole === "super_admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (userRole === "moderator") {
        return NextResponse.redirect(new URL("/admin/support", request.url));
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Check if user is banned
    if (session?.user?.isBanned) {
      return NextResponse.redirect(new URL("/banned", request.url));
    }

    // Check if user is inactive
    if (session?.user?.isActive === false) {
      return NextResponse.redirect(new URL("/inactive", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
