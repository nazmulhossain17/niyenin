// File: lib/api/categories.ts

import { Category, CategoryFormData, ApiResponse } from "@/types";

const BASE_URL = "/api/categories";

export async function getCategories(params?: {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  parentId?: string | null;
  featured?: boolean;
  tree?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Category[]>> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.includeInactive) searchParams.set("includeInactive", "true");
  if (params?.parentId) searchParams.set("parentId", params.parentId);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.tree) searchParams.set("tree", "true");
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  return response.json();
}

export async function getCategory(
  id: string,
  params?: { includeChildren?: boolean; includeParent?: boolean }
): Promise<ApiResponse<Category>> {
  const searchParams = new URLSearchParams();
  
  if (params?.includeChildren) searchParams.set("includeChildren", "true");
  if (params?.includeParent) searchParams.set("includeParent", "true");

  const response = await fetch(`${BASE_URL}/${id}?${searchParams.toString()}`);
  return response.json();
}

export async function createCategory(
  data: CategoryFormData
): Promise<ApiResponse<Category>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<ApiResponse<Category>> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCategory(
  id: string,
  params?: { cascade?: boolean; reassignTo?: string }
): Promise<ApiResponse<{ message: string }>> {
  const searchParams = new URLSearchParams();
  
  if (params?.cascade) searchParams.set("cascade", "true");
  if (params?.reassignTo) searchParams.set("reassignTo", params.reassignTo);

  const response = await fetch(`${BASE_URL}/${id}?${searchParams.toString()}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function bulkUpdateCategories(
  ids: string[],
  data: { isActive?: boolean; isFeatured?: boolean; parentId?: string | null }
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, data }),
  });
  return response.json();
}

export async function reorderCategories(
  items: { id: string; sortOrder: number }[]
): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/bulk`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorder", items }),
  });
  return response.json();
}

export async function bulkDeleteCategories(
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