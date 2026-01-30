// ========================================
// File: app/(home)/cart/page.tsx
// Shopping Cart Page
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
  X,
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";

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
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2"
      >
        <Package className="w-5 h-5" />
        Start Shopping
      </motion.button>
    </Link>
  </motion.div>
);

// Cart Item Component
const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
}: {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (item: any) => void;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? -100 : 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-card rounded-xl border border-border p-4 md:p-6"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.slug}`} className="shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted relative">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                  {item.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Sold by: {item.vendorName}
              </p>
              {item.variant && (
                <p className="text-sm text-muted-foreground">
                  {item.variant.name}
                </p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove from cart"
            >
              <Trash2 className="w-5 h-5" />
            </button>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                disabled={item.quantity >= item.maxQuantity}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Item Total & Actions */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">৳{(item.price * item.quantity).toLocaleString()}</span>
            </span>
            <button
              onClick={() => onMoveToWishlist(item)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              Move to Wishlist
            </button>
          </div>
        </div>
      </div>
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

  const shippingCost = subtotal > 5000 ? 0 : 120;
  const total = subtotal - discount + shippingCost;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
      toast.success("Coupon applied! You saved 10%");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      {/* Coupon Input */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Have a coupon?</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponApplied}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode || couponApplied}
            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {couponApplied && (
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Coupon "SAVE10" applied
          </p>
        )}
      </div>

      {/* Summary Items */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Discount</span>
            <span>-৳{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingCost === 0 ? <span className="text-green-500">Free</span> : `৳${shippingCost}`}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
          <span>Total</span>
          <span className="text-primary">৳{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCheckout}
        disabled={isLoading}
        className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="w-5 h-5 text-green-500" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Truck className="w-5 h-5 text-blue-500" />
          <span>Free shipping on orders over ৳5,000</span>
        </div>
      </div>
    </div>
  );
};

// Main Cart Page
export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
      toast.success("Moved to wishlist");
    }
    removeFromCart(item.id);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // Simulate a small delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/checkout");
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shopping Cart</span>
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
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">{itemCount} items in your cart</p>
          </div>
          <button
            onClick={() => {
              clearCart();
              toast.success("Cart cleared");
            }}
            className="text-destructive hover:underline text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </button>
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
                />
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link href="/shop">
              <motion.button
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-primary hover:underline mt-6"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </motion.button>
            </Link>
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