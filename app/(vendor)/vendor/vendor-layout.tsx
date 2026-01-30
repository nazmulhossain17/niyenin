// ========================================
// File: app/(home)/vendor/layout.tsx
// Vendor Dashboard Layout
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  BarChart3,
  Settings,
  Store,
  Star,
  MessageSquare,
  Plus,
  Tag,
  Truck,
  CreditCard,
  FileText,
  Image as ImageIcon,
  User,
} from "lucide-react";
import { DashboardSidebar, NavItem } from "@/components/dashboard/sidebar";
import { authClient } from "@/lib/auth-client";

const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/vendor",
  },
  {
    icon: Package,
    label: "Products",
    children: [
      { icon: Package, label: "All Products", href: "/vendor/products" },
      { icon: Plus, label: "Add Product", href: "/vendor/products/new" },
      { icon: Tag, label: "Categories", href: "/vendor/products/categories" },
      { icon: ImageIcon, label: "Media Library", href: "/vendor/media" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/vendor/orders",
    badge: 12,
  },
  {
    icon: Wallet,
    label: "Earnings",
    children: [
      { icon: Wallet, label: "Overview", href: "/vendor/wallet" },
      { icon: CreditCard, label: "Withdrawals", href: "/vendor/wallet/withdrawals" },
      { icon: FileText, label: "Transactions", href: "/vendor/wallet/transactions" },
    ],
  },
  {
    icon: Star,
    label: "Reviews",
    href: "/vendor/reviews",
    badge: 5,
  },
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/vendor/messages",
    badge: 3,
  },
  {
    icon: Truck,
    label: "Shipping",
    href: "/vendor/shipping",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/vendor/analytics",
  },
  {
    icon: Store,
    label: "Shop Settings",
    href: "/vendor/settings/shop",
  },
  {
    icon: Settings,
    label: "Settings",
    children: [
      { icon: User, label: "Profile", href: "/vendor/settings/profile" },
      { icon: Settings, label: "Account", href: "/vendor/settings" },
    ],
  },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          router.push("/sign-in?callbackUrl=/vendor/dashboard");
          return;
        }
        // Check if user is vendor
        const role = (session.user as any).role;
        // if (role !== "vendor") {
        //   router.push("/");
        //   return;
        // }
        setUser(session.user);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        navigationItems={navigationItems}
        logo={{
          icon: Store,
          title: "Vendor",
          subtitle: "Dashboard",
          href: "/vendor/dashboard",
        }}
        user={{
          name: user?.name,
          email: user?.email,
          image: user?.image,
          role: "Vendor",
        }}
        backLink={{
          label: "Back to Store",
          href: "/",
        }}
        helpCard={{
          title: "Need Help?",
          description: "Check our documentation or contact support.",
          linkText: "Get Help",
          linkHref: "/vendor/help",
        }}
        onSignOut={handleSignOut}
      />
      {children}
    </div>
  );
}