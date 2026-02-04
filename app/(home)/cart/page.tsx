// ========================================
// File: app/(home)/cart/page.tsx
// Shopping Cart Page - Updated with better UI
// ========================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  Package,
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2,
  Store,
  Gift,
  Clock,
  Percent,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Empty Cart Component
const EmptyCart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
      <ShoppingCart className="w-16 h-16 text-muted-foreground" />
    </div>
    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
    <p className="text-muted-foreground text-center max-w-md mb-8">
      Looks like you haven't added anything to your cart yet. Start shopping and discover amazing products!
    </p>
    <Link href="/shop">
      <Button size="lg" className="gap-2">
        <Package className="w-5 h-5" />
        Start Shopping
      </Button>
    </Link>
  </motion.div>
);

// Cart Item Component
const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  isUpdating,
}: {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (item: any) => void;
  isUpdating: boolean;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 300);
  };

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? -100 : 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-4">
            {/* Product Image */}
            <Link href={`/shop/${item.slug}`} className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted relative group">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/shop/${item.slug}`}>
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Store className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.vendorName}</span>
                  </div>
                  {item.variant && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {item.variant.name}
                    </Badge>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Price and Quantity */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    ৳{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ৳{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-12 h-8 flex items-center justify-center border rounded-md bg-muted/50">
                    <span className="font-medium text-sm">{item.quantity}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity || isUpdating}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Item Total & Actions */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">Subtotal: </span>
                  <span className="font-semibold text-foreground">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveToWishlist(item)}
                  className="text-primary hover:text-primary"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Save for Later
                </Button>
              </div>

              {/* Stock Warning */}
              {item.quantity >= item.maxQuantity && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-3 h-3" />
                  Maximum quantity reached
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Order Summary Component
const OrderSummary = ({
  subtotal,
  itemCount,
  onCheckout,
  isLoading,
}: {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  isLoading: boolean;
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shippingCost = subtotal > 5000 ? 0 : 120;
  const total = subtotal - discount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (couponCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
      toast.success("Coupon applied! You saved 10%");
    } else if (couponCode.toLowerCase() === "save20") {
      setDiscount(subtotal * 0.2);
      setCouponApplied(true);
      toast.success("Coupon applied! You saved 20%");
    } else {
      toast.error("Invalid coupon code");
    }
    setIsApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscount(0);
    toast.success("Coupon removed");
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        {/* Coupon Input */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">
            <Tag className="w-4 h-4 inline mr-1" />
            Have a coupon?
          </label>
          {couponApplied ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">{couponCode.toUpperCase()}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={removeCoupon}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponCode || isApplyingCoupon}
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

        <Separator className="my-4" />

        {/* Summary Items */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
            <span className="font-medium">৳{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Discount
              </span>
              <span>-৳{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Shipping
            </span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `৳${shippingCost}`
              )}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary">৳{total.toLocaleString()}</span>
        </div>

        {/* Savings Badge */}
        {discount > 0 && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              🎉 You're saving ৳{discount.toLocaleString()}!
            </span>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          size="lg"
          className="w-full mt-6"
          onClick={onCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-green-500 shrink-0" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Truck className="w-5 h-5 text-blue-500 shrink-0" />
            <span>Free shipping on orders over ৳5,000</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Delivery within 3-5 business days</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Gift className="w-5 h-5 text-purple-500 shrink-0" />
            <span>Gift wrapping available at checkout</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Cart Page
export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMoveToWishlist = (item: any) => {
    if (!isInWishlist(item.productId)) {
      addToWishlist({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        originalPrice: item.originalPrice,
        inStock: true,
        vendorName: item.vendorName,
      });
      toast.success("Saved to wishlist");
    } else {
      toast.info("Already in wishlist");
    }
    removeFromCart(item.id);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/checkout");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Shopping Cart</span>
          </nav>
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              Shopping Cart
            </h1>
            <p className="text-muted-foreground mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleClearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onMoveToWishlist={handleMoveToWishlist}
                  isUpdating={isUpdating}
                />
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/shop">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={subtotal}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={isCheckingOut}
            />
          </div>
        </div>
      </div>
    </div>
  );
}