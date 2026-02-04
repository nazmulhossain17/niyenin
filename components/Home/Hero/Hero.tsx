// ========================================
// File: components/home/hero-section.tsx
// Dynamic & Responsive Hero Section
// ========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Truck,
  Headphones,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Product {
  productId: string;
  name: string;
  slug: string;
  mainImage: string | null;
  originalPrice: string;
  salePrice: string | null;
  isFlashDeal: boolean;
  isFeatured: boolean;
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
}

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  image: string | null;
  isFeatured: boolean;
  productCount?: number;
}

interface HeroConfig {
  autoPlayInterval?: number;
  showTrustBadges?: boolean;
  showCategories?: boolean;
  maxCategories?: number;
  maxFeaturedProducts?: number;
  maxFlashDeals?: number;
}

// Default config
const defaultConfig: HeroConfig = {
  autoPlayInterval: 5000,
  showTrustBadges: true,
  showCategories: true,
  maxCategories: 4,
  maxFeaturedProducts: 4,
  maxFlashDeals: 3,
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

// Trust badges data
const trustBadges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on all your order",
  },
  {
    icon: Headphones,
    title: "Customer Support 24/7",
    description: "Instant access to Support",
  },
  {
    icon: Shield,
    title: "100% Secure Payment",
    description: "We ensure your money is save",
  },
  {
    icon: RotateCcw,
    title: "Money-Back Guarantee",
    description: "30 Days Money-Back Guarantee",
  },
];

// Slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

interface HeroSectionProps {
  config?: HeroConfig;
}

