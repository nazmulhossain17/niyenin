// ========================================
// File: components/home/shop-section.tsx
// Dynamic & Responsive Shop Section
// ========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Types
interface Product {
  productId: string;
  vendorId: string;
  name: string;
  slug: string;
  mainImage: string | null;
  originalPrice: string;
  salePrice: string | null;
  stockQuantity: number;
  averageRating: string;
  totalRatings: number;
  isFlashDeal: boolean;
  isFeatured: boolean;
  soldCount: number;
  createdAt: string;
  category?: {
    categoryId: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    brandId: string;
    name: string;
    slug: string;
  } | null;
  vendor?: {
    vendorId: string;
    shopName: string;
    shopSlug: string;
  } | null;
}

interface Category {
  categoryId: string;
  name: string;
  slug: string;
}

interface ShopConfig {
  showPromoCard?: boolean;
  showLatestItems?: boolean;
  showDealsSection?: boolean;
  maxBestSellers?: number;
  maxLatestItems?: number;
  maxCategories?: number;
}

const defaultConfig: ShopConfig = {
  showPromoCard: true,
  showLatestItems: true,
  showDealsSection: true,
  maxBestSellers: 4,
  maxLatestItems: 3,
  maxCategories: 6,
};

// Helper functions
const getDiscount = (original: string, sale: string | null) => {
  if (!sale) return 0;
  const orig = parseFloat(original);
  const salePrice = parseFloat(sale);
  return Math.round(((orig - salePrice) / orig) * 100);
};

const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `৳${num.toLocaleString()}`;
};

