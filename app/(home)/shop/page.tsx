// ========================================
// File: app/(home)/shop/page.tsx
// Shop / Product Listing Page with Full API Integration
// ========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Package,
  Eye,
  Check,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";

// ======================
// Types matching API response (flat fields)
// ======================
interface Product {
  productId: string;
  name: string;
  slug: string;
  mainImage: string | null;
  originalPrice: string;
  salePrice: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealStartAt: string | null;
  flashDealEndAt: string | null;
  averageRating: string;
  totalRatings: number;
  soldCount: number;
  createdAt: string;
  // Flat vendor fields from API
  vendorId: string;
  vendorName: string | null;
  vendorSlug: string | null;
  vendorLogo: string | null;
  // Flat category fields
  categoryId: string;
  categoryName: string | null;
  // Flat brand fields
  brandId: string | null;
  brandName: string | null;
}

interface Category {
  categoryId: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  level: number;
  isActive: boolean;
  children?: Category[];
}

interface Brand {
  brandId: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ======================
// Product Card Component
// ======================
const ProductCard = ({
  product,
  viewMode,
}: {
  product: Product;
  viewMode: "grid" | "list";
}) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const inWishlist = isInWishlist(product.productId);
  const inCart = isInCart(product.productId);

  const price = product.salePrice
    ? parseFloat(product.salePrice)
    : parseFloat(product.originalPrice);
  const originalPrice = parseFloat(product.originalPrice);
  const discount = product.salePrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const rating = parseFloat(product.averageRating) || 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      toast.info("Item is already in your cart");
      return;
    }
    if (product.stockQuantity === 0) {
      toast.error("Product is out of stock");
      return;
    }

    setIsAddingToCart(true);
    await new Promise((r) => setTimeout(r, 300));

    addToCart({
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      image: product.mainImage || "",
      price,
      originalPrice,
      quantity: 1,
      maxQuantity: Math.min(product.stockQuantity, 10),
      vendorId: product.vendorId,
      vendorName: product.vendorName || "Unknown",
    });

    setIsAddingToCart(false);
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
  productId: product.productId,
  name: product.name,
  slug: product.slug,
  image: product.mainImage || "",
  price,
  originalPrice,
  inStock: product.stockQuantity > 0,
  vendorName: product.vendorName || "Unknown",
  vendorId: product.vendorId, // Add this line
});

    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  // ---- LIST VIEW ----
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <Link
                href={`/shop/${product.slug}`}
                className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 bg-muted overflow-hidden"
              >
                {product.mainImage ? (
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isFlashDeal && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      FLASH
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-destructive hover:bg-destructive">
                      -{discount}%
                    </Badge>
                  )}
                </div>
              </Link>

              <div className="flex-1 p-5">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {product.brandName || "No Brand"} •{" "}
                        {product.categoryName || "Uncategorized"}
                      </p>
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-2 rounded-full transition-colors ${
                        inWishlist
                          ? "text-destructive bg-destructive/10"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)} ({product.totalRatings} reviews)
                    </span>
                  </div>

                  {product.vendorName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Sold by:{" "}
                      <Link
                        href={`/vendors/${product.vendorSlug || product.vendorId}`}
                        className="text-primary hover:underline"
                      >
                        {product.vendorName}
                      </Link>
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ৳{price.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ৳{originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/shop/${product.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || product.stockQuantity === 0}
                        className={
                          inCart ? "bg-green-500 hover:bg-green-600" : ""
                        }
                      >
                        {isAddingToCart ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : inCart ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ---- GRID VIEW ----
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-0">
          <div className="relative block aspect-square bg-muted overflow-hidden">
            <Link
              href={`/shop/${product.slug}`}
              className="block w-full h-full"
            >
              {product.mainImage ? (
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
            </Link>

            <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
              {product.isFlashDeal && (
                <Badge className="bg-orange-500 hover:bg-orange-600">
                  FLASH
                </Badge>
              )}
              {discount > 0 && (
                <Badge className="bg-destructive hover:bg-destructive">
                  -{discount}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-purple-500 hover:bg-purple-600">
                  Featured
                </Badge>
              )}
            </div>

            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleWishlist}
                className={`w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-colors ${
                  inWishlist
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-destructive"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
                />
              </motion.button>
              <Link href={`/shop/${product.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>

            {product.stockQuantity === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <span className="bg-white text-black px-4 py-2 rounded-full font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">
              {product.brandName || "No Brand"} •{" "}
              {product.categoryName || "Uncategorized"}
            </p>

            <Link href={`/shop/${product.slug}`}>
              <h3 className="font-medium text-sm line-clamp-2 min-h-10 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.totalRatings})
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-primary">
                ৳{price.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ৳{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stockQuantity === 0}
              className={`w-full mt-3 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                inCart
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : product.stockQuantity === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isAddingToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : inCart ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart
                </>
              ) : product.stockQuantity === 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Loading Skeleton
const ProductSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <Skeleton className="w-full sm:w-64 h-48" />
            <div className="flex-1 p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile Filter Drawer
const MobileFilterDrawer = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-background z-50 lg:hidden overflow-y-auto"
        >
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Category Tree Component
const CategoryTree = ({
  categories,
  selectedCategory,
  onSelect,
  level = 0,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  level?: number;
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (categoryId: string) => {
    setExpanded((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className={`space-y-1 ${level > 0 ? "ml-4 mt-1" : ""}`}>
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expanded.includes(category.categoryId);
        const isSelected = selectedCategory === category.categoryId;

        return (
          <div key={category.categoryId}>
            <div
              className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <span
                className="text-sm flex-1"
                onClick={() => onSelect(category.categoryId)}
              >
                {category.name}
              </span>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.categoryId);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
              {isSelected && !hasChildren && <Check className="w-4 h-4" />}
            </div>
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={category.children!}
                selectedCategory={selectedCategory}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ======================
// Main Shop Page
// ======================
export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Get filter values from URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brandIds =
    searchParams.get("brands")?.split(",").filter(Boolean) || [];
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "500000");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const featured = searchParams.get("featured") === "true";
  const flashDeal = searchParams.get("flashDeal") === "true";

  const itemsPerPage = 12;

  // Update URL with filters
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === "0" ||
          value === "500000"
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!updates.hasOwnProperty("page")) {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?limit=100");
        const data: ApiResponse<Category[]> = await response.json();
        if (data.success) {
          const buildTree = (
            items: Category[],
            parentId: string | null = null
          ): Category[] => {
            return items
              .filter((item) => item.parentId === parentId)
              .map((item) => ({
                ...item,
                children: buildTree(items, item.categoryId),
              }));
          };
          setCategories(buildTree(data.data));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands?limit=100");
        const data: ApiResponse<Brand[]> = await response.json();
        if (data.success) {
          setBrands(data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFiltering(true);

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", itemsPerPage.toString());
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
        // NOTE: No need to pass status/isActive — the public API hardcodes approved+active

        if (searchQuery) params.set("search", searchQuery);
        if (categoryId) params.set("categoryId", categoryId);
        if (brandIds.length > 0) params.set("brandId", brandIds[0]);
        if (minPrice > 0) params.set("minPrice", minPrice.toString());
        if (maxPrice < 500000) params.set("maxPrice", maxPrice.toString());
        if (featured) params.set("featured", "true");
        if (flashDeal) params.set("flashDeal", "true");

        const response = await fetch(`/api/products?${params.toString()}`);
        const data: ApiResponse<Product[]> = await response.json();

        if (data.success) {
          setProducts(data.data);
          setTotalProducts(data.meta?.total || 0);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    searchQuery,
    categoryId,
    brandIds.join(","),
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    featured,
    flashDeal,
  ]);

  // Search debounce
  const [searchInput, setSearchInput] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateFilters({ search: searchInput || null });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Price range
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const handlePriceChange = useCallback((value: number[]) => {
    setPriceRange(value);
  }, []);

  const applyPriceFilter = useCallback(() => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    });
  }, [priceRange, updateFilters]);

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...brandIds, brandId]
      : brandIds.filter((id) => id !== brandId);
    updateFilters({
      brands: newBrands.length > 0 ? newBrands.join(",") : null,
    });
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setSearchInput("");
    setPriceRange([0, 500000]);
  };

  // Find category name by ID for display
  const findCategoryName = (
    cats: Category[],
    id: string
  ): string | null => {
    for (const cat of cats) {
      if (cat.categoryId === id) return cat.name;
      if (cat.children) {
        const found = findCategoryName(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedCategoryName = categoryId
    ? findCategoryName(categories, categoryId)
    : null;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (categoryId ? 1 : 0) +
    brandIds.length +
    (minPrice > 0 || maxPrice < 500000 ? 1 : 0) +
    (featured ? 1 : 0) +
    (flashDeal ? 1 : 0);

  // Filter Sidebar Content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Categories</h3>
        {categories.length > 0 ? (
          <CategoryTree
            categories={categories}
            selectedCategory={categoryId}
            onSelect={(id) =>
              updateFilters({
                categoryId: id === categoryId ? null : id,
              })
            }
          />
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={500000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between mt-3 text-sm">
            <span className="px-2 py-1 bg-muted rounded">
              ৳{priceRange[0].toLocaleString()}
            </span>
            <span className="px-2 py-1 bg-muted rounded">
              ৳{priceRange[1].toLocaleString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={applyPriceFilter}
          >
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Brands</h3>
        {brands.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.brandId} className="flex items-center space-x-2">
                <Checkbox
                  id={brand.brandId}
                  checked={brandIds.includes(brand.brandId)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.brandId, checked as boolean)
                  }
                />
                <label
                  htmlFor={brand.brandId}
                  className="text-sm flex-1 cursor-pointer flex items-center gap-2"
                >
                  {brand.logo && (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  )}
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Quick Filters</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(checked) =>
                updateFilters({ featured: checked ? "true" : null })
              }
            />
            <label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flashDeal"
              checked={flashDeal}
              onCheckedChange={(checked) =>
                updateFilters({ flashDeal: checked ? "true" : null })
              }
            />
            <label htmlFor="flashDeal" className="text-sm cursor-pointer">
              Flash Deals
            </label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span className="text-foreground">Shop</span>
            {selectedCategoryName && (
              <>
                <span className="mx-2">›</span>
                <span className="text-foreground">{selectedCategoryName}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <motion.aside
            className="hidden lg:block w-72 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <FilterContent />
            </div>
          </motion.aside>

          {/* Mobile Filter Drawer */}
          <MobileFilterDrawer
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
          >
            <FilterContent />
          </MobileFilterDrawer>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground">
                  {isFiltering ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-medium text-foreground">
                        {totalProducts > 0
                          ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                              currentPage * itemsPerPage,
                              totalProducts
                            )}`
                          : "0"}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-foreground">
                        {totalProducts}
                      </span>{" "}
                      products
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center border border-border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split("-");
                    updateFilters({
                      sortBy: newSortBy,
                      sortOrder: newSortOrder,
                    });
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="popularity-desc">Best Selling</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => {
                      setSearchInput("");
                      updateFilters({ search: null });
                    }}
                  >
                    Search: {searchQuery}
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                )}
                {categoryId && selectedCategoryName && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => updateFilters({ categoryId: null })}
                  >
                    Category: {selectedCategoryName}
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                )}
                {brandIds.map((bId) => {
                  const brand = brands.find((b) => b.brandId === bId);
                  return (
                    <Badge
                      key={bId}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer"
                      onClick={() => handleBrandChange(bId, false)}
                    >
                      {brand?.name || bId}
                      <X className="w-3 h-3 ml-2" />
                    </Badge>
                  );
                })}
                {(minPrice > 0 || maxPrice < 500000) && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => {
                      setPriceRange([0, 500000]);
                      updateFilters({ minPrice: null, maxPrice: null });
                    }}
                  >
                    ৳{minPrice.toLocaleString()} - ৳{maxPrice.toLocaleString()}
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                )}
                {featured && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => updateFilters({ featured: null })}
                  >
                    Featured
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                )}
                {flashDeal && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => updateFilters({ flashDeal: null })}
                  >
                    Flash Deal
                    <X className="w-3 h-3 ml-2" />
                  </Badge>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-destructive hover:underline"
                >
                  Clear all
                </button>
              </motion.div>
            )}

            {/* Products Grid/List */}
            {isLoading ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={`${currentPage}-${viewMode}`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearAllFilters}>Clear All Filters</Button>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center gap-2 mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateFilters({ page: (currentPage - 1).toString() })
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={
                            currentPage === page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            updateFilters({ page: page.toString() })
                          }
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="px-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateFilters({ page: (currentPage + 1).toString() })
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}