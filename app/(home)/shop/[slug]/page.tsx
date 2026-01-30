// ========================================
// File: app/(home)/products/[slug]/page.tsx
// Product Details Page
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
  Info,
  ImageIcon,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { toast } from "sonner";

// Mock Product Data - Replace with API call later
const mockProduct = {
  id: "prod-001",
  name: "Apple MacBook Pro 14\" M3 Pro Chip - Space Black",
  slug: "macbook-pro-14-m3-pro-space-black",
  description: `The most advanced MacBook Pro ever. The new MacBook Pro with M3 Pro delivers exceptional performance for demanding workflows like manipulating gigapixel panoramas or analyzing large data sets.

  With a stunning Liquid Retina XDR display, advanced camera and audio, and all the ports you need, this is the ultimate pro notebook.`,
  shortDescription: "Supercharged by M3 Pro chip for exceptional performance",
  brand: "Apple",
  category: "Laptop",
  subcategory: "MacBook",
  sku: "MBP14-M3PRO-512-SB",
  price: 199900,
  originalPrice: 219900,
  discount: 9,
  currency: "BDT",
  stock: 15,
  minOrder: 1,
  maxOrder: 5,
  sold: 128,
  rating: 4.8,
  totalReviews: 256,
  images: [
    "/images/products/macbook-1.jpg",
    "/images/products/macbook-2.jpg",
    "/images/products/macbook-3.jpg",
    "/images/products/macbook-4.jpg",
    "/images/products/macbook-5.jpg",
  ],
  variants: [
    {
      id: "var-1",
      name: "Storage",
      options: [
        { id: "opt-1", value: "512GB SSD", price: 199900, stock: 15 },
        { id: "opt-2", value: "1TB SSD", price: 239900, stock: 8 },
        { id: "opt-3", value: "2TB SSD", price: 299900, stock: 3 },
      ],
    },
    {
      id: "var-2",
      name: "Color",
      options: [
        { id: "opt-4", value: "Space Black", price: 0, stock: 15, color: "#1d1d1f" },
        { id: "opt-5", value: "Silver", price: 0, stock: 12, color: "#e3e4e5" },
      ],
    },
  ],
  specifications: [
    { label: "Display", value: '14.2" Liquid Retina XDR display, 3024x1964 resolution' },
    { label: "Chip", value: "Apple M3 Pro chip (11-core CPU, 14-core GPU)" },
    { label: "Memory", value: "18GB unified memory" },
    { label: "Battery", value: "Up to 17 hours Apple TV app movie playback" },
    { label: "Weight", value: "1.61 kg (3.5 pounds)" },
    { label: "Ports", value: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3, Headphone jack" },
    { label: "Keyboard", value: "Backlit Magic Keyboard with Touch ID" },
    { label: "Camera", value: "1080p FaceTime HD camera" },
    { label: "Audio", value: "Six-speaker sound system with force-cancelling woofers" },
    { label: "Wireless", value: "Wi-Fi 6E, Bluetooth 5.3" },
  ],
  features: [
    "M3 Pro chip delivers up to 40% faster CPU performance",
    "Up to 22 hours of battery life",
    "Liquid Retina XDR display with ProMotion",
    "1080p FaceTime HD camera with advanced ISP",
    "Six-speaker sound system with Spatial Audio",
    "Studio-quality three-mic array",
    "MagSafe charging, Thunderbolt ports, HDMI, SD card slot",
  ],
  tags: ["laptop", "macbook", "apple", "m3", "professional", "creative"],
  vendor: {
    id: "vendor-001",
    name: "TechZone BD",
    slug: "techzone-bd",
    logo: "/images/vendors/techzone.png",
    rating: 4.9,
    totalSales: 5420,
    responseRate: 98,
    responseTime: "within 1 hour",
    isVerified: true,
    joinedDate: "2022-03-15",
  },
  shipping: {
    freeShipping: true,
    freeShippingMin: 50000,
    estimatedDays: "3-5 business days",
    shippingFrom: "Dhaka, Bangladesh",
  },
  warranty: "1 Year Official Apple Warranty",
  returnPolicy: "7 days return policy",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T14:30:00Z",
};

// Mock Reviews Data
const mockReviews = [
  {
    id: "rev-1",
    user: { name: "Rahman Ahmed", avatar: null },
    rating: 5,
    title: "Best laptop I've ever owned!",
    comment: "The M3 Pro chip is incredibly fast. I use it for video editing and it handles 4K footage like a breeze. Battery life is amazing too!",
    images: ["/images/reviews/rev1-1.jpg", "/images/reviews/rev1-2.jpg"],
    helpful: 45,
    notHelpful: 2,
    verified: true,
    createdAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "rev-2",
    user: { name: "Fatima Begum", avatar: null },
    rating: 4,
    title: "Great performance but pricey",
    comment: "Performance is outstanding, display is gorgeous. Only downside is the price, but you get what you pay for.",
    images: [],
    helpful: 32,
    notHelpful: 5,
    verified: true,
    createdAt: "2024-01-16T08:30:00Z",
  },
  {
    id: "rev-3",
    user: { name: "Sakib Hasan", avatar: null },
    rating: 5,
    title: "Perfect for developers",
    comment: "As a software developer, this machine is perfect. Docker runs smoothly, compilation is fast, and the screen is easy on the eyes for long coding sessions.",
    images: ["/images/reviews/rev3-1.jpg"],
    helpful: 28,
    notHelpful: 1,
    verified: true,
    createdAt: "2024-01-14T15:20:00Z",
  },
];

// Mock Related Products
const mockRelatedProducts = [
  {
    id: "prod-002",
    name: 'MacBook Air 15" M3',
    slug: "macbook-air-15-m3",
    price: 154900,
    originalPrice: 164900,
    image: "/images/products/macbook-air.jpg",
    rating: 4.7,
    reviews: 189,
  },
  {
    id: "prod-003",
    name: "Magic Keyboard with Touch ID",
    slug: "magic-keyboard-touch-id",
    price: 18900,
    originalPrice: 19900,
    image: "/images/products/magic-keyboard.jpg",
    rating: 4.5,
    reviews: 342,
  },
  {
    id: "prod-004",
    name: "Apple Magic Mouse",
    slug: "apple-magic-mouse",
    price: 10900,
    originalPrice: 11900,
    image: "/images/products/magic-mouse.jpg",
    rating: 4.3,
    reviews: 567,
  },
  {
    id: "prod-005",
    name: 'Studio Display 27"',
    slug: "apple-studio-display-27",
    price: 189900,
    originalPrice: 199900,
    image: "/images/products/studio-display.jpg",
    rating: 4.6,
    reviews: 128,
  },
];

// Image Gallery Component
const ImageGallery = ({ images }: { images: string[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
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

        {/* Navigation Arrows */}
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

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
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
              {images[selectedIndex] ? (
                <Image
                  src={images[selectedIndex]}
                  alt="Zoomed product"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-32 h-32 text-white/30" />
                </div>
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

// Rating Stars Component
const RatingStars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
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

// Review Card Component
const ReviewCard = ({ review }: { review: typeof mockReviews[0] }) => {
  const [helpful, setHelpful] = useState<"yes" | "no" | null>(null);

  return (
    <div className="border-b border-border pb-6 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-brand flex items-center justify-center text-white font-semibold">
            {review.user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user.name}</span>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="font-medium">{review.title}</h4>
        <p className="text-muted-foreground mt-1">{review.comment}</p>
      </div>

      {review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, idx) => (
            <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
              <Image src={img} alt={`Review image ${idx + 1}`} width={80} height={80} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4">
        <span className="text-sm text-muted-foreground">Was this helpful?</span>
        <button
          onClick={() => setHelpful("yes")}
          className={`flex items-center gap-1 text-sm ${
            helpful === "yes" ? "text-green-600" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          {review.helpful + (helpful === "yes" ? 1 : 0)}
        </button>
        <button
          onClick={() => setHelpful("no")}
          className={`flex items-center gap-1 text-sm ${
            helpful === "no" ? "text-red-600" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          {review.notHelpful + (helpful === "no" ? 1 : 0)}
        </button>
      </div>
    </div>
  );
};

// Related Product Card
const RelatedProductCard = ({ product }: { product: typeof mockRelatedProducts[0] }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card rounded-xl border border-border overflow-hidden group"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative bg-muted overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.image,
                price: product.price,
                originalPrice: product.originalPrice,
                inStock: true,
                vendorName: "TechZone BD",
              });
            }}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors ${
              isInWishlist(product.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <RatingStars rating={product.rating} size="sm" />
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground text-sm line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Product Details Page
export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product] = useState(mockProduct);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Initialize selected variants
  useEffect(() => {
    const initialVariants: Record<string, string> = {};
    product.variants.forEach((variant) => {
      if (variant.options.length > 0) {
        initialVariants[variant.id] = variant.options[0].id;
      }
    });
    setSelectedVariants(initialVariants);
  }, [product]);

  // Calculate current price based on selected variants
  const calculatePrice = () => {
    let price = product.price;
    product.variants.forEach((variant) => {
      const selectedOption = variant.options.find((opt) => opt.id === selectedVariants[variant.id]);
      if (selectedOption && selectedOption.price > 0) {
        price = selectedOption.price;
      }
    });
    return price;
  };

  const currentPrice = calculatePrice();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxQuantity: product.maxOrder,
      vendorId: product.vendor.id,
      vendorName: product.vendor.name,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product.name}`;

    switch (platform) {
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/shop" className="hover:text-foreground">Shop</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-foreground">
              {product.category}
            </Link>
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
            <ImageGallery images={product.images} />
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
              <Link href={`/brands/${product.brand.toLowerCase()}`} className="text-primary hover:underline font-medium">
                {product.brand}
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href={`/shop?category=${product.category}`} className="text-muted-foreground hover:text-foreground">
                {product.category}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RatingStars rating={product.rating} size="md" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <Link href="#reviews" className="text-muted-foreground hover:text-primary">
                {product.totalReviews} Reviews
              </Link>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{product.sold} Sold</span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ৳{product.originalPrice.toLocaleString()}
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
            <p className="text-muted-foreground">{product.shortDescription}</p>

            {/* Variants */}
            {product.variants.map((variant) => (
              <div key={variant.id} className="space-y-3">
                <label className="font-medium">{variant.name}:</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => {
                    const isSelected = selectedVariants[variant.id] === option.id;
                    const isOutOfStock = option.stock === 0;

                    if (option.color) {
                      return (
                        <button
                          key={option.id}
                          onClick={() => !isOutOfStock && setSelectedVariants({ ...selectedVariants, [variant.id]: option.id })}
                          disabled={isOutOfStock}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
                          } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}`}
                          style={{ backgroundColor: option.color }}
                          title={option.value}
                        />
                      );
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => !isOutOfStock && setSelectedVariants({ ...selectedVariants, [variant.id]: option.id })}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50"
                        } ${isOutOfStock ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                      >
                        {option.value}
                        {option.price > product.price && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (+৳{(option.price - product.price).toLocaleString()})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(product.minOrder, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.maxOrder, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} pieces available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 bg-primary/10 text-primary border-2 border-primary px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </motion.button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => {
                  toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0] || "",
                    price: currentPrice,
                    originalPrice: product.originalPrice,
                    inStock: product.stock > 0,
                    vendorName: product.vendor.name,
                  });
                  toast.success(isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist");
                }}
                className={`flex items-center gap-2 text-sm ${
                  isInWishlist(product.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
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
                      <button onClick={() => handleShare("copy")} className="p-2 hover:bg-muted rounded-lg" title="Copy Link">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShare("facebook")} className="p-2 hover:bg-muted rounded-lg text-blue-600" title="Facebook">
                        <Facebook className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShare("twitter")} className="p-2 hover:bg-muted rounded-lg text-sky-500" title="Twitter">
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShare("linkedin")} className="p-2 hover:bg-muted rounded-lg text-blue-700" title="LinkedIn">
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
                  <p className="font-medium">
                    {product.shipping.freeShipping ? "Free Shipping" : "Standard Shipping"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: {product.shipping.estimatedDays}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">{product.warranty}</p>
                  <p className="text-sm text-muted-foreground">Official warranty covered</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">{product.returnPolicy}</p>
                  <p className="text-sm text-muted-foreground">Easy returns & refunds</p>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-brand flex items-center justify-center text-white">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/vendors/${product.vendor.slug}`} className="font-medium hover:text-primary">
                        {product.vendor.name}
                      </Link>
                      {product.vendor.isVerified && (
                        <Award className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {product.vendor.rating}
                      </span>
                      <span>{product.vendor.totalSales.toLocaleString()} sales</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/vendors/${product.vendor.slug}`}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  Visit Store
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span>{product.vendor.responseRate}% Response Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Responds {product.vendor.responseTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          {/* Tab Headers */}
          <div className="border-b border-border">
            <div className="flex gap-8">
              {[
                { id: "description", label: "Description" },
                { id: "specifications", label: "Specifications" },
                { id: "reviews", label: `Reviews (${mockReviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

          {/* Tab Content */}
          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                    {product.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-4 p-4 rounded-lg ${
                          idx % 2 === 0 ? "bg-muted/50" : ""
                        }`}
                      >
                        <span className="font-medium w-32 shrink-0">{spec.label}</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  id="reviews"
                  className="space-y-8"
                >
                  {/* Rating Summary */}
                  <div className="bg-muted/50 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold">{product.rating}</div>
                        <RatingStars rating={product.rating} size="lg" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on {product.totalReviews} reviews
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm w-3">{star}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-10">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {/* Load More */}
                  <div className="text-center">
                    <button className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      Load More Reviews
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Link href="/shop" className="text-primary hover:underline text-sm flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mockRelatedProducts.map((product) => (
              <RelatedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}