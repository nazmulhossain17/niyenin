// ========================================
// File: app/checkout/page.tsx
// Checkout Page - Requires address before proceeding
// ========================================

// ========================================
// File: app/checkout/page.tsx
// Checkout Page - Requires address before proceeding
// ========================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddressCheck } from "@/hooks/use-address-check";
import { authClient } from "@/lib/auth-client";

// This is a wrapper component that checks for addresses before showing checkout
// Replace the children with your actual checkout form component

export default function CheckoutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  const { hasAddresses, isLoading: addressLoading, addresses } = useAddressCheck({
    required: false, // We handle redirect manually here for better UX
  });

  // Check authentication first
  useEffect(() => {
    async function checkAuth() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/checkout");
        return;
      }
      setIsAuthenticated(true);
    }
    checkAuth();
  }, [router]);

  // Loading state
  if (isAuthenticated === null || addressLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2
            className="w-10 h-10 animate-spin"
            style={{ color: "var(--brand)" }}
          />
          <p style={{ color: "var(--muted-foreground)" }}>
            Preparing checkout...
          </p>
        </motion.div>
      </div>
    );
  }

  // No addresses - show prompt to add address
  if (!hasAddresses) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card
            className="border-0 shadow-2xl"
            style={{
              backgroundColor: "var(--card)",
              background:
                "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
            }}
          >
            <CardContent className="pt-8 pb-6 px-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-chart-1) 0%, var(--color-chart-5) 100%)",
                }}
              >
                <MapPin
                  className="w-8 h-8"
                  style={{ color: "var(--primary-foreground)" }}
                />
              </motion.div>

              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "var(--card-foreground)" }}
              >
                Delivery Address Required
              </h2>

              <p
                className="mb-6"
                style={{ color: "var(--muted-foreground)" }}
              >
                Please add a delivery address before proceeding with checkout.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() =>
                    router.push("/profile/addresses/setup?returnTo=/checkout")
                  }
                  className="w-full h-11 font-medium"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Delivery Address
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full h-11"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Has addresses - show checkout
  // Replace this with your actual checkout component
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background:
          "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold mb-6"
            style={{ color: "var(--foreground)" }}
          >
            Checkout
          </h1>

          {/* Your checkout form goes here */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main checkout form */}
            <div className="lg:col-span-2">
              <Card
                className="border-0"
                style={{ backgroundColor: "var(--card)" }}
              >
                <CardContent className="p-6">
                  {/* Delivery Address Selection */}
                  <h3
                    className="font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: "var(--brand)" }} />
                    Delivery Address
                  </h3>

                  <div className="space-y-3">
                    {addresses.map((address: any) => (
                      <div
                        key={address.addressId}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          address.isDefault
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-brand/50"
                        }`}
                        style={{
                          borderColor: address.isDefault
                            ? "var(--brand)"
                            : "var(--border)",
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: "var(--card-foreground)" }}
                            >
                              {address.fullName}
                            </p>
                            <p
                              className="text-sm mt-1"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {address.addressLine1}, {address.city},{" "}
                              {address.district}
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {address.phone}
                            </p>
                          </div>
                          {address.isDefault && (
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: "var(--brand)/15",
                                color: "var(--brand)",
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/profile/addresses")}
                  >
                    Manage Addresses
                  </Button>

                  {/* Add more checkout sections here: Payment method, Order notes, etc. */}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card
                className="border-0 sticky top-4"
                style={{ backgroundColor: "var(--card)" }}
              >
                <CardContent className="p-6">
                  <h3
                    className="font-semibold mb-4"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    Order Summary
                  </h3>

                  {/* Placeholder - replace with actual cart items */}
                  <div
                    className="py-8 text-center"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <p className="text-sm">Your cart items will appear here</p>
                  </div>

                  <Button
                    className="w-full h-12 font-semibold mt-4"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}