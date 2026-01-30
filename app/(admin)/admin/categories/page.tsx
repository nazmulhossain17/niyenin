// File: app/admin/categories/page.tsx

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
  CardDescription,
  CardHeader,
  CardTitle,
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
  FolderTree,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Category } from "@/types";
import {
  getCategories,
  deleteCategory,
  bulkUpdateCategories,
  bulkDeleteCategories,
} from "@/lib/api/categories";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { DeleteDialog, BulkDeleteDialog } from "@/components/admin/shared/delete-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({
        page,
        limit,
        includeInactive,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });

      if (response.success) {
        setCategories(response.data);
        setTotal(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        toast.error("Failed to fetch categories");
      }

      // Fetch all categories for parent selector
      const allResponse = await getCategories({
        limit: 1000,
        includeInactive: true,
      });
      if (allResponse.success) {
        setAllCategories(allResponse.data);
      }
    } catch (error) {
      toast.error("An error occurred while fetching categories");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, includeInactive]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories by search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.categoryId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CRUD handlers
  const handleCreate = () => {
    setEditingCategory(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      const response = await deleteCategory(deletingCategory.categoryId);
      if (response.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const response = await bulkDeleteCategories(selectedIds);
      if (response.success) {
        toast.success(`${selectedIds.length} categories deleted`);
        setSelectedIds([]);
        fetchCategories();
      } else {
        toast.error(response.error || "Failed to delete categories");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      const response = await bulkUpdateCategories(selectedIds, {
        isActive: activate,
      });
      if (response.success) {
        toast.success(
          `${selectedIds.length} categories ${activate ? "activated" : "deactivated"}`
        );
        setSelectedIds([]);
        fetchCategories();
      } else {
        toast.error(response.error || "Failed to update categories");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleBulkFeature = async (feature: boolean) => {
    try {
      const response = await bulkUpdateCategories(selectedIds, {
        isFeatured: feature,
      });
      if (response.success) {
        toast.success(
          `${selectedIds.length} categories ${feature ? "featured" : "unfeatured"}`
        );
        setSelectedIds([]);
        fetchCategories();
      } else {
        toast.error(response.error || "Failed to update categories");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Get parent name
  const getParentName = (parentId: string | null) => {
    if (!parentId) return "—";
    const parent = allCategories.find((c) => c.categoryId === parentId);
    return parent?.name || "Unknown";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and hierarchy
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
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
                  placeholder="Search categories..."
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
                onClick={fetchCategories}
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
                      selectedIds.length === filteredCategories.length &&
                      filteredCategories.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Featured</TableHead>
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
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FolderTree className="h-8 w-8" />
                      <p>No categories found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow
                    key={category.categoryId}
                    className={cn(!category.isActive && "opacity-60")}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(category.categoryId)}
                        onCheckedChange={() => toggleSelect(category.categoryId)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>{getParentName(category.parentId)}</TableCell>
                    <TableCell className="text-center">{category.level}</TableCell>
                    <TableCell className="text-center">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={category.isActive ? "default" : "secondary"}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {category.isFeatured && (
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
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(category)}
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
            {Math.min(page * limit, total)} of {total} categories
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
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={editingCategory}
        categories={allCategories}
        onSuccess={fetchCategories}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />

      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        count={selectedIds.length}
        itemName="category"
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}