// ========================================
// File: middleware.ts (root directory)
// Authentication & Address Check Middleware
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/orders",
  "/wishlist",
  "/checkout",
  "/vendor",
  "/admin",
];

// Routes that require address to be set (after login)
const addressRequiredRoutes = ["/checkout"];

// Routes only for unauthenticated users
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

// Routes to skip address check (allow access even without address)
const addressSetupRoutes = ["/profile/addresses/setup", "/profile/addresses"];

// Public routes that don't need any checks
const publicRoutes = [
  "/",
  "/products",
  "/categories",
  "/vendors",
  "/about",
  "/contact",
  "/faq",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session cookie (optimistic check - fast but not fully secure)
  // Full validation should happen in the actual page/API
  const sessionCookie = getSessionCookie(request);

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current route is auth route (sign-in, sign-up, etc.)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this is an address setup route (skip address check)
  const isAddressSetupRoute = addressSetupRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if address is required for this route
  const isAddressRequired = addressRequiredRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For address-required routes, we'll handle the check on the client/server side
  // since we need to query the database for address info
  // We'll pass a header to indicate this needs address check
  if (isAddressRequired && sessionCookie && !isAddressSetupRoute) {
    const response = NextResponse.next();
    response.headers.set("x-address-check-required", "true");
    return response;
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};