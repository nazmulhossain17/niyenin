// File: hooks/use-shop-data.ts
// Custom hook for optimized shop data fetching

import { useState, useEffect, useRef, useCallback } from "react";

interface Product {
  productId: string;
  [key: string]: any;
}

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  [key: string]: any;
}

interface Brand {
  brandId: string;
  name: string;
  slug: string;
  [key: string]: any;
}

interface UseShopDataResult {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
  isFiltering: boolean;
  totalProducts: number;
  totalPages: number;
  refetchProducts: () => void;
}

interface FilterParams {
  page: number;
  limit: number;
  search?: string;
  categorySlug?: string;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  inStock?: boolean;
  featured?: boolean;
  flashDeal?: boolean;
}

// Build category tree from flat array
function buildCategoryTree(items: Category[], parentId: string | null = null): Category[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildCategoryTree(items, item.categoryId),
    }));
}

// Find category ID from slug in tree
function findCategoryId(cats: Category[], slug: string): string | null {
  for (const cat of cats) {
    if (cat.slug === slug) return cat.categoryId;
    if (cat.children) {
      const found = findCategoryId(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export function useShopData(filters: FilterParams): UseShopDataResult {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Refs to prevent duplicate fetches
  const categoriesFetchedRef = useRef(false);
  const brandsFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchKeyRef = useRef<string>("");

  // Fetch categories once
  useEffect(() => {
    if (categoriesFetchedRef.current) return;
    categoriesFetchedRef.current = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?limit=100");
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setCategories(buildCategoryTree(data.data));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands once
  useEffect(() => {
    if (brandsFetchedRef.current) return;
    brandsFetchedRef.current = true;

    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands?limit=100");
        if (!response.ok) return;
        const data = await response.json();
        if (data.success) {
          setBrands(data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  // Create stable fetch key
  const fetchKey = JSON.stringify({
    page: filters.page,
    search: filters.search || "",
    categorySlug: filters.categorySlug || "",
    brandIds: filters.brandIds?.join(",") || "",
    minPrice: filters.minPrice || 0,
    maxPrice: filters.maxPrice || 500000,
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
    inStock: filters.inStock || false,
    featured: filters.featured || false,
    flashDeal: filters.flashDeal || false,
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    // Skip if same request
    if (lastFetchKeyRef.current === fetchKey && products.length > 0) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastFetchKeyRef.current = fetchKey;

    setIsFiltering(true);

    try {
      const params = new URLSearchParams();
      params.set("page", filters.page.toString());
      params.set("limit", filters.limit.toString());
      params.set("sortBy", filters.sortBy || "createdAt");
      params.set("sortOrder", filters.sortOrder || "desc");
      params.set("isActive", "true");
      params.set("status", "approved");

      if (filters.search) params.set("search", filters.search);
      
      if (filters.categorySlug && categories.length > 0) {
        const categoryId = findCategoryId(categories, filters.categorySlug);
        if (categoryId) params.set("categoryId", categoryId);
      }
      
      if (filters.brandIds && filters.brandIds.length > 0) {
        params.set("brandId", filters.brandIds[0]);
      }
      
      if (filters.minPrice && filters.minPrice > 0) {
        params.set("minPrice", filters.minPrice.toString());
      }
      
      if (filters.maxPrice && filters.maxPrice < 500000) {
        params.set("maxPrice", filters.maxPrice.toString());
      }
      
      if (filters.inStock) params.set("inStock", "true");
      if (filters.featured) params.set("isFeatured", "true");
      if (filters.flashDeal) params.set("isFlashDeal", "true");

      const response = await fetch(`/api/products?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotalProducts(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching products:", error);
      }
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  }, [fetchKey, categories, filters]);

  // Fetch products when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  return {
    products,
    categories,
    brands,
    isLoading,
    isFiltering,
    totalProducts,
    totalPages,
    refetchProducts: fetchProducts,
  };
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}