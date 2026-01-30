// ========================================
// File: app/(home)/wishlist/page.tsx
// Wishlist Page
// ========================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Package,
  ArrowLeft,
  Share2,
  X,
  Check,
  AlertCircle,
  Grid,
  List,
} from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

// Empty Wishlist Component
const EmptyWishlist = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6">
      <Heart className="w-16 h-16 text-muted-foreground" />
    </div>
    <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
    <p className="text-muted-foreground text-center max-w-md mb-8">
      Save your favorite items here to buy them later or share with friends and family.
    </p>
    <Link href="/shop">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2"
      >
        <Package className="w-5 h-5" />
        Explore Products
      </motion.button>
    </Link>
  </motion.div>
);

// Wishlist Item Card Component
const WishlistItemCard = ({
  item,
  viewMode,
  onRemove,
  onAddToCart,
}: {
  item: any;
  viewMode: "grid" | "list";
  onRemove: (productId: string) => void;
  onAddToCart: (item: any) => void;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
      toast.success("Removed from wishlist");
    }, 300);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAddToCart(item);
    setIsAddingToCart(false);
    toast.success("Added to cart!");
  };

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  if (viewMode === "list") {
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
              {discount > 0 && (
                <div className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-1 rounded-full font-medium">
                  -{discount}%
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
                  {item.vendorName}
                </p>
              </div>

              <button
                onClick={handleRemove}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ৳{item.price.toLocaleString()}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ৳{item.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status & Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {item.inStock ? (
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Out of Stock
                  </span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!item.inStock || isAddingToCart}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.8 : 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-card rounded-xl border border-border overflow-hidden group"
    >
      {/* Product Image */}
      <Link href={`/products/${item.slug}`}>
        <div className="aspect-square relative bg-muted overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discount}%
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              className="p-2 bg-white rounded-full text-destructive hover:bg-destructive hover:text-white transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <Link href={`/products/${item.slug}`}>
          <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{item.vendorName}</p>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            ৳{item.price.toLocaleString()}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {item.inStock ? (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <Check className="w-3 h-3" />
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={!item.inStock || isAddingToCart}
          className="w-full mt-4 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

// Main Wishlist Page
export default function WishlistPage() {
  const { items, itemCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleAddToCart = (item: any) => {
    if (isInCart(item.productId)) {
      toast.info("Item is already in your cart");
      return;
    }

    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
      maxQuantity: 10,
      vendorId: "vendor-1",
      vendorName: item.vendorName,
    });
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    items.forEach((item) => {
      if (item.inStock && !isInCart(item.productId)) {
        addToCart({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: 1,
          maxQuantity: 10,
          vendorId: "vendor-1",
          vendorName: item.vendorName,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart`);
    } else {
      toast.info("All items are already in your cart or out of stock");
    }
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast.success("Wishlist cleared");
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Wishlist</span>
          </nav>
          <EmptyWishlist />
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
          <span className="text-foreground">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-destructive fill-destructive" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">{itemCount} items saved</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Add All to Cart</span>
            </button>

            <button
              onClick={handleClearWishlist}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <AnimatePresence mode="popLayout">
          {viewMode === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {items.map((item) => (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onRemove={removeFromWishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              {items.map((item) => (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onRemove={removeFromWishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Shopping */}
        <Link href="/shop">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-primary hover:underline mt-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </motion.button>
        </Link>
      </div>
    </div>
  );
}