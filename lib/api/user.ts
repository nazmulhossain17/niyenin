// File: lib/api/user.ts

import { ApiResponse } from "@/types";

export interface UserAddress {
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

export interface AddressFormData {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

const BASE_URL = "/api/user/addresses";

// Get all addresses for current user
export async function getAddresses(): Promise<ApiResponse<UserAddress[]>> {
  const response = await fetch(BASE_URL);
  return response.json();
}

// Get single address
export async function getAddress(addressId: string): Promise<ApiResponse<UserAddress>> {
  const response = await fetch(`${BASE_URL}/${addressId}`);
  return response.json();
}

// Create new address
export async function createAddress(data: AddressFormData): Promise<ApiResponse<UserAddress>> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Update address
export async function updateAddress(
  addressId: string,
  data: Partial<AddressFormData>
): Promise<ApiResponse<UserAddress>> {
  const response = await fetch(`${BASE_URL}/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Delete address
export async function deleteAddress(addressId: string): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${BASE_URL}/${addressId}`, {
    method: "DELETE",
  });
  return response.json();
}

// Set address as default
export async function setDefaultAddress(addressId: string): Promise<ApiResponse<UserAddress>> {
  return updateAddress(addressId, { isDefault: true });
}

// Bangladesh districts list
export const bangladeshDistricts = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Rangpur",
  "Barisal",
  "Mymensingh",
  "Comilla",
  "Gazipur",
  "Narayanganj",
  "Bogra",
  "Cox's Bazar",
  "Jessore",
  "Dinajpur",
  "Brahmanbaria",
  "Tangail",
  "Narsingdi",
  "Savar",
  "Tongi",
  // Add more as needed
].sort();