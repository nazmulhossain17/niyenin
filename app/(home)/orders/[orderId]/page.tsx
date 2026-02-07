// ========================================
// File: app/(home)/orders/[orderId]/page.tsx
// Customer Order Detail Page
// ========================================

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronLeft,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Loader2,
  Copy,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { format } from "date-fns";

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
  deliveredAt: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
}

// Order timeline steps
const timelineSteps = [
  { status: "pending", label: "Order Placed", icon: ShoppingBag },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push(`/sign-in?callbackUrl=/orders/${orderId}`);
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router, orderId]);

  // Fetch order
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          toast.error("Order not found");
          router.push("/orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, orderId, router]);

  // Get current step index
  const getCurrentStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    const index = timelineSteps.findIndex((step) => step.status === status);
    return index >= 0 ? index : 0;
  };

  // Get status config
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; label: string }> = {
      pending: { color: "text-yellow-600", bgColor: "bg-yellow-500", label: "Pending" },
      confirmed: { color: "text-blue-600", bgColor: "bg-blue-500", label: "Confirmed" },
      processing: { color: "text-indigo-600", bgColor: "bg-indigo-500", label: "Processing" },
      shipped: { color: "text-cyan-600", bgColor: "bg-cyan-500", label: "Shipped" },
      out_for_delivery: { color: "text-teal-600", bgColor: "bg-teal-500", label: "Out for Delivery" },
      delivered: { color: "text-green-600", bgColor: "bg-green-500", label: "Delivered" },
      cancelled: { color: "text-red-600", bgColor: "bg-red-500", label: "Cancelled" },
      returned: { color: "text-orange-600", bgColor: "bg-orange-500", label: "Returned" },
    };
    return configs[status] || { color: "text-gray-600", bgColor: "bg-gray-500", label: status };
  };

  // Copy order number
  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success("Order number copied!");
    }
  };

  // Format currency
  const formatCurrency = (amount: string) => {
    return `৳${parseFloat(amount).toLocaleString()}`;
  };

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusConfig = getStatusConfig(order.status);
  const currentStepIndex = getCurrentStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/orders">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono">{order.orderNumber}</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyOrderNumber}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Badge className={`${statusConfig.bgColor} text-white`}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Timeline */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {timelineSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                              isCompleted
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.div>
                          <p
                            className={`text-xs mt-2 text-center ${
                              isCompleted ? "text-primary font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-mono font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Order Cancelled
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      This order has been cancelled.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">
                      {order.paymentMethod.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Status</p>
                    <Badge
                      variant="outline"
                      className={
                        order.paymentStatus === "paid"
                          ? "border-green-500 text-green-600"
                          : order.paymentStatus === "failed"
                          ? "border-red-500 text-red-600"
                          : "border-yellow-500 text-yellow-600"
                      }
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  {order.deliveredAt && (
                    <div>
                      <p className="text-muted-foreground">Delivered On</p>
                      <p className="font-medium">
                        {format(new Date(order.deliveredAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2 &&
                        `, ${order.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.district}
                      {order.shippingAddress.postalCode &&
                        ` - ${order.shippingAddress.postalCode}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <Link href={`/shop/${item.productId}`}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.productId}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                      {item.status && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {item.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold shrink-0">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Order Summary */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {parseFloat(order.shippingCost) === 0
                      ? "FREE"
                      : formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Note */}
        {order.customerNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Order Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.customerNote}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <Button asChild variant="outline" className="flex-1">
            <Link href="/orders">Back to Orders</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}