// ========================================
// File: hooks/use-address-check.ts
// Hook to check if user has addresses set up
// ========================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface Address {
  addressId: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseAddressCheckOptions {
  redirectTo?: string;
  required?: boolean;
  skipAuthCheck?: boolean;
}

interface UseAddressCheckReturn {
  hasAddresses: boolean | null;
  isLoading: boolean;
  addresses: Address[];
  defaultAddress: Address | null;
  refetch: () => Promise<void>;
}

export function useAddressCheck(
  options: UseAddressCheckOptions = {}
): UseAddressCheckReturn {
  const {
    redirectTo = "/profile/addresses/setup",
    required = false,
    skipAuthCheck = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();

  const [hasAddresses, setHasAddresses] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const checkAddresses = useCallback(async () => {
    try {
      setIsLoading(true);

      // First check if user is authenticated (unless skipped)
      if (!skipAuthCheck) {
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          setHasAddresses(false);
          setIsLoading(false);
          return;
        }
      }

      // Fetch addresses
      const response = await fetch("/api/user/addresses");
      const result = await response.json();

      if (result.success && result.data) {
        setAddresses(result.data);
        const hasAddr = result.data.length > 0;
        setHasAddresses(hasAddr);

        // Redirect if required and no addresses
        if (required && !hasAddr && pathname !== redirectTo) {
          // Don't redirect if already on setup page or its children
          if (!pathname.startsWith(redirectTo)) {
            router.push(`${redirectTo}?returnTo=${encodeURIComponent(pathname)}`);
          }
        }
      } else {
        setHasAddresses(false);
        setAddresses([]);

        if (required && pathname !== redirectTo) {
          if (!pathname.startsWith(redirectTo)) {
            router.push(`${redirectTo}?returnTo=${encodeURIComponent(pathname)}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking addresses:", error);
      setHasAddresses(false);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, redirectTo, required, router, skipAuthCheck]);

  useEffect(() => {
    checkAddresses();
  }, [checkAddresses]);

  // Find default address
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0] || null;

  return {
    hasAddresses,
    isLoading,
    addresses,
    defaultAddress,
    refetch: checkAddresses,
  };
}

// Simpler hook that just returns if addresses exist without redirect logic
export function useHasAddresses(): {
  hasAddresses: boolean | null;
  isLoading: boolean;
} {
  const [hasAddresses, setHasAddresses] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          setHasAddresses(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/user/addresses");
        const result = await response.json();

        if (result.success && result.data) {
          setHasAddresses(result.data.length > 0);
        } else {
          setHasAddresses(false);
        }
      } catch (error) {
        console.error("Error checking addresses:", error);
        setHasAddresses(false);
      } finally {
        setIsLoading(false);
      }
    }

    check();
  }, []);

  return { hasAddresses, isLoading };
}