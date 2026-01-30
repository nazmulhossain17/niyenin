// File: app/admin/products/page.tsx

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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { Product, Category, Brand, Vendor } from "@/types";
import {
  getProducts,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts,
  formatPrice,
  calculateDiscount,
} from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { ProductFormDialog } from "@/components/admin/products/product-form-dialog";
import { DeleteDialog, BulkDeleteDialog } from "@/components/admin/shared/delete-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock vendors for now - replace with actual API
const mockVendors: Vendor[] = [
  {
    vendorId: "v1",
    userId: "u1",
    shopName: "Tech Store",
    shopSlug: "tech-store",
    description: null,
    logo: null,
    banner: null,
    status: "approved",
    isVerified: true,
    isFeatured: false,
    averageRating: "4.5",
    totalProducts: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const statusConfig: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", icon: Clock, variant: "secondary" },
  pending_review: { label: "Pending", icon: AlertCircle, variant: "outline" },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
  suspended: { label: "Suspended", icon: AlertCircle, variant: "destructive" },
};

export default function ProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    brandId: "",
    isActive: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProducts({
        page,
        limit,
        search: searchQuery || undefined,
        status: filters.status || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        isActive: filters.isActive ? filters.isActive === "true" : undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success) {
        setProducts(response.data);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      toast.error("An error occurred while fetching products");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, filters]);

  // Fetch categories and brands
  const fetchRelatedData = useCallback(async () => {
    try {
      const [catResponse, brandResponse] = await Promise.all([
        getCategories({ limit: 1000, includeInactive: true }),
        getBrands({ limit: 1000, includeInactive: true }),
      ]);

      if (catResponse.success) setCategories(catResponse.data);
      if (brandResponse.success) setBrands(brandResponse.data);
    } catch (error) {
      console.error("Failed to fetch related data:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchRelatedData();
  }, [fetchRelatedData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
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

  // CRUD handlers
  const handleCreate = () => {
    setEditingProduct(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const response = await deleteProduct(deletingProduct.productId);
      if (response.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(response.error || "Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string, data?: Record<string, any>) => {
    try {
      const response = await bulkUpdateProducts(selectedIds, action, data);
      if (response.success) {
        toast.success(response.data?.message || "Bulk action completed");
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(response.error || "Failed to perform bulk action");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const response = await bulkDeleteProducts(selectedIds);
      if (response.success) {
        toast.success(`${selectedIds.length} products deleted`);
        setSelectedIds([]);
        fetchProducts();
      } else {
        toast.error(response.error || "Failed to delete products");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ status: "", categoryId: "", brandId: "", isActive: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
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
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
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
                        <Star className="mr-2 h-4 w-4" />
                        Mark Featured
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("unfeature")}>
                        <StarOff className="mr-2 h-4 w-4" />
                        Unmark Featured
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Zap className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleBulkAction("updateStatus", { status: "draft" })}>
                            Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction("updateStatus", { status: "pending_review" })}>
                            Pending Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction("updateStatus", { status: "approved" })}>
                            Approved
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
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

            {/* Filter Row */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <Select
                  value={filters.status}
                  onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="w-37.5">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.categoryId}
                  onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger className="w-45">
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
                  <SelectTrigger className="w-37.5">
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
                  <SelectTrigger className="w-32.5">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === products.length && products.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
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
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <p>No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const StatusIcon = statusConfig[product.status]?.icon || Clock;
                  const discount = calculateDiscount(product.originalPrice, product.salePrice);

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
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-50">{product.name}</p>
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
                          <p>{product.category?.name || "—"}</p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {product.salePrice ? (
                            <>
                              <p className="font-medium">{formatPrice(product.salePrice)}</p>
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
                            <p className="font-medium">{formatPrice(product.originalPrice)}</p>
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
                          className={
                            product.stockQuantity > 0 &&
                            product.stockQuantity <= product.lowStockThreshold
                              ? "border-yellow-500 text-yellow-600"
                              : ""
                          }
                        >
                          {product.stockQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusConfig[product.status]?.variant || "secondary"}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[product.status]?.label || product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.isActive ? (
                          <Eye className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
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
        </CardContent>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
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

      {/* Dialogs */}
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={editingProduct}
        categories={categories}
        brands={brands}
        vendors={vendors}
        onSuccess={fetchProducts}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />

      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        count={selectedIds.length}
        itemName="product"
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}