// ========================================
// File: app/admin/products/page.tsx
// Admin Products Management Page - Fully Functional
// ========================================

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Loader2,
  Filter,
  X,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Store,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

// Types
interface Product {
  productId: string;
  vendorId: string;
  categoryId: string | null;
  brandId: string | null;
  name: string;
  slug: string;
  sku: string | null;
  mainImage: string | null;
  originalPrice: string;
  salePrice: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: "draft" | "pending_review" | "approved" | "rejected" | "suspended";
  isActive: boolean;
  isFeatured: boolean;
  isFlashDeal: boolean;
  averageRating: string | null;
  totalRatings: number;
  soldCount: number;
  viewCount: number;
  createdAt: string;
  // Joined fields
  vendorName?: string;
  vendorStatus?: string;
  categoryName?: string;
  brandName?: string;
}

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
}

interface Brand {
  brandId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface StatusCounts {
  all: number;
  draft: number;
  pending_review: number;
  approved: number;
  rejected: number;
  suspended: number;
}

// Helpers
function formatPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return "৳0";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `৳${numPrice.toLocaleString("en-BD")}`;
}

function calculateDiscount(
  originalPrice: string | number | null | undefined,
  salePrice: string | number | null | undefined
): number {
  if (!originalPrice || !salePrice) return 0;
  const original =
    typeof originalPrice === "string" ? parseFloat(originalPrice) : originalPrice;
  const sale = typeof salePrice === "string" ? parseFloat(salePrice) : salePrice;
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: any;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", icon: Clock, variant: "secondary" },
  pending_review: { label: "Pending", icon: AlertCircle, variant: "outline" },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
  suspended: { label: "Suspended", icon: Ban, variant: "destructive" },
};

