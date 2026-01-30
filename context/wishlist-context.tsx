// ========================================
// File: context/wishlist-context.tsx
// Wishlist Context Provider for managing wishlist state
// ========================================

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

// Types
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  vendorName: string;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  addToWishlist: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "niyenin_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check for user session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: session } = await authClient.getSession();
        setUserId(session?.user?.id || null);
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };
    checkUser();
  }, []);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const storageKey = userId ? `${WISHLIST_STORAGE_KEY}_${userId}` : WISHLIST_STORAGE_KEY;
      const savedWishlist = localStorage.getItem(storageKey);
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist from storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        const storageKey = userId ? `${WISHLIST_STORAGE_KEY}_${userId}` : WISHLIST_STORAGE_KEY;
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving wishlist to storage:", error);
      }
    }
  }, [items, isLoading, userId]);

  const itemCount = items.length;

  // Add item to wishlist
  const addToWishlist = useCallback((newItem: Omit<WishlistItem, "id" | "addedAt">) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.productId === newItem.productId);
      if (exists) return prev;

      const id = `wishlist-${newItem.productId}-${Date.now()}`;
      return [...prev, { ...newItem, id, addedAt: new Date().toISOString() }];
    });
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  // Toggle wishlist (add if not exists, remove if exists)
  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, "id" | "addedAt">) => {
      if (isInWishlist(item.productId)) {
        removeFromWishlist(item.productId);
      } else {
        addToWishlist(item);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}