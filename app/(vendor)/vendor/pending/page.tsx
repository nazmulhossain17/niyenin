// ========================================
// File: app/(home)/vendor/pending/page.tsx
// Vendor Application Pending Page
// ========================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  ArrowRight,
  Store,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

interface VendorData {
  shopName: string;
  shopSlug: string;
  status: string;
  createdAt: string;
  businessEmail: string;
}

export default function VendorPendingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch vendor status
  const fetchStatus = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/vendor/pending");
        return;
      }

      const response = await fetch("/api/vendor/onboarding");
      const data = await response.json();

      if (!data.success || !data.data.vendor) {
        router.push("/become-seller");
        return;
      }

      // If approved, redirect to vendor dashboard
      if (data.data.status === "approved") {
        router.push("/vendor");
        return;
      }

      // If rejected, show different page
      if (data.data.status === "rejected") {
        router.push("/vendor/rejected");
        return;
      }

      setVendorData({
        shopName: data.data.vendor.shopName,
        shopSlug: data.data.vendor.shopSlug,
        status: data.data.vendor.status,
        createdAt: data.data.vendor.createdAt,
        businessEmail: data.data.vendor.businessEmail,
      });
    } catch (error) {
      console.error("Error fetching vendor status:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStatus();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-amber-50/50 dark:from-amber-900/10 to-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking application status...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return null;
  }

  // Calculate days since application
  const daysSinceApplication = Math.floor(
    (Date.now() - new Date(vendorData.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/50 dark:from-amber-900/10 to-background">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white py-16 px-4">
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
            <Clock className="w-10 h-10" />
          </motion.div>
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            Application Submitted
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Application is Under Review
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Thank you for applying to become a seller! Our team is reviewing your
            application and will get back to you soon.
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8">
              {/* Shop Info */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{vendorData.shopName}</h2>
                  <p className="text-muted-foreground">
                    yoursite.com/shop/{vendorData.shopSlug}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Applied {daysSinceApplication === 0 ? "today" : `${daysSinceApplication} day${daysSinceApplication > 1 ? "s" : ""} ago`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Application Progress</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Application Submitted",
                      description: "Your seller application has been received",
                      completed: true,
                      current: false,
                    },
                    {
                      title: "Under Review",
                      description: "Our team is reviewing your application",
                      completed: false,
                      current: true,
                    },
                    {
                      title: "Verification",
                      description: "Business information verification",
                      completed: false,
                      current: false,
                    },
                    {
                      title: "Approval",
                      description: "Application approved and shop activated",
                      completed: false,
                      current: false,
                    },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-green-500 text-white"
                              : step.current
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : step.current ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        {index < 3 && (
                          <div
                            className={`w-0.5 h-8 ${
                              step.completed ? "bg-green-500" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`font-medium ${
                            step.current ? "text-amber-600 dark:text-amber-400" : ""
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      We'll notify you via email
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Once your application is reviewed, we'll send an update to{" "}
                      <span className="font-medium">{vendorData.businessEmail}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Check Status
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold mb-4">While you wait...</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: FileText,
                title: "Prepare Your Products",
                description: "Get your product photos and descriptions ready to upload",
              },
              {
                icon: Shield,
                title: "Review Seller Guidelines",
                description: "Familiarize yourself with our marketplace policies",
              },
              {
                icon: Phone,
                title: "Need Help?",
                description: "Contact our seller support team for assistance",
              },
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-12"
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How long does the review process take?",
                    a: "Most applications are reviewed within 24-48 hours. Complex cases may take up to 5 business days.",
                  },
                  {
                    q: "What happens after approval?",
                    a: "You'll receive an email with instructions to access your seller dashboard and start listing products.",
                  },
                  {
                    q: "Can I update my application?",
                    a: "For any changes to your application, please contact our seller support team.",
                  },
                ].map((faq, index) => (
                  <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                    <p className="font-medium">{faq.q}</p>
                    <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}