// ========================================
// File: app/(home)/become-seller/page.tsx
// Vendor Onboarding - Multi-Step Registration Form
// ========================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Store,
  Building2,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  X,
  Info,
  Smartphone,
  Building,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Types
interface FormData {
  shopName: string;
  shopSlug: string;
  description: string;
  logo: string;
  banner: string;
  businessName: string;
  businessRegistrationNo: string;
  taxId: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  preferredMethod: "bank" | "bkash" | "nagad" | "rocket";
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  returnPolicy: string;
  shippingPolicy: string;
  termsAccepted: boolean;
}

interface StepConfig {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepConfig[] = [
  { id: 1, title: "Shop Information", shortTitle: "Shop", icon: Store },
  { id: 2, title: "Business Details", shortTitle: "Business", icon: Building2 },
  { id: 3, title: "Payment Setup", shortTitle: "Payment", icon: CreditCard },
  { id: 4, title: "Policies", shortTitle: "Policies", icon: FileText },
];

// Default policies
const defaultReturnPolicy = `Return Policy:

1. Eligibility for Returns
- Items can be returned within 7 days of delivery
- Products must be unused and in original packaging
- Proof of purchase is required

2. Non-Returnable Items
- Perishable goods
- Personal care items
- Custom or personalized products

3. Return Process
- Contact us with your order number
- We will provide return instructions
- Refunds will be processed within 5-7 business days

4. Refund Method
- Original payment method will be refunded
- Shipping costs are non-refundable unless item is defective`;

const defaultShippingPolicy = `Shipping Policy:

1. Processing Time
- Orders are processed within 1-2 business days
- You will receive a tracking number via email

2. Shipping Methods & Delivery Times
- Inside Dhaka: 1-2 business days
- Outside Dhaka: 3-5 business days
- Remote areas: 5-7 business days

3. Shipping Costs
- Free shipping on orders above ৳2,000
- Standard shipping: ৳60-120 depending on location

4. Tracking
- All orders include tracking information
- Track via our website or courier partner

5. Delivery Issues
- Contact us immediately for any delivery problems
- We are not responsible for incorrect addresses`;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Step Progress Component
const StepProgress = ({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: number[];
}) => (
  <div className="mb-6 sm:mb-8">
    {/* Desktop Progress */}
    <div className="hidden sm:flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? "hsl(var(--primary))"
                    : isCurrent
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted))",
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted || isCurrent
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </motion.div>
              <p
                className={`mt-2 text-xs font-medium hidden md:block ${
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </p>
              <p
                className={`mt-2 text-xs font-medium md:hidden ${
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.shortTitle}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 md:w-16 h-1 mx-1 sm:mx-2 rounded ${
                  completedSteps.includes(step.id) ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>

    {/* Mobile Progress Bar */}
    <div className="sm:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {steps[currentStep - 1].title}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  </div>
);

// Field Error Component
const FieldError = ({ error }: { error?: string }) =>
  error ? (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-destructive mt-1 flex items-center gap-1"
    >
      <AlertCircle className="w-3 h-3 shrink-0" />
      <span>{error}</span>
    </motion.p>
  ) : null;

// Main Component
export default function BecomeSellerPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    shopName: "",
    shopSlug: "",
    description: "",
    logo: "",
    banner: "",
    businessName: "",
    businessRegistrationNo: "",
    taxId: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    preferredMethod: "bkash",
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: "",
    routingNumber: "",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    returnPolicy: defaultReturnPolicy,
    shippingPolicy: defaultShippingPolicy,
    termsAccepted: false,
  });

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/become-seller");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        businessEmail: session.user.email || "",
      }));
      setIsAuthenticated(true);

      try {
        const response = await fetch("/api/vendor/onboarding");
        const data = await response.json();
        if (data.success && data.data.status) {
          if (data.data.status === "pending") {
            router.push("/vendor/pending");
          } else if (data.data.status === "approved") {
            router.push("/vendor");
          }
        }
      } catch (error) {
        console.error("Error checking vendor status:", error);
      }
    }
    checkAuth();
  }, [router]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Auto-generate slug
  useEffect(() => {
    if (formData.shopName && !formData.shopSlug) {
      const slug = generateSlug(formData.shopName);
      updateFormData("shopSlug", slug);
    }
  }, [formData.shopName]);

  // Check slug availability (debounced)
  useEffect(() => {
    if (!formData.shopSlug || formData.shopSlug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const response = await fetch(
          `/api/vendor/check-slug?slug=${encodeURIComponent(formData.shopSlug)}`
        );
        const data = await response.json();
        setSlugAvailable(data.data?.available);
        if (!data.data?.available) {
          setErrors((prev) => ({ ...prev, shopSlug: data.data?.message }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.shopSlug;
            return newErrors;
          });
        }
      } catch (error) {
        console.error("Error checking slug:", error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.shopSlug]);

  const validateStep = async (): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          step: currentStep,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.details) {
          const newErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              newErrors[key] = value[0] as string;
            }
          });
          setErrors(newErrors);
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted) {
      setErrors({ termsAccepted: "You must accept the terms and conditions" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Application submitted successfully!");
        router.push("/vendor/pending");
      } else {
        if (data.details) {
          const newErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              newErrors[key] = value[0] as string;
            }
          });
          setErrors(newErrors);
        }
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-primary/5 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Start Selling Today
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              Become a Seller
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Join thousands of successful sellers. Set up your shop in minutes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <StepProgress currentStep={currentStep} completedSteps={completedSteps} />

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Shop Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" />
                        Shop Information
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tell us about your shop
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shopName">
                          Shop Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="shopName"
                          placeholder="Enter your shop name"
                          value={formData.shopName}
                          onChange={(e) => updateFormData("shopName", e.target.value)}
                          className={errors.shopName ? "border-destructive" : ""}
                        />
                        <FieldError error={errors.shopName} />
                      </div>

                      <div>
                        <Label htmlFor="shopSlug">
                          Shop URL <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground">
                            <span className="hidden sm:inline">yoursite.com/shop/</span>
                            <span className="sm:hidden">/shop/</span>
                          </div>
                          <Input
                            id="shopSlug"
                            placeholder="my-shop"
                            value={formData.shopSlug}
                            onChange={(e) =>
                              updateFormData(
                                "shopSlug",
                                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                              )
                            }
                            className={`pl-20 sm:pl-35 pr-10 ${
                              errors.shopSlug ? "border-destructive" : ""
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingSlug ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : slugAvailable === true ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : slugAvailable === false ? (
                              <X className="w-4 h-4 text-destructive" />
                            ) : null}
                          </div>
                        </div>
                        <FieldError error={errors.shopSlug} />
                        {slugAvailable === true && (
                          <p className="text-sm text-green-600 mt-1">Available!</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">
                          Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what you sell..."
                          value={formData.description}
                          onChange={(e) => updateFormData("description", e.target.value)}
                          rows={4}
                          className={errors.description ? "border-destructive" : ""}
                        />
                        <div className="flex justify-between mt-1">
                          <FieldError error={errors.description} />
                          <span className="text-xs text-muted-foreground">
                            {formData.description.length}/2000
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="logo">Logo URL (Optional)</Label>
                          <Input
                            id="logo"
                            placeholder="https://..."
                            value={formData.logo}
                            onChange={(e) => updateFormData("logo", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            200x200px recommended
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="banner">Banner URL (Optional)</Label>
                          <Input
                            id="banner"
                            placeholder="https://..."
                            value={formData.banner}
                            onChange={(e) => updateFormData("banner", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            1200x300px recommended
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Business Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Business Details
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your business contact information
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name (Optional)</Label>
                        <Input
                          id="businessName"
                          placeholder="Registered business name"
                          value={formData.businessName}
                          onChange={(e) => updateFormData("businessName", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessRegistrationNo">
                            Registration No. (Optional)
                          </Label>
                          <Input
                            id="businessRegistrationNo"
                            placeholder="Trade license"
                            value={formData.businessRegistrationNo}
                            onChange={(e) =>
                              updateFormData("businessRegistrationNo", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="taxId">Tax ID (Optional)</Label>
                          <Input
                            id="taxId"
                            placeholder="TIN number"
                            value={formData.taxId}
                            onChange={(e) => updateFormData("taxId", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessEmail">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="businessEmail"
                              type="email"
                              placeholder="email@business.com"
                              value={formData.businessEmail}
                              onChange={(e) =>
                                updateFormData("businessEmail", e.target.value)
                              }
                              className={`pl-10 ${
                                errors.businessEmail ? "border-destructive" : ""
                              }`}
                            />
                          </div>
                          <FieldError error={errors.businessEmail} />
                        </div>
                        <div>
                          <Label htmlFor="businessPhone">
                            Phone <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="businessPhone"
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              value={formData.businessPhone}
                              onChange={(e) =>
                                updateFormData("businessPhone", e.target.value)
                              }
                              className={`pl-10 ${
                                errors.businessPhone ? "border-destructive" : ""
                              }`}
                            />
                          </div>
                          <FieldError error={errors.businessPhone} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="businessAddress">
                          Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Textarea
                            id="businessAddress"
                            placeholder="Full address with area, city, postal code"
                            value={formData.businessAddress}
                            onChange={(e) =>
                              updateFormData("businessAddress", e.target.value)
                            }
                            rows={3}
                            className={`pl-10 ${
                              errors.businessAddress ? "border-destructive" : ""
                            }`}
                          />
                        </div>
                        <FieldError error={errors.businessAddress} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Setup
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        How you'll receive your earnings
                      </p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <Label className="mb-3 block">
                          Payment Method <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.preferredMethod}
                          onValueChange={(value) =>
                            updateFormData("preferredMethod", value)
                          }
                          className="grid grid-cols-2 gap-2 sm:gap-3"
                        >
                          {[
                            { value: "bkash", label: "bKash", color: "bg-pink-500" },
                            { value: "nagad", label: "Nagad", color: "bg-orange-500" },
                            { value: "rocket", label: "Rocket", color: "bg-purple-500" },
                            { value: "bank", label: "Bank", color: "bg-blue-500" },
                          ].map((method) => (
                            <Label
                              key={method.value}
                              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.preferredMethod === method.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <RadioGroupItem value={method.value} className="sr-only" />
                              <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${method.color} flex items-center justify-center shrink-0`}
                              >
                                {method.value === "bank" ? (
                                  <Building className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                ) : (
                                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                )}
                              </div>
                              <span className="text-sm sm:text-base font-medium">
                                {method.label}
                              </span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Mobile Banking Fields */}
                      {formData.preferredMethod === "bkash" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 sm:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
                        >
                          <Label htmlFor="bkashNumber">
                            bKash Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="bkashNumber"
                            placeholder="01XXXXXXXXX"
                            value={formData.bkashNumber}
                            onChange={(e) => updateFormData("bkashNumber", e.target.value)}
                            className={errors.bkashNumber ? "border-destructive" : ""}
                          />
                          <FieldError error={errors.bkashNumber} />
                        </motion.div>
                      )}

                      {formData.preferredMethod === "nagad" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                        >
                          <Label htmlFor="nagadNumber">
                            Nagad Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="nagadNumber"
                            placeholder="01XXXXXXXXX"
                            value={formData.nagadNumber}
                            onChange={(e) => updateFormData("nagadNumber", e.target.value)}
                            className={errors.nagadNumber ? "border-destructive" : ""}
                          />
                          <FieldError error={errors.nagadNumber} />
                        </motion.div>
                      )}

                      {formData.preferredMethod === "rocket" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          <Label htmlFor="rocketNumber">
                            Rocket Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="rocketNumber"
                            placeholder="01XXXXXXXXX"
                            value={formData.rocketNumber}
                            onChange={(e) => updateFormData("rocketNumber", e.target.value)}
                            className={errors.rocketNumber ? "border-destructive" : ""}
                          />
                          <FieldError error={errors.rocketNumber} />
                        </motion.div>
                      )}

                      {/* Bank Fields */}
                      {formData.preferredMethod === "bank" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <Label htmlFor="bankName">
                                Bank Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="bankName"
                                placeholder="Dutch-Bangla Bank"
                                value={formData.bankName}
                                onChange={(e) => updateFormData("bankName", e.target.value)}
                                className={errors.bankName ? "border-destructive" : ""}
                              />
                              <FieldError error={errors.bankName} />
                            </div>
                            <div>
                              <Label htmlFor="branchName">Branch</Label>
                              <Input
                                id="branchName"
                                placeholder="Gulshan Branch"
                                value={formData.branchName}
                                onChange={(e) => updateFormData("branchName", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <Label htmlFor="accountName">
                                Account Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="accountName"
                                placeholder="Name on account"
                                value={formData.accountName}
                                onChange={(e) => updateFormData("accountName", e.target.value)}
                                className={errors.accountName ? "border-destructive" : ""}
                              />
                              <FieldError error={errors.accountName} />
                            </div>
                            <div>
                              <Label htmlFor="accountNumber">
                                Account Number <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="accountNumber"
                                placeholder="Account number"
                                value={formData.accountNumber}
                                onChange={(e) =>
                                  updateFormData("accountNumber", e.target.value)
                                }
                                className={errors.accountNumber ? "border-destructive" : ""}
                              />
                              <FieldError error={errors.accountNumber} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                            <Input
                              id="routingNumber"
                              placeholder="Routing number"
                              value={formData.routingNumber}
                              onChange={(e) => updateFormData("routingNumber", e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}

                      <div className="flex items-start gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Your payment info is securely stored. You can change it later.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Policies */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Store Policies
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Define your return and shipping policies
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="returnPolicy">
                          Return Policy <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="returnPolicy"
                          value={formData.returnPolicy}
                          onChange={(e) => updateFormData("returnPolicy", e.target.value)}
                          rows={6}
                          className={`font-mono text-xs sm:text-sm ${
                            errors.returnPolicy ? "border-destructive" : ""
                          }`}
                        />
                        <div className="flex justify-between mt-1">
                          <FieldError error={errors.returnPolicy} />
                          <span className="text-xs text-muted-foreground">
                            {formData.returnPolicy.length}/5000
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shippingPolicy">
                          Shipping Policy <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="shippingPolicy"
                          value={formData.shippingPolicy}
                          onChange={(e) => updateFormData("shippingPolicy", e.target.value)}
                          rows={6}
                          className={`font-mono text-xs sm:text-sm ${
                            errors.shippingPolicy ? "border-destructive" : ""
                          }`}
                        />
                        <div className="flex justify-between mt-1">
                          <FieldError error={errors.shippingPolicy} />
                          <span className="text-xs text-muted-foreground">
                            {formData.shippingPolicy.length}/5000
                          </span>
                        </div>
                      </div>

                      <div
                        className={`p-3 sm:p-4 rounded-lg border-2 ${
                          errors.termsAccepted
                            ? "border-destructive bg-destructive/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="termsAccepted"
                            checked={formData.termsAccepted}
                            onCheckedChange={(checked) =>
                              updateFormData("termsAccepted", checked)
                            }
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor="termsAccepted"
                            className="text-xs sm:text-sm leading-relaxed cursor-pointer"
                          >
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                              Terms of Service
                            </Link>
                            ,{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                            , and{" "}
                            <Link
                              href="/vendor-agreement"
                              className="text-primary hover:underline"
                            >
                              Seller Agreement
                            </Link>
                            .
                          </Label>
                        </div>
                        <FieldError error={errors.termsAccepted} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="gap-1 sm:gap-2 text-sm"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Back</span>
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="gap-1 sm:gap-2 text-sm"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Validating...</span>
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.termsAccepted}
                    className="gap-1 sm:gap-2 text-sm bg-linear-to-r from-primary to-primary/80"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Submit Application</span>
                        <span className="sm:hidden">Submit</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {[
            {
              icon: BadgeCheck,
              title: "Trusted Platform",
              description: "Join thousands of verified sellers",
            },
            {
              icon: Sparkles,
              title: "Easy Setup",
              description: "Get started in minutes",
            },
            {
              icon: Clock,
              title: "Quick Approval",
              description: "Reviewed within 24-48 hours",
            },
          ].map((benefit, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}