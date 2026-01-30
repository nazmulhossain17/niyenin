// File: app/admin/brands/page.tsx

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
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Brand } from "@/types";
import {
  getBrands,
  deleteBrand,
  bulkUpdateBrands,
  bulkDeleteBrands,
} from "@/lib/api/brands";
import { BrandFormDialog } from "@/components/admin/brands/brand-form-dialog";
import { DeleteDialog, BulkDeleteDialog } from "@/components/admin/shared/delete-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BrandsPage() {
  // State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(true);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBrands({
        page,
        limit,
        includeInactive,
        search: searchQuery || undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });

      if (response.success) {
        setBrands(response.data);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        toast.error("Failed to fetch brands");
      }
    } catch (error) {
      toast.error("An error occurred while fetching brands");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, includeInactive, searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === brands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(brands.map((b) => b.brandId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CRUD handlers
  const handleCreate = () => {
    setEditingBrand(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormDialogOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setDeletingBrand(brand);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBrand) return;

    try {
      const response = await deleteBrand(deletingBrand.brandId, { force: true });
      if (response.success) {
        toast.success("Brand deleted successfully");
        fetchBrands();
      } else {
        toast.error(response.error || "Failed to delete brand");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingBrand(null);
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const response = await bulkDeleteBrands(selectedIds);
      if (response.success) {
        toast.success(`${selectedIds.length} brands deleted`);
        setSelectedIds([]);
        fetchBrands();
      } else {
        toast.error(response.error || "Failed to delete brands");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      const response = await bulkUpdateBrands(selectedIds, {
        isActive: activate,
      });
      if (response.success) {
        toast.success(
          `${selectedIds.length} brands ${activate ? "activated" : "deactivated"}`
        );
        setSelectedIds([]);
        fetchBrands();
      } else {
        toast.error(response.error || "Failed to update brands");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleBulkFeature = async (feature: boolean) => {
    try {
      const response = await bulkUpdateBrands(selectedIds, {
        isFeatured: feature,
      });
      if (response.success) {
        toast.success(
          `${selectedIds.length} brands ${feature ? "featured" : "unfeatured"}`
        );
        setSelectedIds([]);
        fetchBrands();
      } else {
        toast.error(response.error || "Failed to update brands");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage your product brands and manufacturers
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showInactive"
                  checked={includeInactive}
                  onCheckedChange={(checked) =>
                    setIncludeInactive(checked as boolean)
                  }
                />
                <label
                  htmlFor="showInactive"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Show inactive
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkActivate(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkActivate(false)}>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkFeature(true)}>
                      <Star className="mr-2 h-4 w-4" />
                      Mark Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkFeature(false)}>
                      <StarOff className="mr-2 h-4 w-4" />
                      Unmark Featured
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
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
                onClick={fetchBrands}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
              </Button>
            </div>
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
                    checked={
                      selectedIds.length === brands.length && brands.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
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
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8" />
                      <p>No brands found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow
                    key={brand.brandId}
                    className={cn(!brand.isActive && "opacity-60")}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(brand.brandId)}
                        onCheckedChange={() => toggleSelect(brand.brandId)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 w-10 rounded-lg object-contain border bg-white p-1"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          {brand.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {brand.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {brand.slug}
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          Visit
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{brand.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={brand.isActive ? "default" : "secondary"}>
                        {brand.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {brand.isFeatured && (
                        <Star className="mx-auto h-4 w-4 text-yellow-500 fill-yellow-500" />
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
                          <DropdownMenuItem onClick={() => handleEdit(brand)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(brand)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} brands
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
      <BrandFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        brand={editingBrand}
        onSuccess={fetchBrands}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description={`Are you sure you want to delete "${deletingBrand?.name}"? Products using this brand will have their brand field cleared.`}
        onConfirm={confirmDelete}
      />

      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        count={selectedIds.length}
        itemName="brand"
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}