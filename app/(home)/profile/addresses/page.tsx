// ========================================
// File: app/profile/addresses/page.tsx
// Addresses Management Page - View, Edit, Delete addresses
// ========================================

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

import {
  MapPin,
  Home,
  Building2,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Star,
  Phone,
  User,
  AlertCircle,
  Loader2,
  Check,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Bangladesh districts
const DISTRICTS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh",
  "Comilla", "Gazipur", "Narayanganj", "Bogra", "Cox's Bazar", "Jessore", "Dinajpur",
  "Brahmanbaria", "Tangail", "Narsingdi", "Savar", "Tongi", "Jamalpur", "Rangamati",
  "Nawabganj", "Kushtia", "Faridpur", "Noakhali", "Habiganj", "Chandpur", "Feni"
].sort();

// Address labels
const ADDRESS_LABELS: Record<string, { label: string; icon: any }> = {
  home: { label: "Home", icon: Home },
  office: { label: "Office", icon: Briefcase },
  apartment: { label: "Apartment", icon: Building2 },
  other: { label: "Other", icon: MapPin },
};

interface Address {
  addressId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

const emptyFormData: AddressFormData = {
  label: "home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AddressFormData>(emptyFormData);
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      const result = await response.json();

      if (result.success) {
        setAddresses(result.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddressFormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Required";
    if (!formData.city.trim()) newErrors.city = "Required";
    if (!formData.district) newErrors.district = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData(emptyFormData);
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label || "other",
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      district: address.district,
      postalCode: address.postalCode || "",
      isDefault: address.isDefault,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.addressId}`
        : "/api/user/addresses";

      const response = await fetch(url, {
        method: editingAddress ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, country: "Bangladesh" }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingAddress ? "Address updated" : "Address added");
        setIsDialogOpen(false);
        fetchAddresses();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    setIsDeleting(addressId);

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Address deleted");
        setAddresses((prev) => prev.filter((a) => a.addressId !== addressId));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    } finally {
      setIsDeleting(null);
      setDeleteConfirmId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/set-default`, {
        method: "PATCH",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update default address");
    }
  };

  const getAddressIcon = (label: string) => {
    const item = ADDRESS_LABELS[label] || ADDRESS_LABELS.other;
    return item.icon;
  };

  const getAddressLabel = (label: string) => {
    const item = ADDRESS_LABELS[label] || ADDRESS_LABELS.other;
    return item.label;
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              My Addresses
            </h1>
            <p style={{ color: "var(--muted-foreground)" }} className="mt-1">
              Manage your delivery addresses
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="h-11 px-6 font-medium"
            style={{
              background:
                "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
              color: "var(--primary-foreground)",
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border-0" style={{ backgroundColor: "var(--card)" }}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && addresses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card
              className="border-0 text-center py-12"
              style={{
                backgroundColor: "var(--card)",
                background: "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
              }}
            >
              <CardContent>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <MapPin className="w-8 h-8" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--card-foreground)" }}
                >
                  No addresses yet
                </h3>
                <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
                  Add your first delivery address to get started
                </p>
                <Button
                  onClick={openAddDialog}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Address Cards */}
        {!isLoading && addresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence>
              {addresses.map((address, index) => {
                const Icon = getAddressIcon(address.label);
                return (
                  <motion.div
                    key={address.addressId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`border-2 transition-all duration-200 hover:shadow-lg ${
                        address.isDefault ? "border-brand" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: "var(--card)",
                        borderColor: address.isDefault ? "var(--brand)" : "transparent",
                      }}
                    >
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{
                                background: address.isDefault
                                  ? "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)"
                                  : "var(--muted)",
                              }}
                            >
                              <Icon
                                className="w-4 h-4"
                                style={{
                                  color: address.isDefault
                                    ? "var(--primary-foreground)"
                                    : "var(--muted-foreground)",
                                }}
                              />
                            </div>
                            <div>
                              <p
                                className="font-medium text-sm"
                                style={{ color: "var(--card-foreground)" }}
                              >
                                {getAddressLabel(address.label)}
                              </p>
                              {address.isDefault && (
                                <Badge
                                  className="text-xs mt-0.5"
                                  style={{
                                    backgroundColor: "var(--brand)/15",
                                    color: "var(--brand)",
                                  }}
                                >
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(address)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {!address.isDefault && (
                                <DropdownMenuItem
                                  onClick={() => handleSetDefault(address.addressId)}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Set as Default
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(address.addressId)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-1.5 text-sm">
                          <p
                            className="font-medium"
                            style={{ color: "var(--card-foreground)" }}
                          >
                            {address.fullName}
                          </p>
                          <p style={{ color: "var(--muted-foreground)" }}>
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p style={{ color: "var(--muted-foreground)" }}>
                            {address.city}, {address.district}
                            {address.postalCode && ` - ${address.postalCode}`}
                          </p>
                          <p
                            className="flex items-center gap-1.5 pt-1"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {address.phone}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Update your delivery address details"
                  : "Enter your delivery address details"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Label Selection */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(ADDRESS_LABELS).map(([value, { label, icon: Icon }]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange("label", value)}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1`}
                    style={{
                      borderColor:
                        formData.label === value ? "var(--brand)" : "var(--border)",
                      backgroundColor:
                        formData.label === value ? "var(--brand)/10" : "transparent",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color:
                          formData.label === value
                            ? "var(--brand)"
                            : "var(--muted-foreground)",
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color:
                          formData.label === value
                            ? "var(--brand)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-sm">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`mt-1.5 ${errors.fullName ? "border-red-500" : ""}`}
                  placeholder="Enter full name"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`mt-1.5 ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="01XXX-XXXXXX"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <Label htmlFor="addressLine1" className="text-sm">
                  Street Address *
                </Label>
                <Textarea
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  className={`mt-1.5 min-h-17.5 ${
                    errors.addressLine1 ? "border-red-500" : ""
                  }`}
                  placeholder="House/Building, Street, Area"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <Label htmlFor="addressLine2" className="text-sm">
                  Apartment, Suite (Optional)
                </Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  className="mt-1.5"
                  placeholder="Apartment, floor, landmark"
                />
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-sm">
                    City/Area *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={`mt-1.5 ${errors.city ? "border-red-500" : ""}`}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="district" className="text-sm">
                    District *
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => handleInputChange("district", value)}
                  >
                    <SelectTrigger
                      className={`mt-1.5 ${errors.district ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <Label htmlFor="postalCode" className="text-sm">
                  Postal Code (Optional)
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className="mt-1.5 w-1/2"
                  placeholder="Postal code"
                />
              </div>

              {/* Default Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    handleInputChange("isDefault", checked as boolean)
                  }
                />
                <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                  Set as default address
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                  color: "var(--primary-foreground)",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingAddress ? "Update" : "Save"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmId !== null}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Address</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this address? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                disabled={isDeleting !== null}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}