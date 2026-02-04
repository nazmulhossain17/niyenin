// ========================================
// File: app/vendor/products/new/page.tsx
// Vendor - Create New Product Page
// ========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  ImagePlus,
  X,
  Package,
  DollarSign,
  Layers,
  Settings,
  Tag,
  Search as SearchIcon,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

// Types
interface Category {
  categoryId: string;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
}

interface Brand {
  brandId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  brandId: string | null;
  originalPrice: string;
  salePrice: string;
  costPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  weight: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
}

export default function VendorNewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    brandId: null,
    originalPrice: "",
    salePrice: "",
    costPrice: "",
    stockQuantity: 0,
    lowStockThreshold: 5,
    weight: "",
    metaTitle: "",
    metaDescription: "",
    isActive: true,
  });

  // Image handling
  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  // Tags handling
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Fetch categories and brands
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch("/api/categories?limit=500&tree=false"),
        fetch("/api/brands?limit=500"),
      ]);

      const catData = await catRes.json();
      const brandData = await brandRes.json();

      if (catData.success) {
        setCategories(catData.data.filter((c: Category) => c.isActive));
      }
      if (brandData.success) {
        setBrands(brandData.data.filter((b: Brand) => b.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load categories and brands");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form field changes
  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image add
  const handleAddImage = (type: "main" | "gallery") => {
    if (!imageUrl.trim()) return;

    try {
      new URL(imageUrl); // Validate URL
      if (type === "main") {
        setMainImage(imageUrl);
      } else {
        if (galleryImages.length < 10) {
          setGalleryImages([...galleryImages, imageUrl]);
        } else {
          toast.error("Maximum 10 gallery images allowed");
        }
      }
      setImageUrl("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // Handle tags
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = "Price must be greater than 0";
    }

    if (!mainImage) {
      newErrors.mainImage = "Please add a main product image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mainImage,
          images: galleryImages.length > 0 ? galleryImages : null,
          tags: tags.length > 0 ? tags : null,
          brandId: formData.brandId || null,
          salePrice: formData.salePrice || null,
          costPrice: formData.costPrice || null,
          sku: formData.sku || null,
          shortDescription: formData.shortDescription || null,
          description: formData.description || null,
          weight: formData.weight || null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Product created successfully! It will be reviewed by admin.");
        router.push("/vendor/products");
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      toast.error("An error occurred while creating the product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vendor/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">
              Create a new product for your store
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.isActive ? "default" : "secondary"}>
            {formData.isActive ? "Submit for Review" : "Draft"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details of your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Optional)</Label>
                    <Input
                      id="sku"
                      placeholder="e.g., PROD-001"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (Optional)</Label>
                    <Input
                      id="weight"
                      placeholder="e.g., 500g or 1.5kg"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Brief description for product listings (max 500 characters)"
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => handleChange("shortDescription", e.target.value)}
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed product description..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <CardDescription>
                  Add images for your product (Main image is required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image URL Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage(mainImage ? "gallery" : "main");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddImage(mainImage ? "gallery" : "main")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {errors.mainImage && (
                  <p className="text-sm text-destructive">{errors.mainImage}</p>
                )}

                {/* Main Image */}
                <div className="space-y-2">
                  <Label>
                    Main Image <span className="text-destructive">*</span>
                  </Label>
                  {mainImage ? (
                    <div className="relative w-40 h-40 border rounded-lg overflow-hidden group">
                      <Image
                        src={mainImage}
                        alt="Main product image"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setMainImage("")}
                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Badge className="absolute bottom-1 left-1" variant="secondary">
                        Main
                      </Badge>
                    </div>
                  ) : (
                    <div className="w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <ImagePlus className="h-8 w-8 mx-auto mb-1" />
                        <span className="text-xs">Add main image</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <Label>Gallery Images ({galleryImages.length}/10)</Label>
                  <div className="flex flex-wrap gap-2">
                    {galleryImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 border rounded-lg overflow-hidden group"
                      >
                        <Image
                          src={img}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {galleryImages.length < 10 && (
                      <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                        <span className="text-xs text-center">Add more</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Stock
                </CardTitle>
                <CardDescription>Set your product pricing and inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">
                      Original Price (৳) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.originalPrice}
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                      className={errors.originalPrice ? "border-destructive" : ""}
                    />
                    {errors.originalPrice && (
                      <p className="text-sm text-destructive">
                        {errors.originalPrice}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (৳)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.salePrice}
                      onChange={(e) => handleChange("salePrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price (৳)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={(e) => handleChange("costPrice", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">For profit calculation</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">
                      Stock Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        handleChange("stockQuantity", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        handleChange("lowStockThreshold", parseInt(e.target.value) || 5)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when stock falls below this
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="h-5 w-5" />
                  SEO Settings
                </CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO title (max 100 characters)"
                    maxLength={100}
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="SEO description (max 255 characters)"
                    maxLength={255}
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Publish Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.isActive
                        ? "Product will be submitted for review"
                        : "Save as draft"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                  />
                </div>

                <Separator />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Product will be reviewed by admin before going live
                </p>
              </CardContent>
            </Card>

            {/* Category & Brand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
                    <SelectTrigger
                      className={errors.categoryId ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {"—".repeat(cat.level)} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Brand (Optional)</Label>
                  <Select
                    value={formData.brandId || "none"}
                    onValueChange={(value) =>
                      handleChange("brandId", value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No brand</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.brandId} value={brand.brandId}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
                <CardDescription>Add up to 10 tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTag}
                    disabled={tags.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}