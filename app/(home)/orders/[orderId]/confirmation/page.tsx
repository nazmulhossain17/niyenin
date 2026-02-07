// ========================================
// File: app/(home)/orders/[orderId]/confirmation/page.tsx
// Order Confirmation Page
// ========================================

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Loader2,
  Home,
  ShoppingBag,
  Copy,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import Confetti from "react-confetti";

interface OrderItem {
  orderItemId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
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
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Get window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Stop confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch order details
  useEffect(() => {
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

    if (orderId) fetchOrder();
  }, [orderId, router]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50/50 to-background dark:from-green-950/20">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"]}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-2xl font-bold font-mono">{order.orderNumber}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyOrderNumber}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Order Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </p>
                  <p className="font-medium capitalize">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Status
                  </p>
                  <Badge className="bg-yellow-500 mt-1">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Delivery
                  </p>
                  <p className="font-medium">3-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
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

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Items ({order.items.length})
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Totals */}
              <div className="space-y-2 text-sm">
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild className="flex-1">
            <Link href="/orders">
              <Package className="w-4 h-4 mr-2" />
              View All Orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/shop">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              support@example.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}