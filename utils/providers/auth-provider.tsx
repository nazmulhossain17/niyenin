// ========================================
// File: app/(home)/auth-provider.tsx
// Auth Provider with Address Check Support
// ========================================

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient, type User } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAddresses: boolean | null;
  isCheckingAddresses: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkAddresses: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Routes that should skip address redirect
const SKIP_ADDRESS_REDIRECT_ROUTES = [
  "/profile/addresses/setup",
  "/profile/addresses",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

// Routes that require address to be set before access
const ADDRESS_REQUIRED_ROUTES = [
  "/checkout",
];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAddresses, setHasAddresses] = useState<boolean | null>(null);
  const [isCheckingAddresses, setIsCheckingAddresses] = useState(false);
  const [hasCheckedAddresses, setHasCheckedAddresses] = useState(false);

  const checkAddresses = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingAddresses(true);
      const response = await fetch("/api/user/addresses");
      const result = await response.json();

      if (result.success && result.data) {
        const hasAddr = result.data.length > 0;
        setHasAddresses(hasAddr);
        return hasAddr;
      }
      setHasAddresses(false);
      return false;
    } catch (error) {
      console.error("Error checking addresses:", error);
      setHasAddresses(false);
      return false;
    } finally {
      setIsCheckingAddresses(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: session } = await authClient.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
    }
  }, []);

  // Initial session check
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: session } = await authClient.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // Check addresses after user is authenticated
  useEffect(() => {
    if (user && !hasCheckedAddresses && !isLoading) {
      setHasCheckedAddresses(true);
      checkAddresses();
    }
  }, [user, hasCheckedAddresses, isLoading, checkAddresses]);

  // Handle address-required routes redirect
  useEffect(() => {
    // Skip if still loading or checking
    if (isLoading || isCheckingAddresses || !user) return;

    // Check if we should skip redirect for this route
    const shouldSkip = SKIP_ADDRESS_REDIRECT_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (shouldSkip) return;

    // Check if this route requires an address
    const requiresAddress = ADDRESS_REQUIRED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // If address is required but user has no addresses, redirect
    if (requiresAddress && hasAddresses === false) {
      router.push(`/profile/addresses/setup?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, user, hasAddresses, isLoading, isCheckingAddresses, router]);

  // Refresh session on pathname change (navigation)
  useEffect(() => {
    if (!isLoading) {
      refreshSession();
    }
  }, [pathname, isLoading, refreshSession]);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setHasAddresses(null);
      setHasCheckedAddresses(false);
      router.push("/");
      router.refresh(); // Clear Next.js cache
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAddresses,
    isCheckingAddresses,
    signOut,
    refreshSession,
    checkAddresses,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { redirectTo?: string; requireAddress?: boolean }
) {
  const { redirectTo = "/sign-in", requireAddress = false } = options || {};

  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading, hasAddresses, isCheckingAddresses } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Handle address requirement
    useEffect(() => {
      if (
        !isLoading &&
        !isCheckingAddresses &&
        isAuthenticated &&
        requireAddress &&
        hasAddresses === false
      ) {
        router.push(`/profile/addresses/setup?returnTo=${encodeURIComponent(pathname)}`);
      }
    }, [isAuthenticated, isLoading, isCheckingAddresses, hasAddresses, router, pathname]);

    if (isLoading || (isAuthenticated && isCheckingAddresses && requireAddress)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requireAddress && hasAddresses === false) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for checking if user needs address setup after auth
export function useAddressRedirect() {
  const { user, hasAddresses, isCheckingAddresses, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirectToSetup = useCallback(
    (returnTo?: string) => {
      const target = returnTo || pathname;
      router.push(`/profile/addresses/setup?returnTo=${encodeURIComponent(target)}`);
    },
    [router, pathname]
  );

  return {
    shouldRedirect: user && !isLoading && !isCheckingAddresses && hasAddresses === false,
    isChecking: isLoading || isCheckingAddresses,
    hasAddresses,
    redirectToSetup,
  };
}