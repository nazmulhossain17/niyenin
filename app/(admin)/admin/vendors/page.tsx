// ========================================
// File: app/admin/vendors/page.tsx
// Admin Vendors Management Page
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Shield,
  ShieldOff,
  Star,
  StarOff,
  Ban,
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Vendor {
  vendorId: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  averageRating: string | null;
  totalRatings: number;
  totalProducts: number;
  totalOrders: number;
  totalEarnings: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
}

interface StatusCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: any;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", icon: Clock, variant: "outline" },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
  suspended: { label: "Suspended", icon: AlertCircle, variant: "destructive" },
};

export default function AdminVendorsPage() {
  // State
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });

  // Dialog states
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionVendor, setActionVendor] = useState<Vendor | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter && statusFilter !== "all")
        params.set("status", statusFilter);

      const response = await fetch(`/api/admin/vendors?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVendors(data.data);
        setTotal(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        setCounts(data.meta?.counts || counts);
      } else {
        toast.error(data.error || "Failed to fetch vendors");
      }
    } catch (error) {
      toast.error("An error occurred while fetching vendors");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === vendors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(vendors.map((v) => v.vendorId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Action handlers
  const openActionDialog = (type: string, vendor?: Vendor) => {
    setActionType(type);
    setActionVendor(vendor || null);
    setAdminNotes(vendor?.adminNotes || "");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      const vendorIds = actionVendor ? [actionVendor.vendorId] : selectedIds;

      const response = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorIds,
          action: actionType,
          data: { adminNotes },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setSelectedIds([]);
        fetchVendors();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
      setActionDialogOpen(false);
      setActionVendor(null);
      setAdminNotes("");
    }
  };

  const viewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailDialogOpen(true);
  };

  const getActionTitle = () => {
    const count = actionVendor ? 1 : selectedIds.length;
    switch (actionType) {
      case "approve":
        return `Approve ${count} Vendor${count > 1 ? "s" : ""}`;
      case "reject":
        return `Reject ${count} Vendor${count > 1 ? "s" : ""}`;
      case "suspend":
        return `Suspend ${count} Vendor${count > 1 ? "s" : ""}`;
      case "verify":
        return `Verify ${count} Vendor${count > 1 ? "s" : ""}`;
      case "unverify":
        return `Remove Verification`;
      case "feature":
        return `Feature ${count} Vendor${count > 1 ? "s" : ""}`;
      case "unfeature":
        return `Remove from Featured`;
      default:
        return "Confirm Action";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor applications and profiles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All", value: counts.all, color: "bg-gray-500" },
          { label: "Pending", value: counts.pending, color: "bg-yellow-500" },
          { label: "Approved", value: counts.approved, color: "bg-green-500" },
          { label: "Rejected", value: counts.rejected, color: "bg-red-500" },
          {
            label: "Suspended",
            value: counts.suspended,
            color: "bg-orange-500",
          },
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
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
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
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openActionDialog("approve")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openActionDialog("reject")}
                      >
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openActionDialog("suspend")}
                      >
                        <Ban className="mr-2 h-4 w-4 text-orange-500" />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openActionDialog("verify")}
                      >
                        <Shield className="mr-2 h-4 w-4 text-blue-500" />
                        Verify
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openActionDialog("feature")}
                      >
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        Feature
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchVendors}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoading && "animate-spin")}
                  />
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
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({counts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({counts.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({counts.rejected})
                </TabsTrigger>
                <TabsTrigger value="suspended">
                  Suspended ({counts.suspended})
                </TabsTrigger>
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === vendors.length &&
                        vendors.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[250px]">Vendor</TableHead>
                  <TableHead className="min-w-[150px]">Contact</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Verified</TableHead>
                  <TableHead className="min-w-[100px]">Applied</TableHead>
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
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Store className="h-8 w-8" />
                        <p>No vendors found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => {
                    const StatusIcon =
                      statusConfig[vendor.status]?.icon || Clock;

                    return (
                      <TableRow key={vendor.vendorId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(vendor.vendorId)}
                            onCheckedChange={() =>
                              toggleSelect(vendor.vendorId)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {vendor.logo ? (
                              <img
                                src={vendor.logo}
                                alt={vendor.shopName}
                                className="h-10 w-10 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Store className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {vendor.shopName}
                                </p>
                                {vendor.isFeatured && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {vendor.userName || vendor.userEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {vendor.businessEmail && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">
                                  {vendor.businessEmail}
                                </span>
                              </div>
                            )}
                            {vendor.businessPhone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{vendor.businessPhone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{vendor.totalProducts}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span>{vendor.totalOrders}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              statusConfig[vendor.status]?.variant || "secondary"
                            }
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[vendor.status]?.label || vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {vendor.isVerified ? (
                            <Shield className="h-5 w-5 text-blue-500 mx-auto" />
                          ) : (
                            <ShieldOff className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(vendor.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => viewVendorDetails(vendor)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/shop/${vendor.shopSlug}`}
                                  target="_blank"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Shop
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openActionDialog("approve", vendor)
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openActionDialog("reject", vendor)
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {vendor.status === "approved" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("suspend", vendor)
                                  }
                                >
                                  <Ban className="mr-2 h-4 w-4 text-orange-500" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {(vendor.status === "rejected" ||
                                vendor.status === "suspended") && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("approve", vendor)
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Re-approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {vendor.isVerified ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("unverify", vendor)
                                  }
                                >
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  Remove Verification
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("verify", vendor)
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4 text-blue-500" />
                                  Verify
                                </DropdownMenuItem>
                              )}
                              {vendor.isFeatured ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("unfeature", vendor)
                                  }
                                >
                                  <StarOff className="mr-2 h-4 w-4" />
                                  Remove Featured
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog("feature", vendor)
                                  }
                                >
                                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                                  Feature
                                </DropdownMenuItem>
                              )}
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
            Showing {vendors.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, total)} of {total} vendors
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

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {actionType === "reject" || actionType === "suspend"
                ? "You can add a note explaining the reason."
                : "This action will be applied immediately."}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "reject" || actionType === "suspend") && (
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Enter reason for rejection/suspension..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
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
              onClick={handleAction}
              disabled={isSubmitting}
              variant={
                actionType === "reject" || actionType === "suspend"
                  ? "destructive"
                  : "default"
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                {selectedVendor.logo ? (
                  <img
                    src={selectedVendor.logo}
                    alt={selectedVendor.shopName}
                    className="h-16 w-16 rounded-xl object-cover border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {selectedVendor.shopName}
                    </h3>
                    {selectedVendor.isVerified && (
                      <Shield className="h-5 w-5 text-blue-500" />
                    )}
                    {selectedVendor.isFeatured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    @{selectedVendor.shopSlug}
                  </p>
                  <Badge
                    variant={statusConfig[selectedVendor.status]?.variant}
                    className="mt-2"
                  >
                    {statusConfig[selectedVendor.status]?.label}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {selectedVendor.totalProducts}
                  </p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {selectedVendor.totalOrders}
                  </p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    ৳
                    {parseFloat(
                      selectedVendor.totalEarnings || "0"
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Business Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedVendor.businessName && (
                    <div>
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="font-medium">
                        {selectedVendor.businessName}
                      </p>
                    </div>
                  )}
                  {selectedVendor.businessEmail && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {selectedVendor.businessEmail}
                      </p>
                    </div>
                  )}
                  {selectedVendor.businessPhone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {selectedVendor.businessPhone}
                      </p>
                    </div>
                  )}
                  {selectedVendor.businessAddress && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {selectedVendor.businessAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedVendor.description && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.description}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedVendor.adminNotes && (
                <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Admin Notes
                  </h4>
                  <p className="text-sm">{selectedVendor.adminNotes}</p>
                </div>
              )}

              {/* Owner Info */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold">Account Owner</h4>
                <div className="flex items-center gap-3">
                  {selectedVendor.userImage ? (
                    <img
                      src={selectedVendor.userImage}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {selectedVendor.userName?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {selectedVendor.userName || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVendor.userEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
            {selectedVendor?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openActionDialog("reject", selectedVendor);
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openActionDialog("approve", selectedVendor);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}