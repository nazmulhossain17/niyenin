// ========================================
// File: app/(home)/checkout/page.tsx
// Dynamic Checkout Page with Full Integration
// ========================================

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  MapPin,
  CreditCard,
  Truck,
  Package,
  Tag,
  ShoppingCart,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  X,
  Banknote,
  Smartphone,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Types
interface Address {
  addressId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

interface CouponValidation {
  valid: boolean;
  discount: number;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  message: string;
}

interface ShippingZone {
  zoneId: string;
  name: string;
  baseRate: string;
  estimatedDays: string;
}

// Payment methods configuration
const paymentMethods = [
  {
    id: "cash_on_delivery",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Banknote,
    available: true,
  },
  {
    id: "bkash",
    name: "bKash",
    description: "Pay with bKash mobile banking",
    icon: Smartphone,
    available: true,
  },
  {
    id: "nagad",
    name: "Nagad",
    description: "Pay with Nagad mobile banking",
    icon: Smartphone,
    available: true,
  },
  {
    id: "rocket",
    name: "Rocket",
    description: "Pay with Rocket mobile banking",
    icon: Smartphone,
    available: true,
  },
  {
    id: "sslcommerz",
    name: "Card / Net Banking",
    description: "Credit/Debit card or internet banking",
    icon: CreditCard,
    available: true,
  },
];

// Cart Item Component
const CheckoutCartItem = ({ item }: { item: any }) => (
  <div className="flex gap-3 py-3">
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
        {item.quantity}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {item.vendorName}
      </p>
      {item.variant && (
        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
      )}
    </div>
    <div className="text-right shrink-0">
      <p className="font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
      {item.originalPrice && item.originalPrice > item.price && (
        <p className="text-xs text-muted-foreground line-through">
          ৳{(item.originalPrice * item.quantity).toLocaleString()}
        </p>
      )}
    </div>
  </div>
);

// Address Card Component
const AddressCard = ({
  address,
  isSelected,
  onSelect,
  onEdit,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onSelect}
    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
      isSelected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50"
    }`}
  >
    {isSelected && (
      <div className="absolute top-3 right-3">
        <CheckCircle className="w-5 h-5 text-primary" />
      </div>
    )}
    
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
        <MapPin className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold">{address.fullName}</p>
          {address.isDefault && (
            <Badge variant="secondary" className="text-xs">Default</Badge>
          )}
          {address.label && (
            <Badge variant="outline" className="text-xs">{address.label}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{address.phone}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p className="text-sm text-muted-foreground">
          {address.city}, {address.district}
          {address.postalCode && ` - ${address.postalCode}`}
        </p>
      </div>
    </div>
    
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="absolute bottom-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      <Edit className="w-4 h-4" />
    </button>
  </motion.div>
);

// Payment Method Card
const PaymentMethodCard = ({
  method,
  isSelected,
  onSelect,
}: {
  method: typeof paymentMethods[0];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const Icon = method.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="font-medium">{method.name}</p>
          <p className="text-sm text-muted-foreground">{method.description}</p>
        </div>
      </div>
      
      {!method.available && (
        <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
          Coming Soon
        </Badge>
      )}
    </motion.div>
  );
};

// Main Checkout Page
export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  // Loading states
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Data states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("cash_on_delivery");
  const [shippingCost, setShippingCost] = useState(120); // Default shipping
  const [estimatedDelivery, setEstimatedDelivery] = useState("3-5 business days");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  // Order notes
  const [customerNote, setCustomerNote] = useState("");

  // Dialogs
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  // Calculate totals
  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
  const freeShippingThreshold = 5000;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const finalShipping = qualifiesForFreeShipping ? 0 : shippingCost;
  const total = subtotal - discount + finalShipping;
  const savings = discount + (qualifiesForFreeShipping ? shippingCost : 0);

  // Selected address
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.addressId === selectedAddressId),
    [addresses, selectedAddressId]
  );

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/checkout");
        return;
      }
      setUser(session.user);
      setIsAuthenticated(true);
    }
    checkAuth();
  }, [router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isAuthenticated && itemCount === 0) {
      router.push("/cart");
    }
  }, [isAuthenticated, itemCount, router]);

  // Fetch addresses
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      try {
        const response = await fetch("/api/user/addresses");
        const data = await response.json();
        
        if (data.success) {
          setAddresses(data.data);
          // Select default address or first address
          const defaultAddress = data.data.find((a: Address) => a.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.addressId);
          } else if (data.data.length > 0) {
            setSelectedAddressId(data.data[0].addressId);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  // Calculate shipping based on selected address
  useEffect(() => {
    if (!selectedAddress) return;

    const calculateShipping = async () => {
      setIsLoadingShipping(true);
      try {
        // Fetch shipping rates based on district
        const response = await fetch(
          `/api/shipping/calculate?district=${encodeURIComponent(selectedAddress.district)}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setShippingCost(parseFloat(data.data.rate));
          setEstimatedDelivery(data.data.estimatedDays || "3-5 business days");
        } else {
          // Default shipping
          setShippingCost(120);
          setEstimatedDelivery("3-5 business days");
        }
      } catch (error) {
        console.error("Error calculating shipping:", error);
        // Use default shipping on error
        setShippingCost(120);
      } finally {
        setIsLoadingShipping(false);
      }
    };

    calculateShipping();
  }, [selectedAddress]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal: subtotal,
          items: items.map((item) => ({
            productId: item.productId,
            vendorId: item.vendorId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon applied! You save ৳${data.data.discount.toLocaleString()}`);
      } else {
        toast.error(data.data?.message || data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Place order
  const handlePlaceOrder = async () => {
    // Validations
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        shippingAddressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.valid ? couponCode : null,
        customerNote: customerNote.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart
        clearCart();

        // Handle payment redirect for online payments
        if (selectedPaymentMethod !== "cash_on_delivery" && data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }

        // Redirect to order confirmation
        toast.success("Order placed successfully!");
        router.push(`/orders/${data.data.orderId}/confirmation`);
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Loading state
  if (isAuthenticated === null || (isAuthenticated && isLoadingAddresses)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-muted/50 to-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing checkout...</p>
        </motion.div>
      </div>
    );
  }

  // No addresses - prompt to add
  if (addresses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-muted/50 to-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-8 pb-6 px-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-5"
              >
                <MapPin className="w-8 h-8 text-primary-foreground" />
              </motion.div>

              <h2 className="text-xl font-bold mb-2">Delivery Address Required</h2>
              <p className="text-muted-foreground mb-6">
                Please add a delivery address before proceeding with checkout.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/profile/addresses?returnTo=/checkout")}
                  className="w-full h-11"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Delivery Address
                </Button>

                <Button variant="outline" onClick={() => router.back()} className="w-full h-11">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart" className="text-muted-foreground hover:text-foreground">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <h1 className="text-xl font-bold">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.addressId}
                        address={address}
                        isSelected={selectedAddressId === address.addressId}
                        onSelect={() => setSelectedAddressId(address.addressId)}
                        onEdit={() => router.push(`/profile/addresses?edit=${address.addressId}&returnTo=/checkout`)}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/profile/addresses?returnTo=/checkout")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        isSelected={selectedPaymentMethod === method.id}
                        onSelect={() => method.available && setSelectedPaymentMethod(method.id)}
                      />
                    ))}
                  </div>

                  {selectedPaymentMethod === "cash_on_delivery" && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Please keep exact change ready at the time of delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-primary" />
                    Order Notes (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add any special instructions for your order..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Special delivery instructions, gift messages, etc.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Order Summary</span>
                    <Badge variant="secondary">{itemCount} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-2 -mr-2">
                    {items.map((item) => (
                      <CheckoutCartItem key={item.id} item={item} />
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Have a coupon?</Label>
                    {appliedCoupon?.valid ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-700 dark:text-green-300">
                            {couponCode.toUpperCase()}
                          </span>
                          <Badge variant="secondary" className="text-green-600">
                            -৳{discount.toLocaleString()}
                          </Badge>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
                        >
                          <X className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="pl-10"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                        >
                          {isApplyingCoupon ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>৳{subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-৳{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Shipping
                        {isLoadingShipping && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </span>
                      {qualifiesForFreeShipping ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground">
                            ৳{shippingCost.toLocaleString()}
                          </span>
                          <span className="text-green-600 font-medium">FREE</span>
                        </div>
                      ) : (
                        <span>৳{shippingCost.toLocaleString()}</span>
                      )}
                    </div>

                    {!qualifiesForFreeShipping && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-center">
                          Add <span className="font-semibold text-primary">
                            ৳{(freeShippingThreshold - subtotal).toLocaleString()}
                          </span> more for <span className="text-green-600 font-medium">FREE shipping</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="text-center text-sm text-green-600 font-medium">
                      🎉 You're saving ৳{savings.toLocaleString()} on this order!
                    </div>
                  )}

                  {/* Delivery Estimate */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Estimated delivery: <span className="font-medium text-foreground">{estimatedDelivery}</span>
                    </span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !selectedAddressId || itemCount === 0}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>100% Secure Payment</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Fast & Reliable Delivery</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}