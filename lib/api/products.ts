// File: lib/api/products.ts

import { Product, ProductFormData, ApiResponse } from "@/types";

const BASE_URL = "/api/products";

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  vendorId?: string;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Product[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.brandId) searchParams.set("brandId", params.brandId);
  if (params?.vendorId) searchParams.set("vendorId", params.vendorId);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.isActive !== undefined) searchParams.set("isActive", params.isActive.toString());
  if (params?.isFeatured) searchParams.set("isFeatured", "true");
  if (params?.isFlashDeal) searchParams.set("isFlashDeal", "true");
  if (params?.minPrice) searchParams.set("minPrice", params.minPrice.toString());
  if (params?.maxPrice) searchParams.set("maxPrice", params.maxPrice.toString());
  if (params?.inStock) searchParams.set("inStock", "true");
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  return response.json();
}

export async function getProduct(
  id: string,
  params?: {
    includeVariants?: boolean;
    includeSpecs?: boolean;
    includeReviews?: boolean;
  }
): Promise<ApiResponse<Product>> {
  const searchParams = new URLSearchParams();

  if (params?.includeVariants) searchParams.set("includeVariants", "true");
  if (params?.includeSpecs) searchParams.set("includeSpecs", "true");
  if (params?.includeReviews) searchParams.set("includeReviews", "true");

  const response = await fetch(`${BASE_URL}/${id}?${searchParams.toString()}`);
  return response.json();
}

export async function createProduct(
  data: ProductFormData
): Promise<ApiResponse<Product>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>
): Promise<ApiResponse<Product>> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteProduct(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

// Bulk operations
export async function bulkUpdateProducts(
  ids: string[],
  action: string,
  data?: Record<string, any>
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action, data }),
  });
  return response.json();
}

export async function bulkDeleteProducts(
  ids: string[]
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return response.json();
}

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper function to format price
export function formatPrice(price: string | number, currency = "৳"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `${currency}${numPrice.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

// Helper function to calculate discount percentage
export function calculateDiscount(originalPrice: string, salePrice: string | null): number {
  if (!salePrice) return 0;
  const original = parseFloat(originalPrice);
  const sale = parseFloat(salePrice);
  return Math.round(((original - sale) / original) * 100);
}

// Helper to get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "secondary",
    pending_review: "warning",
    approved: "success",
    rejected: "destructive",
    suspended: "destructive",
  };
  return colors[status] || "secondary";
}