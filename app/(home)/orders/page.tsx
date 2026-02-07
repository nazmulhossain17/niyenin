// ========================================
// File: app/(home)/orders/page.tsx
// Customer Orders Page
// ========================================

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShoppingBag,
  Loader2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { format } from "date-fns";

interface OrderItem {
  orderItemId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

type StatusFilter = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/orders");
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.meta.totalPages);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Get status config
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: {
        color: "bg-yellow-500",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-500",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Confirmed",
      },
      processing: {
        color: "bg-indigo-500",
        icon: <Package className="w-4 h-4" />,
        label: "Processing",
      },
      shipped: {
        color: "bg-cyan-500",
        icon: <Truck className="w-4 h-4" />,
        label: "Shipped",
      },
      out_for_delivery: {
        color: "bg-teal-500",
        icon: <Truck className="w-4 h-4" />,
        label: "Out for Delivery",
      },
      delivered: {
        color: "bg-green-500",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-500",
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled",
      },
      returned: {
        color: "bg-orange-500",
        icon: <Package className="w-4 h-4" />,
        label: "Returned",
      },
    };

    return configs[status] || { color: "bg-gray-500", icon: null, label: status };
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    return `৳${parseFloat(amount).toLocaleString()}`;
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setCurrentPage(1);
            }}
          >
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                When you place orders, they will appear here
              </p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);

              return (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <p className="font-mono font-semibold">{order.orderNumber}</p>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <Badge className={`${statusConfig.color} gap-1`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex gap-4 mb-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.orderItemId}
                              className="w-16 h-16 rounded-lg overflow-hidden bg-muted border-2 border-background"
                              style={{ zIndex: 3 - idx }}
                            >
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
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-16 h-16 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-sm font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {order.items[0].productName}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-sm text-muted-foreground">
                              and {order.items.length - 1} more item
                              {order.items.length > 2 ? "s" : ""}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                        <Button asChild variant="outline">
                          <Link href={`/orders/${order.orderId}`}>
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}