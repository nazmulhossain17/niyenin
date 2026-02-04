// ========================================
// File: middleware.ts (root directory)
// Authentication & Role-Based Access Middleware
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Dashboard routes with their required roles
const dashboardRoutes = {
  "/admin": ["admin", "super_admin"],
  "/vendor": ["vendor", "admin", "super_admin"],
  "/customer": ["customer", "vendor", "admin", "super_admin"], // Any authenticated user
};

// Routes that require authentication (any role)
const protectedRoutes = [
  "/profile",
  "/orders",
  "/wishlist",
  "/checkout",
  "/customer",
];

// Routes that require address to be set (handled client-side)
const addressRequiredRoutes = ["/checkout"];

// Routes only for unauthenticated users
const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

// Routes to skip address check
const addressSetupRoutes = ["/profile/addresses/setup", "/profile/addresses"];

// Public routes (no auth needed)
const publicRoutes = [
  "/",
  "/shop",
  "/products",
  "/categories",
  "/brands",
  "/vendors",
  "/about",
  "/contact",
  "/faq",
  "/cart",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getDashboardRoute(pathname: string): string | null {
  for (const route of Object.keys(dashboardRoutes)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return route;
    }
  }
  return null;
}

// ============================================
// MIDDLEWARE
// ============================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and public assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session cookie (optimistic check)
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  // ----------------------------------------
  // Check if it's an auth route (sign-in, sign-up, etc.)
  // ----------------------------------------
  const isAuthRoute = isRouteMatch(pathname, authRoutes);
  
  if (isAuthRoute && isAuthenticated) {
    // Authenticated users shouldn't access auth routes
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ----------------------------------------
  // Check if it's a dashboard route
  // ----------------------------------------
  const dashboardRoute = getDashboardRoute(pathname);
  
  if (dashboardRoute) {
    if (!isAuthenticated) {
      // Not authenticated - redirect to sign in
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // For role-based access, we need to verify on the server-side
    // The actual role check happens in the layout/page components
    // Middleware just ensures user is authenticated
    const response = NextResponse.next();
    response.headers.set("x-dashboard-route", dashboardRoute);
    return response;
  }

  // ----------------------------------------
  // Check if it's a protected route (requires auth)
  // ----------------------------------------
  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);
  
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ----------------------------------------
  // Check if address is required for this route
  // ----------------------------------------
  const isAddressRequired = isRouteMatch(pathname, addressRequiredRoutes);
  const isAddressSetupRoute = isRouteMatch(pathname, addressSetupRoutes);
  
  if (isAddressRequired && isAuthenticated && !isAddressSetupRoute) {
    // Pass header to indicate address check is needed
    // The actual check happens on client/server side
    const response = NextResponse.next();
    response.headers.set("x-address-check-required", "true");
    return response;
  }

  return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};