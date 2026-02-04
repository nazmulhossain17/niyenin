// ========================================
// File: app/(home)/shop/[slug]/page.tsx
// Product Details Page - Fetches from API
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Package,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Store,
  Award,
  Clock,
  Zap,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";

// ======================
// Types matching API response
// ======================
interface ProductDetail {
  productId: string;
  vendorId: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  mainImage: string | null;
  images: string[] | null;
  originalPrice: string;
  salePrice: string | null;
  stockQuantity: number;
  sku: string | null;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealStartAt: string | null;
  flashDealEndAt: string | null;
  averageRating: string;
  totalRatings: number;
  soldCount: number;
  viewCount: number;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  // Flat vendor fields
  vendorName: string | null;
  vendorSlug: string | null;
  vendorLogo: string | null;
  // Flat category/brand
  categoryName: string | null;
  brandName: string | null;
}

interface RelatedProduct {
  productId: string;
  name: string;
  slug: string;
  mainImage: string | null;
  originalPrice: string;
  salePrice: string | null;
  averageRating: string;
  totalRatings: number;
  vendorName: string | null;
}

// ======================
// Image Gallery Component
// ======================
const ImageGallery = ({ images }: { images: string[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrev = () =>
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          {images[selectedIndex] ? (
            <Image
              src={images[selectedIndex]}
              alt={`Product image ${selectedIndex + 1}`}
              fill
              className="object-contain p-4"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-muted-foreground/30" />
            </div>
          )}
        </motion.div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {image ? (
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-4xl aspect-square">
              {images[selectedIndex] && (
                <Image
                  src={images[selectedIndex]}
                  alt="Zoomed product"
                  fill
                  className="object-contain"
                />
              )}
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Rating Stars
const RatingStars = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : star - 0.5 <= rating
              ? "text-yellow-400 fill-yellow-400/50"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// Loading skeleton for detail page
const ProductDetailSkeleton = () => (
  <div className="max-w-[1600px] mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-5 w-60" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

// ======================
// Main Product Details Page
// ======================
export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();

        if (data.success && data.data) {
          setProduct(data.data);

          // Fetch related products by same category
          if (data.data.categoryId) {
            try {
              const relRes = await fetch(
                `/api/products?categoryId=${data.data.categoryId}&limit=5`
              );
              const relData = await relRes.json();
              if (relData.success) {
                // Exclude current product
                setRelatedProducts(
                  relData.data.filter(
                    (p: RelatedProduct) =>
                      p.productId !== data.data.productId
                  )
                );
              }
            } catch {
              // Related products are optional
            }
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  // Computed values
  const price = product?.salePrice
    ? parseFloat(product.salePrice)
    : parseFloat(product?.originalPrice || "0");
  const originalPrice = parseFloat(product?.originalPrice || "0");
  const discount =
    product?.salePrice && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const rating = parseFloat(product?.averageRating || "0");
  const allImages = product
    ? [
        product.mainImage,
        ...(product.images || []),
      ].filter(Boolean) as string[]
    : [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      image: product.mainImage || "",
      price,
      originalPrice,
      quantity,
      maxQuantity: Math.min(product.stockQuantity, 10),
      vendorId: product.vendorId,
      vendorName: product.vendorName || "Unknown",
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      image: product.mainImage || "",
      price,
      originalPrice,
      inStock: product.stockQuantity > 0,
      vendorName: product.vendorName || "Unknown",
    });
    toast.success(
      isInWishlist(product.productId)
        ? "Removed from wishlist"
        : "Added to wishlist"
    );
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name}`;
    switch (platform) {
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
    }
    setShowShareMenu(false);
  };

  // ---- LOADING ----
  if (isLoading) return <ProductDetailSkeleton />;

  // ---- ERROR ----
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold">
            {error || "Product not found"}
          </h2>
          <p className="text-muted-foreground">
            This product may have been removed or is currently unavailable.
          </p>
          <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.productId);
  const inWishlist = isInWishlist(product.productId);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            {product.categoryName && (
              <>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <Link
                  href={`/shop?categoryId=${product.categoryId}`}
                  className="hover:text-foreground"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-foreground truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery
              images={allImages.length > 0 ? allImages : [""]}
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-sm">
              {product.brandName && (
                <span className="text-primary font-medium">
                  {product.brandName}
                </span>
              )}
              {product.brandName && product.categoryName && (
                <span className="text-muted-foreground">•</span>
              )}
              {product.categoryName && (
                <Link
                  href={`/shop?categoryId=${product.categoryId}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {product.categoryName}
                </Link>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isFeatured && (
                <Badge className="bg-purple-500">Featured</Badge>
              )}
              {product.isFlashDeal && (
                <Badge className="bg-orange-500">Flash Deal</Badge>
              )}
              {product.stockQuantity === 0 && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
              {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  Only {product.stockQuantity} left
                </Badge>
              )}
            </div>

            {/* Rating & Stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <RatingStars rating={rating} size="md" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {product.totalRatings} Reviews
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {product.soldCount} Sold
              </span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ৳{price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-destructive text-white text-sm px-2 py-1 rounded-full">
                      -{discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-muted-foreground">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          Math.min(product.stockQuantity, 10),
                          q + 1
                        )
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stockQuantity} pieces available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className={`flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                  inCart
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : product.stockQuantity === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20"
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </motion.button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleToggleWishlist}
                className={`flex items-center gap-2 text-sm ${
                  inWishlist
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-destructive"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                />
                {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-card rounded-lg shadow-lg border border-border p-2 flex gap-2"
                    >
                      <button
                        onClick={() => handleShare("copy")}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="p-2 hover:bg-muted rounded-lg text-blue-600"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="p-2 hover:bg-muted rounded-lg text-sky-500"
                      >
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="p-2 hover:bg-muted rounded-lg text-blue-700"
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Standard Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Warranty Included</p>
                  <p className="text-sm text-muted-foreground">
                    Official warranty covered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">7 Days Return</p>
                  <p className="text-sm text-muted-foreground">
                    Easy returns & refunds
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            {product.vendorName && (
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white overflow-hidden">
                      {product.vendorLogo ? (
                        <Image
                          src={product.vendorLogo}
                          alt={product.vendorName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/vendors/${product.vendorSlug || product.vendorId}`}
                        className="font-medium hover:text-primary"
                      >
                        {product.vendorName}
                      </Link>
                    </div>
                  </div>
                  <Link
                    href={`/vendors/${product.vendorSlug || product.vendorId}`}
                    className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="border-b border-border">
            <div className="flex gap-8">
              {[
                { id: "description" as const, label: "Description" },
                { id: "specifications" as const, label: "Details" },
                {
                  id: "reviews" as const,
                  label: `Reviews (${product.totalRatings})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-gray dark:prose-invert max-w-none"
                >
                  {product.description ? (
                    <p className="whitespace-pre-line">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      No description available for this product.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.sku && (
                      <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="font-medium w-32 shrink-0">SKU</span>
                        <span className="text-muted-foreground font-mono">
                          {product.sku}
                        </span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex gap-4 p-4 rounded-lg">
                        <span className="font-medium w-32 shrink-0">
                          Weight
                        </span>
                        <span className="text-muted-foreground">
                          {product.weight}
                        </span>
                      </div>
                    )}
                    {product.length && (
                      <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="font-medium w-32 shrink-0">
                          Dimensions
                        </span>
                        <span className="text-muted-foreground">
                          {product.length} × {product.width || "—"} ×{" "}
                          {product.height || "—"}
                        </span>
                      </div>
                    )}
                    {product.brandName && (
                      <div className="flex gap-4 p-4 rounded-lg">
                        <span className="font-medium w-32 shrink-0">
                          Brand
                        </span>
                        <span className="text-muted-foreground">
                          {product.brandName}
                        </span>
                      </div>
                    )}
                    {product.categoryName && (
                      <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="font-medium w-32 shrink-0">
                          Category
                        </span>
                        <span className="text-muted-foreground">
                          {product.categoryName}
                        </span>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex gap-4 p-4 rounded-lg">
                        <span className="font-medium w-32 shrink-0">Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Rating Summary */}
                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold">
                          {rating.toFixed(1)}
                        </div>
                        <RatingStars rating={rating} size="lg" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on {product.totalRatings} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  {product.totalRatings === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Link
                href={`/shop?categoryId=${product.categoryId}`}
                className="text-primary hover:underline text-sm flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.map((rp) => {
                const rpPrice = rp.salePrice
                  ? parseFloat(rp.salePrice)
                  : parseFloat(rp.originalPrice);
                const rpOriginal = parseFloat(rp.originalPrice);
                const rpDiscount = rp.salePrice
                  ? Math.round(
                      ((rpOriginal - rpPrice) / rpOriginal) * 100
                    )
                  : 0;
                const rpRating = parseFloat(rp.averageRating) || 0;

                return (
                  <motion.div
                    key={rp.productId}
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-xl border border-border overflow-hidden group"
                  >
                    <Link href={`/shop/${rp.slug}`}>
                      <div className="aspect-square relative bg-muted overflow-hidden">
                        {rp.mainImage ? (
                          <Image
                            src={rp.mainImage}
                            alt={rp.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {rpDiscount > 0 && (
                          <span className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-1 rounded-full">
                            -{rpDiscount}%
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/shop/${rp.slug}`}>
                        <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                          {rp.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <RatingStars rating={rpRating} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ({rp.totalRatings})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-primary font-bold">
                          ৳{rpPrice.toLocaleString()}
                        </span>
                        {rpDiscount > 0 && (
                          <span className="text-muted-foreground text-sm line-through">
                            ৳{rpOriginal.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}