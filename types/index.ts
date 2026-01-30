// File: types/index.ts

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category | null;
}

export interface Brand {
  brandId: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface Vendor {
  vendorId: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  isVerified: boolean;
  isFeatured: boolean;
  averageRating: string;
  totalProducts: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = "draft" | "pending_review" | "approved" | "rejected" | "suspended";

export interface Product {
  productId: string;
  vendorId: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  description: string | null;
  originalPrice: string;
  salePrice: string | null;
  costPrice: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  mainImage: string | null;
  images: string[];
  videoUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  isFreeShipping: boolean;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealStartAt: string | null;
  flashDealEndAt: string | null;
  viewCount: number;
  soldCount: number;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  category?: {
    categoryId: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    brandId: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  vendor?: {
    vendorId: string;
    shopName: string;
    shopSlug: string;
  } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: any;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface BrandFormData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface ProductFormData {
  vendorId: string;
  categoryId: string;
  brandId?: string | null;
  name: string;
  slug: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  originalPrice: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  mainImage?: string;
  images?: string[];
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  isFreeShipping?: boolean;
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  flashDealStartAt?: string | null;
  flashDealEndAt?: string | null;
}