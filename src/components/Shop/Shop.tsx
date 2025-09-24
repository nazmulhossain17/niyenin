"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Star,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const products = [
  {
    id: 1,
    name: 'Fire HD 10 tablet, 10.1", 1080p Full HD',
    price: 30.52,
    originalPrice: 40.52,
    rating: 4.5,
    reviews: 226,
    image: "/modern-tablet-display.png",
    isNew: true,
    category: "Tablet PC",
    brand: "Amazon",
  },
  {
    id: 2,
    name: "Toaster 2 Slice Stainless Steel Extra Wide Slot",
    price: 45.99,
    originalPrice: 60.99,
    rating: 4.0,
    reviews: 294,
    image: "/classic-chrome-toaster.png",
    isNew: true,
    category: "Kitchen",
    brand: "Samsung",
  },
  {
    id: 3,
    name: "Professional Audio Mixer Console",
    price: 89.52,
    originalPrice: 120.52,
    rating: 4.2,
    reviews: 156,
    image: "/audio-mixer.png",
    isNew: false,
    category: "Audio",
    brand: "Dell",
  },
  {
    id: 4,
    name: "Outdoor Security Camera 1080p",
    price: 75.3,
    originalPrice: 95.3,
    rating: 4.3,
    reviews: 189,
    image: "/outdoor-security-camera.png",
    isNew: false,
    category: "Security",
    brand: "HP",
  },
  {
    id: 5,
    name: "Wireless Bluetooth Speaker",
    price: 25.99,
    originalPrice: 35.99,
    rating: 4.1,
    reviews: 342,
    image: "/black-speaker.jpg",
    isNew: false,
    category: "Audio",
    brand: "Apple",
  },
  {
    id: 6,
    name: "Smart Home Appliance Controller",
    price: 55.75,
    originalPrice: 70.75,
    rating: 4.4,
    reviews: 128,
    image: "/white-appliance.jpg",
    isNew: false,
    category: "Smart Home",
    brand: "Lenovo",
  },
  {
    id: 7,
    name: "HP M22f 22 inch FHD LED Black Monitor",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 349,
    image: "/computer-monitor.png",
    isNew: true,
    category: "Monitor",
    brand: "HP",
  },
  {
    id: 8,
    name: "Smart Kitchen Scale Digital",
    price: 32.45,
    originalPrice: 42.45,
    rating: 4.2,
    reviews: 267,
    image: "/white-device.jpg",
    isNew: true,
    category: "Kitchen",
    brand: "Samsung",
  },
  {
    id: 9,
    name: "Gaming Laptop 15.6 inch RTX 4060",
    price: 899.99,
    originalPrice: 1199.99,
    rating: 4.7,
    reviews: 89,
    image: "/modern-tablet-display.png",
    isNew: true,
    category: "Laptop",
    brand: "MSI",
  },
  {
    id: 10,
    name: "Wireless Noise Cancelling Headphones",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.5,
    reviews: 445,
    image: "/black-speaker.jpg",
    isNew: false,
    category: "Audio",
    brand: "Apple",
  },
  {
    id: 11,
    name: "4K Webcam for Streaming",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.3,
    reviews: 156,
    image: "/outdoor-security-camera.png",
    isNew: false,
    category: "Camera",
    brand: "Asus",
  },
  {
    id: 12,
    name: "Mechanical Gaming Keyboard RGB",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.8,
    reviews: 234,
    image: "/white-device.jpg",
    isNew: true,
    category: "Gaming",
    brand: "Asus",
  },
];

const brands = [
  { name: "Samsung", count: 40 },
  { name: "Apple", count: 35 },
  { name: "Dell", count: 30 },
  { name: "HP", count: 25 },
  { name: "Lenovo", count: 20 },
  { name: "MSI", count: 15 },
  { name: "Asus", count: 10 },
];

const categories = [
  "Laptop",
  "Desktop and Server",
  "Gaming",
  "Monitor",
  "Tablet PC",
  "Printer",
  "Camera",
  "Kitchen",
  "Audio",
  "Security",
  "Smart Home",
];

const colors = [
  "#9CA3AF",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#000000",
];

const tags = [
  "Symphony",
  "Nokia",
  "Oppo",
  "Landing Page",
  "Samsung",
  "Poco X3",
  "iPhone 13 Pro Max",
  "iPhone 12",
  "iPhone 11",
];

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1200]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Price filter
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      // Brand filter
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      // Category filter
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesPrice && matchesBrand && matchesCategory;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [searchQuery, priceRange, selectedBrands, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-muted-foreground">
            <span>Home</span> <span className="mx-2">›</span>{" "}
            <span className="text-foreground">Shop</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            className="w-full lg:w-80 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Filtering */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Price Filtering</h3>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value);
                    setCurrentPage(1);
                  }}
                  max={1200}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>Price: ${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <motion.button
                    key={index}
                    className={`w-8 h-8 rounded border-2 ${
                      selectedColors.includes(color)
                        ? "border-primary"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (selectedColors.includes(color)) {
                        setSelectedColors(
                          selectedColors.filter((c) => c !== color)
                        );
                      } else {
                        setSelectedColors([...selectedColors, color]);
                      }
                      setCurrentPage(1);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                      selectedCategory === category ? "bg-muted" : ""
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <span className="text-sm">{category}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        selectedCategory === category ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brands</h3>
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div key={brand.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand.name}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={(checked) =>
                        handleBrandChange(brand.name, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={brand.name}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {brand.name}
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {brand.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}{" "}
                of {filteredProducts.length} Results
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Default Sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Sorting</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={currentPage} // Re-animate when page changes
            >
              {paginatedProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <Card
                    className={`group cursor-pointer hover:shadow-lg transition-shadow duration-300 relative overflow-hidden ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  >
                    {product.isNew && (
                      <Badge className="absolute top-2 left-2 z-10 bg-green-500 hover:bg-green-600">
                        NEW
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-white/80"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent
                      className={`p-4 ${
                        viewMode === "list" ? "flex flex-row gap-4 w-full" : ""
                      }`}
                    >
                      <div
                        className={`${
                          viewMode === "list" ? "w-48 h-48" : "aspect-square"
                        } mb-4 overflow-hidden rounded-lg bg-gray-50 ${
                          viewMode === "list" ? "mb-0 flex-shrink-0" : ""
                        }`}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div
                        className={`space-y-2 ${
                          viewMode === "list" ? "flex-1" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.reviews}) Reviews
                          </span>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="text-xs text-muted-foreground">
                          {product.brand} • {product.category}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground line-through text-sm">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* No Results Message */}
            {filteredProducts.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-muted-foreground">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBrands([]);
                    setSelectedCategory("");
                    setPriceRange([0, 1200]);
                    setCurrentPage(1);
                  }}
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center items-center gap-2 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </Button>
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
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
