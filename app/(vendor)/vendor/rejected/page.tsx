// ========================================
// File: app/(home)/vendor/rejected/page.tsx
// Vendor Application Rejected Page
// ========================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  XCircle,
  Mail,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

interface VendorData {
  shopName: string;
  status: string;
  rejectionReason: string | null;
  adminNotes: string | null;
  businessEmail: string;
}

export default function VendorRejectedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          router.push("/sign-in?callbackUrl=/vendor/rejected");
          return;
        }

        const response = await fetch("/api/vendor/onboarding");
        const data = await response.json();

        if (!data.success || !data.data.vendor) {
          router.push("/become-seller");
          return;
        }

        // If not rejected, redirect appropriately
        if (data.data.status === "approved") {
          router.push("/vendor");
          return;
        }

        if (data.data.status === "pending") {
          router.push("/vendor/pending");
          return;
        }

        setVendorData({
          shopName: data.data.vendor.shopName,
          status: data.data.vendor.status,
          rejectionReason: data.data.vendor.rejectionReason,
          adminNotes: data.data.vendor.adminNotes,
          businessEmail: data.data.vendor.businessEmail,
        });
      } catch (error) {
        console.error("Error fetching vendor status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-red-50/50 dark:from-red-900/10 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50/50 dark:from-red-900/10 to-background">
      {/* Header */}
      <div className="bg-linear-to-r from-red-500 to-rose-500 text-white py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-10 h-10" />
          </motion.div>
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            Application Status
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Application Not Approved
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Unfortunately, we were unable to approve your seller application at this
            time. Please review the details below.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 -mt-8">
        {/* Rejection Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8">
              {/* Shop Name */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <h2 className="text-xl font-bold">{vendorData.shopName}</h2>
                  <Badge variant="destructive" className="mt-2">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Approved
                  </Badge>
                </div>
              </div>

              {/* Rejection Reason */}
              {(vendorData.rejectionReason || vendorData.adminNotes) && (
                <div className="mb-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                          Reason for Rejection
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {vendorData.rejectionReason ||
                            vendorData.adminNotes ||
                            "Your application did not meet our seller requirements. Please contact support for more details."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Reasons */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  Common Reasons for Rejection
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    Incomplete or inaccurate business information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    Invalid or unverifiable contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    Products or business category not allowed on our platform
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    Inadequate return or shipping policies
                  </li>
                </ul>
              </div>

              {/* What to do next */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Want to appeal or reapply?
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      If you believe this was a mistake or have corrected the issues,
                      you can contact our support team or submit a new application.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/support/contact" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/become-seller" className="flex-1">
                  <Button className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Apply Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Need more information about our seller requirements?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/seller-guidelines">
              <Button variant="link" className="gap-2">
                View Seller Guidelines
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/faq/sellers">
              <Button variant="link" className="gap-2">
                Seller FAQ
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              Return to Homepage
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}