// Star Rating Component
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate?: Date }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = endDate || new Date(Date.now() + 11 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTime(calculateTime());
    const timer = setInterval(() => setTime(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 border-border flex items-center justify-center bg-background">
            <span className="text-xs sm:text-sm lg:text-base font-semibold text-foreground">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground capitalize">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Custom hook for cart (localStorage-based to avoid context dependency)
function useCartLocal() {
  const [cartItems, setCartItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const items = JSON.parse(stored);
        setCartItems(items.map((i: any) => i.productId));
      }
    } catch (e) {
      console.error("Error reading cart:", e);
    }

    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("cart");
        if (stored) {
          const items = JSON.parse(stored);
          setCartItems(items.map((i: any) => i.productId));
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isInCart = (productId: string) => cartItems.includes(productId);

  const addToCart = (product: Product) => {
    try {
      const stored = localStorage.getItem("cart");
      const items = stored ? JSON.parse(stored) : [];
      const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.originalPrice);

      items.push({
        productId: product.productId,
        name: product.name,
        slug: product.slug,
        image: product.mainImage || "",
        price,
        originalPrice: parseFloat(product.originalPrice),
        quantity: 1,
        maxQuantity: Math.min(product.stockQuantity, 10),
        vendorId: product.vendorId,
        vendorName: product.vendor?.shopName || "Unknown",
      });

      localStorage.setItem("cart", JSON.stringify(items));
      setCartItems([...cartItems, product.productId]);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error adding to cart:", e);
    }
  };

  return { isInCart, addToCart };
}

// Custom hook for wishlist
function useWishlistLocal() {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      if (stored) {
        const items = JSON.parse(stored);
        setWishlistItems(items.map((i: any) => i.productId));
      }
    } catch (e) {}

    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("wishlist");
        if (stored) {
          const items = JSON.parse(stored);
          setWishlistItems(items.map((i: any) => i.productId));
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  const toggleWishlist = (product: Product) => {
    try {
      const stored = localStorage.getItem("wishlist");
      let items = stored ? JSON.parse(stored) : [];
      const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.originalPrice);

      if (isInWishlist(product.productId)) {
        items = items.filter((i: any) => i.productId !== product.productId);
        setWishlistItems(wishlistItems.filter((id) => id !== product.productId));
      } else {
        items.push({
          productId: product.productId,
          name: product.name,
          slug: product.slug,
          image: product.mainImage || "",
          price,
          originalPrice: parseFloat(product.originalPrice),
          inStock: product.stockQuantity > 0,
          vendorName: product.vendor?.shopName || "Unknown",
        });
        setWishlistItems([...wishlistItems, product.productId]);
      }

      localStorage.setItem("wishlist", JSON.stringify(items));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error toggling wishlist:", e);
    }
  };

  return { isInWishlist, toggleWishlist };
}

// Product Card Component
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { isInCart, addToCart } = useCartLocal();
  const { isInWishlist, toggleWishlist } = useWishlistLocal();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.originalPrice);
  const originalPrice = parseFloat(product.originalPrice);
  const discount = getDiscount(product.originalPrice, product.salePrice);
  const rating = parseFloat(product.averageRating) || 0;
  const inCart = isInCart(product.productId);
  const inWishlist = isInWishlist(product.productId);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart || product.stockQuantity === 0) return;

    setIsAddingToCart(true);
    await new Promise((r) => setTimeout(r, 300));
    addToCart(product);
    setIsAddingToCart(false);
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group p-2 sm:p-3 lg:p-4 border border-border hover:border-[#00b207] hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Badges */}
        <div className="flex gap-1 mb-1.5 sm:mb-2 min-h-[20px]">
          {product.isFlashDeal && (
            <Badge className="bg-orange-500 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 hover:bg-orange-500">
              FLASH
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-destructive text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 hover:bg-destructive">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square mb-2 sm:mb-3 overflow-hidden rounded-lg bg-muted/30">
          <Link href={`/shop/${product.slug}`} className="block w-full h-full">
            {product.mainImage ? (
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No Image
              </div>
            )}
          </Link>

          {/* Quick Actions - Outside the Link to avoid nesting */}
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={handleToggleWishlist}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow flex items-center justify-center transition-colors ${
                inWishlist ? "text-destructive" : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${inWishlist ? "fill-current" : ""}`} />
            </button>
            <Link href={`/shop/${product.slug}`}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <StarRating rating={rating} />

          <Link href={`/shop/${product.slug}`}>
            <h4 className="font-medium text-xs sm:text-sm text-foreground mt-1.5 sm:mt-2 line-clamp-2 hover:text-primary transition-colors min-h-[2.5em]">
              {product.name}
            </h4>
          </Link>

          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {product.category?.name || "Uncategorized"}
          </p>

          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5">
            <span className="text-[#00b207] font-semibold text-xs sm:text-sm">
              {formatPrice(price)}
            </span>
            {discount > 0 && (
              <span className="text-muted-foreground line-through text-[10px] sm:text-xs">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stockQuantity === 0 || inCart}
            className={`w-full mt-2 sm:mt-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              inCart
                ? "bg-green-500 text-white"
                : product.stockQuantity === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[#00b207] text-white hover:bg-[#00b207]/90"
            }`}
          >
            {isAddingToCart ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : inCart ? (
              "In Cart"
            ) : product.stockQuantity === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

// Latest Item Component
function LatestItem({ product, index }: { product: Product; index: number }) {
  const price = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.originalPrice);
  const originalPrice = parseFloat(product.originalPrice);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <Link href={`/shop/${product.slug}`}>
        <div className="flex items-center gap-2 sm:gap-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors duration-200 px-1">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden bg-muted/30 shrink-0">
            {product.mainImage ? (
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
                No Img
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-[10px] sm:text-xs lg:text-sm text-foreground truncate">
              {product.name}
            </h5>
            <p className="text-[8px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
              {product.category?.name || "Uncategorized"}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[#00b207] font-semibold text-[10px] sm:text-xs lg:text-sm">
                {formatPrice(price)}
              </span>
              {product.salePrice && (
                <span className="text-muted-foreground line-through text-[8px] sm:text-[10px] lg:text-xs">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Product Skeleton
function ProductSkeleton() {
  return (
    <Card className="p-2 sm:p-3 lg:p-4 border border-border">
      <Skeleton className="h-3 sm:h-4 w-10 sm:w-12 mb-1.5 sm:mb-2" />
      <Skeleton className="aspect-square w-full rounded-lg mb-2 sm:mb-3" />
      <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 mb-1.5 sm:mb-2" />
      <Skeleton className="h-3 sm:h-4 w-full mb-1" />
      <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24 mb-1.5 sm:mb-2" />
      <Skeleton className="h-3 sm:h-4 w-14 sm:w-16 mb-2" />
      <Skeleton className="h-7 sm:h-8 w-full" />
    </Card>
  );
}

interface ShopSectionProps {
  config?: ShopConfig;
}

export default function ShopSection({ config = defaultConfig }: ShopSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("new");
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [flashDealProduct, setFlashDealProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const mergedConfig = { ...defaultConfig, ...config };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, bestRes, latestRes, dealRes, flashRes, newRes] = await Promise.all([
          fetch(`/api/categories?limit=${mergedConfig.maxCategories}&parentId=root`),
          fetch(`/api/products?isActive=true&status=approved&sortBy=soldCount&sortOrder=desc&limit=${mergedConfig.maxBestSellers}`),
          fetch(`/api/products?isActive=true&status=approved&sortBy=createdAt&sortOrder=desc&limit=${mergedConfig.maxLatestItems}`),
          fetch("/api/products?isFeatured=true&isActive=true&status=approved&limit=2"),
          fetch("/api/products?isFlashDeal=true&isActive=true&status=approved&limit=1"),
          fetch(`/api/products?isActive=true&status=approved&sortBy=createdAt&sortOrder=desc&limit=${mergedConfig.maxBestSellers}`),
        ]);

        const [catData, bestData, latestData, dealData, flashData, newData] = await Promise.all([
          catRes.json(),
          bestRes.json(),
          latestRes.json(),
          dealRes.json(),
          flashRes.json(),
          newRes.json(),
        ]);

        if (catData.success) setCategories(catData.data);
        if (bestData.success) setBestSellerProducts(bestData.data);
        if (latestData.success) setLatestProducts(latestData.data);
        if (dealData.success) setDealProducts(dealData.data);
        if (flashData.success && flashData.data.length > 0) setFlashDealProduct(flashData.data[0]);
        if (newData.success) setTabProducts(newData.data);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [mergedConfig.maxCategories, mergedConfig.maxBestSellers, mergedConfig.maxLatestItems]);

  // Fetch products when category changes
  const fetchCategoryProducts = useCallback(async (categoryId: string) => {
    setIsTabLoading(true);
    try {
      const url =
        categoryId === "all"
          ? `/api/products?isActive=true&status=approved&sortBy=soldCount&sortOrder=desc&limit=${mergedConfig.maxBestSellers}`
          : `/api/products?isActive=true&status=approved&categoryId=${categoryId}&sortBy=soldCount&sortOrder=desc&limit=${mergedConfig.maxBestSellers}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setBestSellerProducts(data.data);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setIsTabLoading(false);
    }
  }, [mergedConfig.maxBestSellers]);

  // Fetch products when tab changes
  const fetchTabProducts = useCallback(async (tab: string) => {
    setIsTabLoading(true);
    try {
      let url = `/api/products?isActive=true&status=approved&limit=${mergedConfig.maxBestSellers}`;

      switch (tab) {
        case "recent":
        case "new":
          url += "&sortBy=createdAt&sortOrder=desc";
          break;
        case "best":
          url += "&sortBy=soldCount&sortOrder=desc";
          break;
        case "top":
        case "rating":
          url += "&sortBy=averageRating&sortOrder=desc";
          break;
        default:
          url += "&sortBy=createdAt&sortOrder=desc";
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setTabProducts(data.data);
    } catch (error) {
      console.error("Error fetching tab products:", error);
    } finally {
      setIsTabLoading(false);
    }
  }, [mergedConfig.maxBestSellers]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    fetchCategoryProducts(categoryId);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchTabProducts(tab);
  };

  const productTabs = [
    { key: "recent", label: "Recent" },
    { key: "best", label: "Best Seller" },
    { key: "top", label: "Top" },
    { key: "new", label: "New Arrivals" },
    { key: "rating", label: "Top Rating" },
  ];

  return (
    <div className="bg-background py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 xl:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Promo Card */}
            {mergedConfig.showPromoCard && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="relative overflow-hidden rounded-xl bg-[#0a2540] p-4 sm:p-5">
                  <Badge className="bg-[#00b207] text-white text-[10px] px-2 py-0.5 mb-2 sm:mb-3 hover:bg-[#00b207]">
                    Featured
                  </Badge>
                  <h3 className="text-white font-semibold text-sm sm:text-base">EXPLORE OUR</h3>
                  <h3 className="text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3">BEST PRODUCTS</h3>

                  <div className="flex items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
                    <span className="text-white/80 text-[10px] sm:text-xs">Up To</span>
                    <span className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">70</span>
                    <span className="text-white text-base sm:text-lg">%</span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
                    <Link href="/shop?featured=true">
                      <Button
                        size="sm"
                        className="bg-[#00b207] hover:bg-[#00b207]/90 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-auto rounded-full"
                      >
                        SHOP NOW
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                    <Badge className="bg-[#00b207] text-white text-[8px] sm:text-[10px] rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                      Special offer
                    </Badge>
                  </div>

                  <div className="flex justify-end mt-2">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                      {flashDealProduct?.mainImage ? (
                        <Image
                          src={flashDealProduct.mainImage}
                          alt="Featured Product"
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop"
                          alt="Featured Product"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Latest Items */}
            {mergedConfig.showLatestItems && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-3 sm:p-4 border border-border">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">Latest Items</h3>
                    <Link href="/shop?sortBy=createdAt&sortOrder=desc">
                      <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs h-7 px-2">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-0">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-2 sm:gap-3 py-2">
                          <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-1 sm:space-y-2">
                            <Skeleton className="h-3 sm:h-4 w-full" />
                            <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20" />
                            <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                          </div>
                        </div>
                      ))
                    ) : latestProducts.length > 0 ? (
                      latestProducts.map((product, index) => (
                        <LatestItem key={product.productId} product={product} index={index} />
                      ))
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                        No products found
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-4 lg:space-y-6">
            {/* Best Seller Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-3 sm:p-4 lg:p-5 border border-border">
                <div className="flex flex-col gap-3 mb-3 sm:mb-4">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Best Seller Product</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={`text-[10px] sm:text-xs lg:text-sm transition-colors duration-200 px-2 py-1 rounded ${
                        activeCategory === "all"
                          ? "text-[#00b207] font-medium bg-[#00b207]/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {categories.slice(0, 5).map((cat) => (
                      <button
                        key={cat.categoryId}
                        onClick={() => handleCategoryChange(cat.categoryId)}
                        className={`text-[10px] sm:text-xs lg:text-sm transition-colors duration-200 px-2 py-1 rounded ${
                          activeCategory === cat.categoryId
                            ? "text-[#00b207] font-medium bg-[#00b207]/10"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {isLoading || isTabLoading ? (
                    [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
                  ) : bestSellerProducts.length > 0 ? (
                    bestSellerProducts.map((product, index) => (
                      <ProductCard key={product.productId} product={product} index={index} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                      No products found in this category
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Featured Products with Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-3 sm:p-4 lg:p-5 border border-border">
                <div className="flex flex-col gap-3 mb-3 sm:mb-4">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Featured Products</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                    {productTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`text-[10px] sm:text-xs lg:text-sm transition-colors duration-200 px-2 py-1 rounded ${
                          activeTab === tab.key
                            ? "text-[#00b207] font-medium bg-[#00b207]/10"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {isLoading || isTabLoading ? (
                    [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
                  ) : tabProducts.length > 0 ? (
                    tabProducts.map((product, index) => (
                      <ProductCard key={product.productId} product={product} index={index} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                      No products found
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Promotional Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {isLoading ? (
                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 sm:h-40 rounded-xl" />)
              ) : (
                dealProducts.slice(0, 2).map((product, index) => (
                  <motion.div
                    key={product.productId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/shop/${product.slug}`}>
                      <Card className="relative overflow-hidden rounded-xl bg-[#1a1a1a] p-4 sm:p-5 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] group">
                        <div className="relative z-10">
                          {product.salePrice && (
                            <Badge className="bg-[#00b207] text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 mb-1.5 sm:mb-2 hover:bg-[#00b207]">
                              GET {getDiscount(product.originalPrice, product.salePrice)}% OFF
                            </Badge>
                          )}
                          <h4 className="text-white font-semibold text-xs sm:text-sm lg:text-base line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm mt-1">
                            Starting{" "}
                            {product.salePrice && (
                              <span className="line-through">{formatPrice(product.originalPrice)}</span>
                            )}{" "}
                            {formatPrice(product.salePrice || product.originalPrice)}
                          </p>
                          <Button
                            variant="link"
                            className="text-white p-0 h-auto mt-1.5 sm:mt-2 text-[10px] sm:text-xs lg:text-sm group-hover:translate-x-1 transition-transform"
                          >
                            SHOP NOW
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                        <div className="absolute right-0 bottom-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 opacity-80">
                          {product.mainImage && (
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              fill
                              className="object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Deals of The Day Section */}
        {mergedConfig.showDealsSection && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 sm:mt-8 lg:mt-10"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-base sm:text-lg lg:text-xl text-foreground">
                Deals of The Day
              </h2>
              <Link href="/shop?flashDeal=true">
                <Button variant="outline" size="sm" className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">
                  View All
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
              {/* Green Promo Card */}
              <Card className="lg:col-span-3 relative overflow-hidden rounded-xl bg-[#00b207] p-4 sm:p-5 lg:p-6 flex flex-col min-h-[300px] sm:min-h-[380px] lg:min-h-[450px] group">
                <Badge className="bg-white text-[#00b207] text-[8px] sm:text-[10px] font-medium px-2 sm:px-3 py-0.5 sm:py-1 w-fit mb-3 sm:mb-4 hover:bg-white rounded-full">
                  GET SAVE 30% OFF
                </Badge>
                <h3 className="text-white font-bold text-sm sm:text-lg lg:text-xl leading-tight">
                  Special Deals
                </h3>
                <h3 className="text-white font-bold text-sm sm:text-lg lg:text-xl mb-4 sm:mb-6">
                  This Week
                </h3>
                <Link href="/shop?featured=true">
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-white/90 text-[#00b207] border-white text-[10px] sm:text-xs lg:text-sm px-4 sm:px-6 py-2 sm:py-2.5 h-auto rounded-full w-fit font-medium"
                  >
                    SHOP NOW
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <div className="flex-1" />
                <div className="relative w-full h-28 sm:h-40 lg:h-48 mt-4">
                  {dealProducts[0]?.mainImage && (
                    <Image
                      src={dealProducts[0].mainImage}
                      alt="Deal Product"
                      fill
                      className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
              </Card>

              {/* Flash Deal with Countdown */}
              <Card className="lg:col-span-5 p-4 sm:p-5 lg:p-6 border border-border flex flex-col">
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
                    <Skeleton className="h-7 sm:h-8 w-28 sm:w-32" />
                    <Skeleton className="h-10 sm:h-12 w-full" />
                    <Skeleton className="h-36 sm:h-52 w-full" />
                  </div>
                ) : flashDealProduct ? (
                  <>
                    <StarRating rating={parseFloat(flashDealProduct.averageRating) || 0} size="md" />
                    <div className="flex items-center gap-2 mt-2 sm:mt-3 mb-1">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {flashDealProduct.brand?.name || "Featured Brand"}
                      </span>
                    </div>
                    <Link href={`/shop/${flashDealProduct.slug}`}>
                      <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-foreground mt-1 sm:mt-2 hover:text-primary transition-colors line-clamp-2">
                        {flashDealProduct.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      {flashDealProduct.category?.name || "Premium Product"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4 mb-4 sm:mb-5">
                      <span className="text-[#00b207] font-bold text-lg sm:text-xl lg:text-2xl">
                        {formatPrice(flashDealProduct.salePrice || flashDealProduct.originalPrice)}
                      </span>
                      {flashDealProduct.salePrice && (
                        <>
                          <span className="text-muted-foreground line-through text-sm sm:text-base">
                            {formatPrice(flashDealProduct.originalPrice)}
                          </span>
                          <Badge className="bg-destructive text-destructive-foreground text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 hover:bg-destructive rounded">
                            -{getDiscount(flashDealProduct.originalPrice, flashDealProduct.salePrice)}%
                          </Badge>
                        </>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Deals End In:</p>
                    <CountdownTimer />

                    <Link href={`/shop/${flashDealProduct.slug}`}>
                      <div className="relative w-full h-32 sm:h-40 lg:h-52 mt-4 sm:mt-5 mb-3 sm:mb-4 bg-muted/30 rounded-lg overflow-hidden cursor-pointer group">
                        {flashDealProduct.mainImage && (
                          <Image
                            src={flashDealProduct.mainImage}
                            alt={flashDealProduct.name}
                            fill
                            className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No flash deals available
                  </div>
                )}
              </Card>

              {/* Product with Progress */}
              <Card className="lg:col-span-4 p-4 sm:p-5 lg:p-6 border border-border">
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    <Skeleton className="h-36 sm:h-52 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-1.5 sm:h-2 w-full" />
                    <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
                  </div>
                ) : dealProducts[1] ? (
                  <div className="flex flex-col h-full">
                    <Link href={`/shop/${dealProducts[1].slug}`}>
                      <div className="relative w-full h-32 sm:h-44 lg:h-52 mb-3 sm:mb-4 bg-muted/30 rounded-lg overflow-hidden cursor-pointer group">
                        {dealProducts[1].mainImage && (
                          <Image
                            src={dealProducts[1].mainImage}
                            alt={dealProducts[1].name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                    </Link>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                      <span>
                        Available{" "}
                        <span className="font-semibold text-foreground">{dealProducts[1].stockQuantity}</span>
                      </span>
                      <span>
                        Sold{" "}
                        <span className="font-semibold text-foreground">{dealProducts[1].soldCount}</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden mb-3 sm:mb-4">
                      <div
                        className="h-full bg-[#00b207] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (dealProducts[1].soldCount /
                              (dealProducts[1].stockQuantity + dealProducts[1].soldCount)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <StarRating rating={parseFloat(dealProducts[1].averageRating) || 0} />

                    <Link href={`/shop/${dealProducts[1].slug}`}>
                      <h4 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground mt-1.5 sm:mt-2 hover:text-primary transition-colors line-clamp-2">
                        {dealProducts[1].name}
                      </h4>
                    </Link>

                    <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                      {dealProducts[1].category?.name || "Uncategorized"}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                      <span className="text-[#00b207] font-bold text-sm sm:text-base lg:text-lg">
                        {formatPrice(dealProducts[1].salePrice || dealProducts[1].originalPrice)}
                      </span>
                      {dealProducts[1].salePrice && (
                        <>
                          <span className="text-muted-foreground line-through text-[10px] sm:text-xs lg:text-sm">
                            {formatPrice(dealProducts[1].originalPrice)}
                          </span>
                          <Badge className="bg-destructive text-destructive-foreground text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 hover:bg-destructive rounded">
                            -{getDiscount(dealProducts[1].originalPrice, dealProducts[1].salePrice)}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No deal products available
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}