export default function AdminProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [counts, setCounts] = useState<StatusCounts>({
    all: 0,
    draft: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });

  // Additional filters
  const [filters, setFilters] = useState({
    categoryId: "",
    brandId: "",
    isActive: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action dialog for approve/reject with reason
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionProduct, setActionProduct] = useState<Product | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.brandId) params.set("brandId", filters.brandId);
      if (filters.isActive) params.set("active", filters.isActive);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotal(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        if (data.meta?.counts) {
          setCounts(data.meta.counts);
        }
      } else {
        toast.error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      toast.error("An error occurred while fetching products");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, filters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories?limit=500&tree=false");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch("/api/brands?limit=500");
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.productId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete single product
  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${deletingProduct.productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string, data?: Record<string, any>) => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedIds,
          action,
          data,
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Bulk action completed");
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(result.error || "Failed to perform bulk action");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await handleBulkAction("delete");
    } finally {
      setIsDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  // Single product action (approve/reject with reason)
  const openActionDialog = (type: string, product: Product) => {
    setActionType(type);
    setActionProduct(product);
    setActionReason("");
    setActionDialogOpen(true);
  };

  const handleSingleAction = async () => {
    if (!actionProduct) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/products/${actionProduct.productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `Product ${actionType}ed successfully`);
        fetchProducts();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
      setActionDialogOpen(false);
      setActionProduct(null);
      setActionReason("");
    }
  };

  // Quick toggle actions
  const quickToggle = async (productId: string, action: string) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [productId],
          action,
        }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Updated successfully");
        fetchProducts();
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ categoryId: "", brandId: "", isActive: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Review and manage all vendor products
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Admin View Only
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "All", value: counts.all, color: "bg-gray-500" },
          { label: "Draft", value: counts.draft, color: "bg-slate-500" },
          { label: "Pending", value: counts.pending_review, color: "bg-yellow-500" },
          { label: "Approved", value: counts.approved, color: "bg-green-500" },
          { label: "Rejected", value: counts.rejected, color: "bg-red-500" },
          { label: "Suspended", value: counts.suspended, color: "bg-orange-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      !
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions ({selectedIds.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("approve")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("reject")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                        <Eye className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("feature")}>
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        Mark Featured
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("unfeature")}>
                        <StarOff className="mr-2 h-4 w-4" />
                        Unmark Featured
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("flashDeal")}>
                        <Zap className="mr-2 h-4 w-4 text-orange-500" />
                        Add to Flash Deal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("removeFlashDeal")}>
                        <Zap className="mr-2 h-4 w-4" />
                        Remove Flash Deal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setBulkDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchProducts}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            </div>

            {/* Status Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <TabsList className="flex-wrap">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
                <TabsTrigger value="pending_review">
                  Pending ({counts.pending_review})
                </TabsTrigger>
                <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
                <TabsTrigger value="suspended">Suspended ({counts.suspended})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Additional Filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <Select
                  value={filters.categoryId}
                  onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={cat.categoryId}>
                        {"—".repeat(cat.level)} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.brandId}
                  onValueChange={(v) => setFilters((f) => ({ ...f, brandId: v }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.isActive}
                  onValueChange={(v) => setFilters((f) => ({ ...f, isActive: v }))}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === products.length && products.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[280px]">Product</TableHead>
                  <TableHead className="min-w-[120px]">Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <p>No products found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const StatusIcon = statusConfig[product.status]?.icon || Clock;
                    const discount = calculateDiscount(
                      product.originalPrice,
                      product.salePrice
                    );

                    return (
                      <TableRow
                        key={product.productId}
                        className={cn(!product.isActive && "opacity-60")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(product.productId)}
                            onCheckedChange={() => toggleSelect(product.productId)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.mainImage ? (
                              <Image
                                src={product.mainImage}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {product.sku && <span>SKU: {product.sku}</span>}
                                {product.isFeatured && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                )}
                                {product.isFlashDeal && (
                                  <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[100px]">
                              {product.vendorName || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{product.categoryName || "—"}</p>
                            {product.brandName && (
                              <p className="text-xs text-muted-foreground">
                                {product.brandName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {product.salePrice ? (
                              <>
                                <p className="font-medium">
                                  {formatPrice(product.salePrice)}
                                </p>
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatPrice(product.originalPrice)}
                                </p>
                                {discount > 0 && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    -{discount}%
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <p className="font-medium">
                                {formatPrice(product.originalPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              product.stockQuantity <= 0
                                ? "destructive"
                                : product.stockQuantity <= product.lowStockThreshold
                                ? "outline"
                                : "secondary"
                            }
                            className={cn(
                              product.stockQuantity > 0 &&
                                product.stockQuantity <= product.lowStockThreshold &&
                                "border-yellow-500 text-yellow-600"
                            )}
                          >
                            {product.stockQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={statusConfig[product.status]?.variant || "secondary"}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[product.status]?.label || product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() =>
                              quickToggle(
                                product.productId,
                                product.isActive ? "deactivate" : "activate"
                              )
                            }
                            className="cursor-pointer"
                          >
                            {product.isActive ? (
                              <Eye className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product.productId}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/products/${product.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              {/* Status Actions */}
                              {(product.status === "pending_review" ||
                                product.status === "draft") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog("approve", product)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openActionDialog("reject", product)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {product.status === "approved" && (
                                <DropdownMenuItem
                                  onClick={() => openActionDialog("suspend", product)}
                                >
                                  <Ban className="mr-2 h-4 w-4 text-orange-500" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {product.status === "suspended" && (
                                <DropdownMenuItem
                                  onClick={() => openActionDialog("unsuspend", product)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Unsuspend
                                </DropdownMenuItem>
                              )}
                              {(product.status === "rejected" ||
                                product.status === "suspended") && (
                                <DropdownMenuItem
                                  onClick={() => openActionDialog("approve", product)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Re-approve
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Toggle Actions */}
                              <DropdownMenuItem
                                onClick={() =>
                                  quickToggle(
                                    product.productId,
                                    product.isFeatured ? "unfeature" : "feature"
                                  )
                                }
                              >
                                {product.isFeatured ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                    Mark Featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  quickToggle(
                                    product.productId,
                                    product.isFlashDeal ? "removeFlashDeal" : "flashDeal"
                                  )
                                }
                              >
                                {product.isFlashDeal ? (
                                  <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Remove Flash Deal
                                  </>
                                ) : (
                                  <>
                                    <Zap className="mr-2 h-4 w-4 text-orange-500" />
                                    Add Flash Deal
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(product)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {products.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} selected products? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {selectedIds.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Approve/Reject/Suspend with reason) */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Product"}
              {actionType === "reject" && "Reject Product"}
              {actionType === "suspend" && "Suspend Product"}
              {actionType === "unsuspend" && "Unsuspend Product"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" &&
                `Approve "${actionProduct?.name}" to make it visible in the store.`}
              {actionType === "reject" &&
                `Reject "${actionProduct?.name}". Please provide a reason.`}
              {actionType === "suspend" &&
                `Suspend "${actionProduct?.name}". Please provide a reason.`}
              {actionType === "unsuspend" &&
                `Unsuspend "${actionProduct?.name}" to restore its approved status.`}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "reject" || actionType === "suspend") && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${actionType}ing this product...`}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSingleAction}
              disabled={
                isSubmitting ||
                ((actionType === "reject" || actionType === "suspend") && !actionReason.trim())
              }
              variant={
                actionType === "reject" || actionType === "suspend"
                  ? "destructive"
                  : "default"
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "suspend" && "Suspend"}
              {actionType === "unsuspend" && "Unsuspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}