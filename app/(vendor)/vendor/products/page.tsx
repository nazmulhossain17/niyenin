// ========================================
// File: app/vendor/products/page.tsx
// Vendor Products List Page
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Ban,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  categoryName?: string;
  brandName?: string;
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
    description: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: Clock,
    variant: "secondary",
    description: "Not submitted for review",
  },
  pending_review: {
    label: "Pending",
    icon: AlertCircle,
    variant: "outline",
    description: "Waiting for admin approval",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    variant: "default",
    description: "Live on store",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive",
    description: "Not approved - see reason",
  },
  suspended: {
    label: "Suspended",
    icon: Ban,
    variant: "destructive",
    description: "Temporarily disabled",
  },
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const response = await fetch(`/api/vendor/products?${params.toString()}`);
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
  }, [page, limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Delete product
  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/vendor/products/${deletingProduct.productId}`,
        { method: "DELETE" }
      );
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

  // Toggle active status (only for approved products)
  const toggleActive = async (product: Product) => {
    if (product.status !== "approved") {
      toast.error("Only approved products can be toggled");
      return;
    }

    try {
      const response = await fetch(`/api/vendor/products/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(
          product.isActive ? "Product deactivated" : "Product activated"
        );
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Submit draft for review
  const submitForReview = async (product: Product) => {
    try {
      const response = await fetch(`/api/vendor/products/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_review" }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Product submitted for review");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to submit product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Duplicate product
  const duplicateProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/vendor/products/${product.productId}/duplicate`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Product duplicated as draft");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to duplicate product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/vendor/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
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
                variant="outline"
                size="icon"
                onClick={fetchProducts}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
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
                  <TableHead className="min-w-[280px]">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Sales</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="h-8 w-8" />
                        <p>No products found</p>
                        <Link href="/vendor/products/new">
                          <Button size="sm" className="mt-2">
                            <Plus className="h-4 w-4 mr-1" />
                            Add your first product
                          </Button>
                        </Link>
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
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              variant={statusConfig[product.status]?.variant || "secondary"}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[product.status]?.label || product.status}
                            </Badge>
                            {product.status === "approved" && (
                              <span className="text-xs text-muted-foreground">
                                {product.isActive ? "Live" : "Hidden"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <p className="font-medium">{product.soldCount}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.viewCount} views
                            </p>
                          </div>
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
                                <Link href={`/vendor/products/${product.productId}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {product.status === "approved" && (
                                <DropdownMenuItem asChild>
                                  <a
                                    href={`/products/${product.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Live
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />

                              {/* Draft actions */}
                              {product.status === "draft" && (
                                <DropdownMenuItem onClick={() => submitForReview(product)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Submit for Review
                                </DropdownMenuItem>
                              )}

                              {/* Approved actions */}
                              {product.status === "approved" && (
                                <DropdownMenuItem onClick={() => toggleActive(product)}>
                                  {product.isActive ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />
                                      Hide from Store
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Show on Store
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}

                              {/* Rejected - allow resubmit after edit */}
                              {product.status === "rejected" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/vendor/products/${product.productId}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
                                    Edit & Resubmit
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => duplicateProduct(product)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(product)}
                                className="text-destructive focus:text-destructive"
                                disabled={product.soldCount > 0}
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
                const pageNum = i + 1;
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
    </div>
  );
}