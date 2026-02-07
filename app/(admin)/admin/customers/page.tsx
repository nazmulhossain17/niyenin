// ========================================
// File: app/admin/customers/page.tsx
// Admin Customers Management Page
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Store,
  Ban,
  ShieldOff,
  Trash2,
  Eye,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  MessageSquare,
  MapPin,
  Crown,
  User,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";

// Types
interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "customer" | "vendor" | "admin";
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerDetails extends Customer {
  stats: {
    orderCount: number;
    totalSpent: number;
    reviewCount: number;
    addressCount: number;
  };
  recentOrders: {
    orderId: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    createdAt: string;
  }[];
}

type TabStatus = "all" | "active" | "banned";
type RoleFilter = "all" | "customer" | "vendor" | "admin";

export default function AdminCustomersPage() {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialogs
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  // Form state
  const [banReason, setBanReason] = useState("");
  const [newRole, setNewRole] = useState<"customer" | "vendor" | "admin">("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    admins: 0,
    vendors: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customers
  const fetchCustomers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (activeTab !== "all") params.set("status", activeTab);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data);
        setTotalPages(data.meta.totalPages);
        setTotalCustomers(data.meta.total);
      } else {
        toast.error(data.error || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, activeTab, roleFilter, sortBy, sortOrder]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      // Fetch all customers count
      const allRes = await fetch("/api/admin/customers?limit=1");
      const allData = await allRes.json();

      // Fetch active count
      const activeRes = await fetch("/api/admin/customers?status=active&limit=1");
      const activeData = await activeRes.json();

      // Fetch banned count
      const bannedRes = await fetch("/api/admin/customers?status=banned&limit=1");
      const bannedData = await bannedRes.json();

      // Fetch admin count
      const adminRes = await fetch("/api/admin/customers?role=admin&limit=1");
      const adminData = await adminRes.json();

      // Fetch vendor count
      const vendorRes = await fetch("/api/admin/customers?role=vendor&limit=1");
      const vendorData = await vendorRes.json();

      setStats({
        total: allData.meta?.total || 0,
        active: activeData.meta?.total || 0,
        banned: bannedData.meta?.total || 0,
        admins: adminData.meta?.total || 0,
        vendors: vendorData.meta?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch customer details
  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const data = await response.json();
      if (data.success) {
        setCustomerDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  // Handle view customer
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerDetails(null);
    setIsViewDialogOpen(true);
    fetchCustomerDetails(customer.id);
  };

  // Handle ban/unban
  const handleBanClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setBanReason("");
    setIsBanDialogOpen(true);
  };

  const handleBanSubmit = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: !selectedCustomer.banned,
          banReason: !selectedCustomer.banned ? banReason : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setIsBanDialogOpen(false);
        fetchCustomers(true);
        fetchStats();
      } else {
        toast.error(data.error || "Failed to update customer");
      }
    } catch (error) {
      toast.error("Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role change
  const handleRoleClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewRole(customer.role);
    setIsRoleDialogOpen(true);
  };

  const handleRoleSubmit = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setIsRoleDialogOpen(false);
        fetchCustomers(true);
        fetchStats();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Customer deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchCustomers(true);
        fetchStats();
      } else {
        toast.error(data.error || "Failed to delete customer");
      }
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case "vendor":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Store className="w-3 h-3 mr-1" />Vendor</Badge>;
      default:
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Customer</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (customer: Customer) => {
    if (customer.banned) {
      return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage all users and their accounts</p>
        </div>
        <Button onClick={() => fetchCustomers(true)} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.banned}</p>
                <p className="text-xs text-muted-foreground">Banned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.vendors}</p>
                <p className="text-xs text-muted-foreground">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabStatus); setCurrentPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="banned">Banned</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as RoleFilter); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Join Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white overflow-hidden">
                          {customer.image ? (
                            <Image
                              src={customer.image}
                              alt={customer.name || ""}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {customer.name?.charAt(0).toUpperCase() || customer.email.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name || "No name"}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(customer.role)}</TableCell>
                    <TableCell>{getStatusBadge(customer)}</TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleClick(customer)}>
                            <UserCog className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBanClick(customer)}>
                            {customer.banned ? (
                              <>
                                <ShieldOff className="w-4 h-4 mr-2" />
                                Unban User
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </>
                            )}
                          </DropdownMenuItem>
                          {customer.role !== "admin" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(customer)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalCustomers)} of {totalCustomers} customers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {customerDetails ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white overflow-hidden">
                  {customerDetails.image ? (
                    <Image
                      src={customerDetails.image}
                      alt={customerDetails.name || ""}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium">
                      {customerDetails.name?.charAt(0).toUpperCase() || customerDetails.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{customerDetails.name || "No name"}</h3>
                  <p className="text-muted-foreground">{customerDetails.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(customerDetails.role)}
                    {getStatusBadge(customerDetails)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-xs">Orders</span>
                  </div>
                  <p className="text-xl font-bold">{customerDetails.stats.orderCount}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(customerDetails.stats.totalSpent)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Reviews</span>
                  </div>
                  <p className="text-xl font-bold">{customerDetails.stats.reviewCount}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Addresses</span>
                  </div>
                  <p className="text-xl font-bold">{customerDetails.stats.addressCount}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>Email verified: {customerDetails.emailVerified ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined: {formatDate(customerDetails.createdAt)}</span>
                </div>
                {customerDetails.banned && customerDetails.banReason && (
                  <div className="flex items-center gap-2 text-destructive">
                    <Ban className="w-4 h-4" />
                    <span>Ban reason: {customerDetails.banReason}</span>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              {customerDetails.recentOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Orders</h4>
                  <div className="space-y-2">
                    {customerDetails.recentOrders.map((order) => (
                      <div key={order.orderId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(parseFloat(order.totalAmount))}</p>
                          <Badge variant="outline" className="text-xs">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer?.banned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.banned
                ? `Are you sure you want to unban ${selectedCustomer?.name || selectedCustomer?.email}?`
                : `This will prevent ${selectedCustomer?.name || selectedCustomer?.email} from accessing their account.`}
            </DialogDescription>
          </DialogHeader>
          {!selectedCustomer?.banned && (
            <div className="space-y-2">
              <Label>Ban Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for banning..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedCustomer?.banned ? "default" : "destructive"}
              onClick={handleBanSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedCustomer?.banned ? "Unban User" : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedCustomer?.name || selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCustomer?.name || selectedCustomer?.email}? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}