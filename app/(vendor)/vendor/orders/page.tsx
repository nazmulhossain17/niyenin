// ========================================
// File: app/vendor/orders/page.tsx
// Vendor Orders Management Page
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Calendar,
  ShoppingBag,
  AlertCircle,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";

// Types
interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string | null;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
}

interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  totalAmount: string;
  trackingNumber: string | null;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  itemCount: number;
  vendorSubtotal: number;
  customer: Customer | null;
  shippingAddress: ShippingAddress | null;
}

type TabStatus = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const orderStatuses = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
  { value: "processing", label: "Processing", color: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", color: "bg-cyan-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export default function VendorOrdersPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabStatus>("all");

  // Dialogs
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [newItemStatus, setNewItemStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (activeTab !== "all") params.set("status", activeTab);

      const response = await fetch(`/api/vendor/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.meta.totalPages);
        setTotalOrders(data.meta.total);
      } else {
        toast.error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, debouncedSearch, activeTab]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statuses = ["", "pending", "processing", "shipped", "delivered"];
      const results = await Promise.all(
        statuses.map(async (status) => {
          const params = new URLSearchParams({ limit: "1" });
          if (status) params.set("status", status);
          const res = await fetch(`/api/vendor/orders?${params}`);
          const data = await res.json();
          return { status: status || "total", count: data.meta?.total || 0 };
        })
      );

      const newStats: any = {};
      results.forEach((r) => {
        newStats[r.status] = r.count;
      });
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // View order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Update item status
  const handleStatusClick = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setNewItemStatus(item.status || "pending");
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !selectedItem) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/vendor/orders/${selectedOrder.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.orderItemId,
          status: newItemStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order item status updated");
        setIsStatusDialogOpen(false);
        fetchOrders(true);
        fetchStats();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "bg-yellow-500", icon: <Clock className="w-3 h-3" /> },
      confirmed: { color: "bg-blue-500", icon: <CheckCircle className="w-3 h-3" /> },
      processing: { color: "bg-indigo-500", icon: <Package className="w-3 h-3" /> },
      ready_to_ship: { color: "bg-purple-500", icon: <PackageCheck className="w-3 h-3" /> },
      shipped: { color: "bg-cyan-500", icon: <Truck className="w-3 h-3" /> },
      out_for_delivery: { color: "bg-teal-500", icon: <Truck className="w-3 h-3" /> },
      delivered: { color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { color: "bg-red-500", icon: <XCircle className="w-3 h-3" /> },
      returned: { color: "bg-orange-500", icon: <PackageX className="w-3 h-3" /> },
    };

    const { color, icon } = config[status] || { color: "bg-gray-500", icon: null };
    return (
      <Badge className={`${color} hover:${color} gap-1`}>
        {icon}
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    const config: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };

    return (
      <Badge variant="outline" className={config[status] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `৳${num.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy h:mm a");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage orders containing your products</p>
        </div>
        <Button onClick={() => fetchOrders(true)} variant="outline" disabled={isRefreshing}>
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
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.processing || 0}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Truck className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shipped || 0}</p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered || 0}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
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
                placeholder="Search by order number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabStatus); setCurrentPage(1); }}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-24 h-5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Orders will appear here when customers purchase your products</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Your Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>
                      <p className="font-mono font-medium">{order.orderNumber}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {order.customer?.image ? (
                            <Image
                              src={order.customer.image}
                              alt=""
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.customer?.name || "Guest"}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded bg-muted overflow-hidden"
                            title={item.productName}
                          >
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt=""
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="w-4 h-4 m-2 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                        {order.itemCount > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{order.itemCount - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.vendorSubtotal)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.items.map((item) => (
                            <DropdownMenuItem
                              key={item.orderItemId}
                              onClick={() => handleStatusClick(order, item)}
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Update: {item.productName.substring(0, 20)}...
                            </DropdownMenuItem>
                          ))}
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
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, totalOrders)} of {totalOrders} orders
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order {selectedOrder?.orderNumber}
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">
                    {selectedOrder.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  {getPaymentBadge(selectedOrder.paymentStatus)}
                </div>
                <div>
                  <p className="text-muted-foreground">Your Revenue</p>
                  <p className="font-bold text-primary">
                    {formatCurrency(selectedOrder.vendorSubtotal)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Customer & Shipping */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{selectedOrder.customer?.name || "Guest"}</p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {selectedOrder.customer?.email}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.shippingAddress.phone}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.addressLine1}
                        {selectedOrder.shippingAddress.addressLine2 &&
                          `, ${selectedOrder.shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.district}
                        {selectedOrder.shippingAddress.postalCode &&
                          ` - ${selectedOrder.shippingAddress.postalCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Your Items in This Order
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                        {getStatusBadge(item.status || "pending")}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusClick(selectedOrder, item)}
                      >
                        Update Status
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Note */}
              {selectedOrder.customerNote && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Customer Note
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedOrder.customerNote}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Item Status</DialogTitle>
            <DialogDescription>
              Update the fulfillment status for: {selectedItem?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newItemStatus} onValueChange={setNewItemStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}