export default function HeroSection({ config = defaultConfig }: HeroSectionProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentFlashDeal, setCurrentFlashDeal] = useState(0);

  const mergedConfig = { ...defaultConfig, ...config };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, flashRes, catRes] = await Promise.all([
          fetch(`/api/products?isFeatured=true&isActive=true&status=approved&limit=${mergedConfig.maxFeaturedProducts}`),
          fetch(`/api/products?isFlashDeal=true&isActive=true&status=approved&limit=${mergedConfig.maxFlashDeals}`),
          fetch(`/api/categories?featured=true&limit=${mergedConfig.maxCategories}`),
        ]);

        const [featuredData, flashData, catData] = await Promise.all([
          featuredRes.json(),
          flashRes.json(),
          catRes.json(),
        ]);

        if (featuredData.success) setFeaturedProducts(featuredData.data);
        if (flashData.success) setFlashDeals(flashData.data);
        if (catData.success) setCategories(catData.data);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mergedConfig.maxFeaturedProducts, mergedConfig.maxFlashDeals, mergedConfig.maxCategories]);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, mergedConfig.autoPlayInterval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, featuredProducts.length, mergedConfig.autoPlayInterval]);

  // Auto-rotate flash deals on mobile
  useEffect(() => {
    if (flashDeals.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentFlashDeal((prev) => (prev + 1) % flashDeals.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [flashDeals.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  }, [featuredProducts.length]);

  const currentProduct = featuredProducts[currentSlide];
  const currentFlashDealProduct = flashDeals[currentFlashDeal];

  return (
    <div className="min-h-fit bg-background">
      {/* Main Hero Section */}
      <div className="px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
        <div className="max-w-[1600px] mx-auto">
          <div
            className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden"
            style={{
              backgroundImage: `url('/images/background-hero.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Dark mode overlay */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/70 transition-colors duration-300 rounded-xl sm:rounded-2xl" />

            {/* Navigation Arrows - Desktop */}
            {featuredProducts.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg items-center justify-center hover:bg-white dark:hover:bg-black/70 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-lg items-center justify-center hover:bg-white dark:hover:bg-black/70 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Left Content */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4 lg:space-y-6 relative z-10 order-2 lg:order-1">
              {isLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                  <Skeleton className="h-8 sm:h-10 lg:h-12 w-full" />
                  <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" />
                  <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
                  <Skeleton className="h-10 sm:h-12 w-32 sm:w-40" />
                </div>
              ) : currentProduct ? (
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-3 sm:space-y-4 lg:space-y-6"
                  >
                    {/* Category Badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-brand rounded-full" />
                      <span className="text-brand font-medium text-xs sm:text-sm">
                        {currentProduct.category?.name || "Featured"}
                      </span>
                      <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-brand border-t-[4px] sm:border-t-[5px] border-t-transparent border-b-[4px] sm:border-b-[5px] border-b-transparent" />
                    </div>

                    {/* Product Name */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight uppercase">
                      {currentProduct.name}
                    </h1>

                    {/* Brand */}
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {currentProduct.brand?.name || "Premium Quality Products"}
                    </p>

                    {/* Price & Discount */}
                    {currentProduct.salePrice ? (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-brand text-xs sm:text-sm">Up To</span>
                        </div>
                        <span className="text-brand text-2xl sm:text-3xl lg:text-4xl font-bold">
                          {getDiscount(currentProduct.originalPrice, currentProduct.salePrice)}%
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {formatPrice(currentProduct.salePrice)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {formatPrice(currentProduct.originalPrice)}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link href={`/shop/${currentProduct.slug}`}>
                      <Button className="bg-brand hover:bg-brand/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
                        SHOP NOW
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                    WELCOME TO OUR STORE
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Discover amazing products at great prices
                  </p>
                  <Link href="/shop">
                    <Button className="bg-brand hover:bg-brand/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full">
                      SHOP NOW
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Slide Controls */}
              {featuredProducts.length > 1 && (
                <div className="flex items-center gap-3 pt-2">
                  {/* Dots */}
                  <div className="flex gap-2">
                    {featuredProducts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                          idx === currentSlide
                            ? "bg-brand scale-110"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Play/Pause */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                    aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
                  >
                    {isAutoPlaying ? (
                      <Pause className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Play className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Slide Counter */}
                  <span className="text-xs text-muted-foreground">
                    {currentSlide + 1} / {featuredProducts.length}
                  </span>
                </div>
              )}
            </div>

            {/* Center Product Image */}
            <div className="lg:col-span-4 flex justify-center relative z-10 order-1 lg:order-2">
              {isLoading ? (
                <Skeleton className="w-48 h-36 sm:w-64 sm:h-48 lg:w-80 lg:h-60 rounded-lg" />
              ) : currentProduct?.mainImage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Image
                      width={400}
                      height={300}
                      src={currentProduct.mainImage}
                      alt={currentProduct.name}
                      className="w-48 sm:w-64 lg:w-full max-w-md h-auto transform hover:scale-105 transition-transform duration-300"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <Image
                  width={400}
                  height={300}
                  src="/images/camera.png"
                  alt="Featured Product"
                  className="w-48 sm:w-64 lg:w-full max-w-md h-auto"
                />
              )}
            </div>

            {/* Right Side - Flash Deal */}
            <div className="lg:col-span-3 space-y-4 relative z-10 order-3">
              {isLoading ? (
                <Skeleton className="h-60 sm:h-72 lg:h-80 w-full rounded-xl sm:rounded-2xl" />
              ) : flashDeals.length > 0 ? (
                <Card
                  className="p-3 sm:p-4 relative border rounded-xl sm:rounded-2xl overflow-hidden bg-cover bg-center min-h-[220px] sm:min-h-[280px]"
                  style={{ backgroundImage: "url('/images/mobile-bg.jpg')" }}
                >
                  <div className="relative z-10">
                    <Badge className="bg-primary text-primary-foreground mb-2 text-[10px] sm:text-xs">
                      Flash Deal
                    </Badge>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFlashDeal}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="font-semibold text-xs sm:text-sm text-white mb-1 line-clamp-1">
                          {currentFlashDealProduct?.name}
                        </h3>
                        <h3 className="font-semibold text-white text-[10px] sm:text-xs mb-2">
                          {currentFlashDealProduct?.category?.name || ""}
                        </h3>

                        {currentFlashDealProduct?.salePrice && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-primary-foreground text-[10px] sm:text-xs">Up To</span>
                            <span className="text-primary-foreground text-xl sm:text-2xl font-bold">
                              {getDiscount(currentFlashDealProduct.originalPrice, currentFlashDealProduct.salePrice)}%
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Link href={`/shop/${currentFlashDealProduct?.slug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-white cursor-pointer bg-brand border-brand hover:bg-brand hover:text-primary-foreground transition-colors text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                            >
                              SHOP NOW
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>

                          {currentFlashDealProduct?.salePrice && (
                            <Badge className="bg-brand text-white rounded-full text-[10px] sm:text-xs px-2">
                              {getDiscount(currentFlashDealProduct.originalPrice, currentFlashDealProduct.salePrice)}% off
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-end mt-3 sm:mt-4">
                          {currentFlashDealProduct?.mainImage && (
                            <Image
                              width={280}
                              height={280}
                              src={currentFlashDealProduct.mainImage}
                              alt={currentFlashDealProduct.name}
                              className="max-h-28 sm:max-h-36 lg:max-h-40 w-auto object-contain"
                            />
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Flash Deal Dots */}
                    {flashDeals.length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-2">
                        {flashDeals.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentFlashDeal(idx)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                              idx === currentFlashDeal ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/30 dark:bg-black/50 rounded-xl sm:rounded-2xl z-0" />
                </Card>
              ) : (
                <Card
                  className="p-4 relative border rounded-xl sm:rounded-2xl overflow-hidden bg-cover bg-center min-h-[220px] sm:min-h-[280px]"
                  style={{ backgroundImage: "url('/images/mobile-bg.jpg')" }}
                >
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <p className="text-white text-center text-sm">No flash deals available</p>
                  </div>
                  <div className="absolute inset-0 bg-black/30 dark:bg-black/50 rounded-xl sm:rounded-2xl z-0" />
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      {mergedConfig.showTrustBadges && (
        <div className="bg-card border-t border-b border-brand/20 py-4 sm:py-6">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {trustBadges.map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="p-1.5 sm:p-2 bg-brand/10 rounded-full shrink-0">
                    <badge.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-brand text-xs sm:text-sm lg:text-base truncate">
                      {badge.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">
                      {badge.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Categories */}
      {mergedConfig.showCategories && (
        <div className="py-6 sm:py-8 lg:py-12 bg-background">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 sm:h-28 lg:h-32 rounded-lg" />
                ))
              ) : categories.length > 0 ? (
                categories.map((category, idx) => (
                  <motion.div
                    key={category.categoryId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/shop?category=${category.slug}`}>
                      <div className="flex items-center gap-3 sm:gap-4 bg-card p-3 sm:p-4 rounded-lg border hover:border-brand hover:shadow-lg transition-all group">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded overflow-hidden bg-muted shrink-0">
                          {category.image ? (
                            <Image
                              fill
                              src={category.image}
                              alt={category.name}
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">
                            EXPLORE
                          </p>
                          <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                            {category.name}
                          </p>
                          {category.productCount !== undefined && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {category.productCount} Products
                            </p>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="text-brand p-0 h-auto text-xs sm:text-sm"
                          >
                            Shop Now
                            <div className="ml-1 w-3 h-3 sm:w-4 sm:h-4 bg-brand rounded-full flex items-center justify-center">
                              <ArrowRight className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                            </div>
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No featured categories available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}