// ========================================
// File: app/(home)/profile/addresses/setup/page.tsx
// Address Setup Page with Role Selection
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  User,
  Phone,
  Building2,
  Map,
  Hash,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  ShieldCheck,
  Users,
  Loader2,
  Info,
  Home,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

// Types
type AllowedRole = "customer" | "vendor" | "moderator";

interface AddressFormData {
  fullName: string;
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string;
  addressType: "home" | "office" | "other";
  isDefault: boolean;
}

interface RoleOption {
  id: AllowedRole;
  title: string;
  description: string;
  icon: React.ElementType;
  benefits: string[];
  color: string;
  bgColor: string;
}

// Role Options (excluding admin and super_admin)
const roleOptions: RoleOption[] = [
  {
    id: "customer",
    title: "Customer",
    description: "Shop and purchase products from our marketplace",
    icon: Users,
    benefits: [
      "Browse and purchase products",
      "Track your orders",
      "Save items to wishlist",
      "Write product reviews",
      "Earn loyalty points",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "vendor",
    title: "Vendor",
    description: "Sell your products on our marketplace",
    icon: Store,
    benefits: [
      "Create your own shop",
      "List unlimited products",
      "Manage orders & inventory",
      "Access sales analytics",
      "Receive payments directly",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "moderator",
    title: "Moderator",
    description: "Help maintain quality and support the community",
    icon: ShieldCheck,
    benefits: [
      "Review product listings",
      "Moderate user reviews",
      "Handle support tickets",
      "Assist in dispute resolution",
      "Community management",
    ],
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
];

// Bangladesh divisions and districts
const divisions = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const districts: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Kishoreganj", "Manikganj", "Munshiganj", "Narsingdi", "Faridpur", "Gopalganj", "Madaripur", "Rajbari", "Shariatpur"],
  Chittagong: ["Chittagong", "Cox's Bazar", "Comilla", "Brahmanbaria", "Chandpur", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati", "Bandarban"],
  Rajshahi: ["Rajshahi", "Bogra", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Sirajganj"],
  Khulna: ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  Barisal: ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
              step < currentStep
                ? "bg-green-500 text-white"
                : step === currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step < currentStep ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-12 h-1 rounded ${
                step < currentStep ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Role Selection Step
const RoleSelectionStep = ({
  selectedRole,
  onSelect,
}: {
  selectedRole: AllowedRole | null;
  onSelect: (role: AllowedRole) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Choose Your Role</h2>
        <p className="text-muted-foreground mt-2">
          Select how you want to use NIYENIN marketplace
        </p>
      </div>

      <div className="grid gap-4">
        {roleOptions.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(role.id)}
              className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? `${role.bgColor} border-current ${role.color}`
                  : "border-border hover:border-primary/30 bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? role.bgColor : "bg-muted"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? role.color : "text-muted-foreground"}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-lg ${isSelected ? role.color : ""}`}>
                      {role.title}
                    </h3>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-current bg-current"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-current/20"
                    >
                      <p className="text-xs font-medium mb-2 uppercase tracking-wider">Benefits:</p>
                      <ul className="space-y-1">
                        {role.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> You can change your role later from your profile settings.
            {selectedRole === "vendor" && (
              <span className="block mt-1">
                As a vendor, you'll need to complete additional verification before you can start selling.
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Address Form Step
const AddressFormStep = ({
  formData,
  onChange,
  errors,
}: {
  formData: AddressFormData;
  onChange: (field: keyof AddressFormData, value: string | boolean) => void;
  errors: Partial<Record<keyof AddressFormData, string>>;
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
    onChange("state", division);
    onChange("city", ""); // Reset city when division changes
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Delivery Address</h2>
        <p className="text-muted-foreground mt-2">
          Add your primary delivery address
        </p>
      </div>

      {/* Address Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Address Type</label>
        <div className="flex gap-3">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "office", label: "Office", icon: Briefcase },
            { id: "other", label: "Other", icon: MapPin },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange("addressType", type.id as "home" | "office" | "other")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                formData.addressType === type.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.fullName ? "border-destructive" : "border-border"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.phone ? "border-destructive" : "border-border"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Alternate Phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Alternate Phone (Optional)</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={formData.alternatePhone}
            onChange={(e) => onChange("alternatePhone", e.target.value)}
            placeholder="+880 1XXX-XXXXXX"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Address Line 1 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Address Line 1 <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            placeholder="House no, Road, Area"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.addressLine1 ? "border-destructive" : "border-border"
            }`}
          />
        </div>
        {errors.addressLine1 && (
          <p className="text-sm text-destructive">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Address Line 2 (Optional)</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="Apartment, Suite, Building (optional)"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Division & District */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Division <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={formData.state}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none ${
                errors.state ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90" />
          </div>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            District <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              disabled={!formData.state}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.city ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">Select District</option>
              {formData.state &&
                districts[formData.state]?.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90" />
          </div>
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Postal Code & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Postal Code <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
              placeholder="1234"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.postalCode ? "border-destructive" : "border-border"
              }`}
            />
          </div>
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <div className="relative">
            <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.country}
              readOnly
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-muted focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Landmark */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Landmark (Optional)</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => onChange("landmark", e.target.value)}
            placeholder="Near mosque, school, etc."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Default Address Checkbox */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => onChange("isDefault", e.target.checked)}
          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="isDefault" className="text-sm cursor-pointer">
          Set as my default delivery address
        </label>
      </div>
    </motion.div>
  );
};

// Confirmation Step
const ConfirmationStep = ({
  role,
  address,
}: {
  role: AllowedRole;
  address: AddressFormData;
}) => {
  const selectedRole = roleOptions.find((r) => r.id === role);
  const Icon = selectedRole?.icon || Users;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Review Your Information</h2>
        <p className="text-muted-foreground mt-2">
          Please confirm your details before submitting
        </p>
      </div>

      {/* Role Summary */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-sm text-muted-foreground mb-3">Selected Role</h3>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole?.bgColor}`}>
            <Icon className={`w-6 h-6 ${selectedRole?.color}`} />
          </div>
          <div>
            <p className={`font-semibold ${selectedRole?.color}`}>{selectedRole?.title}</p>
            <p className="text-sm text-muted-foreground">{selectedRole?.description}</p>
          </div>
        </div>
      </div>

      {/* Address Summary */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-sm text-muted-foreground mb-3">Delivery Address</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              address.addressType === "home"
                ? "bg-blue-500/10 text-blue-600"
                : address.addressType === "office"
                ? "bg-purple-500/10 text-purple-600"
                : "bg-gray-500/10 text-gray-600"
            }`}>
              {address.addressType.toUpperCase()}
            </span>
            {address.isDefault && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-600">
                DEFAULT
              </span>
            )}
          </div>
          <p className="font-medium">{address.fullName}</p>
          <p className="text-sm text-muted-foreground">{address.phone}</p>
          {address.alternatePhone && (
            <p className="text-sm text-muted-foreground">{address.alternatePhone}</p>
          )}
          <p className="text-sm">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-sm">
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="text-sm">{address.country}</p>
          {address.landmark && (
            <p className="text-sm text-muted-foreground">Landmark: {address.landmark}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Setup Page
export default function AddressSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AllowedRole | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
    landmark: "",
    addressType: "home",
    isDefault: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  // Pre-fill name from user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user?.name) {
          setFormData((prev) => ({ ...prev, fullName: session.user.name || "" }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAddressForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+880|0)?1[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid Bangladesh phone number";
    }
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }
    if (!formData.state) {
      newErrors.state = "Division is required";
    }
    if (!formData.city) {
      newErrors.city = "District is required";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }

    if (currentStep === 2 && !validateAddressForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API calls
      // 1. Update user role
      // await api.updateUserRole(selectedRole);
      
      // 2. Create address
      // await api.createAddress(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Profile setup completed successfully!");

      // Redirect based on role
      if (selectedRole === "vendor") {
        router.push("/vendor/onboarding");
      } else if (selectedRole === "moderator") {
        router.push("/moderator/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-bold text-primary">NIYENIN</h1>
          </Link>
          <p className="text-muted-foreground">Complete your profile setup</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Step Labels */}
        <div className="flex justify-between mb-8 text-sm">
          <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
            Select Role
          </span>
          <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
            Add Address
          </span>
          <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
            Confirm
          </span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
          {/* Step Content */}
          {currentStep === 1 && (
            <RoleSelectionStep
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />
          )}

          {currentStep === 2 && (
            <AddressFormStep
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
            />
          )}

          {currentStep === 3 && selectedRole && (
            <ConfirmationStep role={selectedRole} address={formData} />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Skip Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Want to do this later?{" "}
          <Link href="/" className="text-primary hover:underline">
            Skip for now
          </Link>
        </p>
      </div>
    </div>
  );
}