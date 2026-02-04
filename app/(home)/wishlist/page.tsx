// ========================================
// File: app/(home)/wishlist/page.tsx
// Wishlist Page - Updated with better UI
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
  Check,
  AlertCircle,
  Grid,
  List,
  Loader2,
  Star,
  Store,
  ExternalLink,
} from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <Button size="lg" className="gap-2">
        <Package className="w-5 h-5" />
        Explore Products
      </Button>
    </Link>
  </motion.div>
);

// Wishlist Item Card Component - Grid View
const WishlistItemGridCard = ({
  item,
  onRemove,
  onAddToCart,
  isAddingToCart,
}: {
  item: any;
  onRemove: (productId: string) => void;
  onAddToCart: (item: any) => void;
  isAddingToCart: boolean;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
      toast.success("Removed from wishlist");
    }, 300);
  };

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.8 : 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden group h-full">
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
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discount}%
                </Badge>
              )}
              {!item.inStock && (
                <Badge variant="secondary" className="text-xs">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove();
                      }}
                      className="h-10 w-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from wishlist</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/products/${item.slug}`, '_blank');
                      }}
                      className="h-10 w-10"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View product</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Link>

        {/* Product Details */}
        <CardContent className="p-4">
          <Link href={`/products/${item.slug}`}>
            <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
              {item.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mt-2">
            <Store className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">{item.vendorName}</span>
          </div>

          {/* Rating if available */}
          {item.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{item.rating}</span>
              <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
            </div>
          )}

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
              <span className="text-xs text-green-600 flex items-center gap-1">
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
          <Button
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock || isAddingToCart}
            className="w-full mt-4"
            size="sm"
          >
            {isAddingToCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Wishlist Item Card Component - List View
const WishlistItemListCard = ({
  item,
  onRemove,
  onAddToCart,
  isAddingToCart,
}: {
  item: any;
  onRemove: (productId: string) => void;
  onAddToCart: (item: any) => void;
  isAddingToCart: boolean;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.productId);
      toast.success("Removed from wishlist");
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
            <Link href={`/products/${item.slug}`} className="shrink-0">
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
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Store className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.vendorName}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
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
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Out of Stock
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => onAddToCart(item)}
                  disabled={!item.inStock || isAddingToCart}
                  size="sm"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Wishlist Page
export default function WishlistPage() {
  const { items, itemCount, removeFromWishlist, clearWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleAddToCart = async (item: any) => {
    if (isInCart(item.productId)) {
      toast.info("Item is already in your cart");
      return;
    }

    setAddingToCartId(item.productId);
    await new Promise((resolve) => setTimeout(resolve, 500));

    addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
      maxQuantity: 10,
      vendorId: item.vendorId || "vendor-1",
      vendorName: item.vendorName,
    });

    setAddingToCartId(null);
    toast.success("Added to cart!");
  };

  const handleAddAllToCart = async () => {
    let addedCount = 0;
    for (const item of items) {
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
          vendorId: item.vendorId || "vendor-1",
          vendorName: item.vendorName,
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to cart`);
    } else {
      toast.info("All items are already in your cart or out of stock");
    }
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast.success("Wishlist cleared");
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Wishlist",
      text: `Check out my wishlist with ${itemCount} items!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (wishlistLoading) {
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
            <span className="text-foreground font-medium">Wishlist</span>
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
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} saved</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Share Button */}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            {/* Add All to Cart */}
            <Button size="sm" onClick={handleAddAllToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add All to Cart</span>
              <span className="sm:hidden">Add All</span>
            </Button>

            {/* Clear Wishlist */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWishlist}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Clear All</span>
            </Button>
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
                <WishlistItemGridCard
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addingToCartId === item.productId}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              {items.map((item) => (
                <WishlistItemListCard
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addingToCartId === item.productId}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Shopping */}
        <div className="mt-8">
          <Link href="/shop">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}