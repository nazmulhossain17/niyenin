// File: lib/api/brands.ts

import { Brand, BrandFormData, ApiResponse } from "@/types";

const BASE_URL = "/api/brands";

export async function getBrands(params?: {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Brand[]>> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.includeInactive) searchParams.set("includeInactive", "true");
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  return response.json();
}

export async function getBrand(
  id: string,
  params?: { includeProductCount?: boolean }
): Promise<ApiResponse<Brand>> {
  const searchParams = new URLSearchParams();
  
  if (params?.includeProductCount) searchParams.set("includeProductCount", "true");

  const response = await fetch(`${BASE_URL}/${id}?${searchParams.toString()}`);
  return response.json();
}

export async function createBrand(
  data: BrandFormData
): Promise<ApiResponse<Brand>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateBrand(
  id: string,
  data: Partial<BrandFormData>
): Promise<ApiResponse<Brand>> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteBrand(
  id: string,
  params?: { force?: boolean }
): Promise<ApiResponse<{ message: string }>> {
  const searchParams = new URLSearchParams();
  
  if (params?.force) searchParams.set("force", "true");

  const response = await fetch(`${BASE_URL}/${id}?${searchParams.toString()}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function bulkUpdateBrands(
  ids: string[],
  data: { isActive?: boolean; isFeatured?: boolean }
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, data }),
  });
  return response.json();
}

export async function reorderBrands(
  items: { id: string; sortOrder: number }[]
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorder", items }),
  });
  return response.json();
}

export async function bulkDeleteBrands(
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