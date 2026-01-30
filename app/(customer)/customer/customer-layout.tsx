"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  User,
  Star,
  Gift,
  Shield,
  HelpCircle,
  FileText,
} from "lucide-react";

import { DashboardSidebar, NavItem } from "@/components/dashboard/sidebar";
import { authClient } from "@/lib/auth-client";
import { WishlistProvider } from "@/context/wishlist-context";

const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/customer",
  },
  {
    icon: Package,
    label: "My Orders",
    href: "/customer/orders",
    badge: 3,
  },
  {
    icon: Heart,
    label: "Wishlist",
    href: "/customer/wishlist",
  },
  {
    icon: MapPin,
    label: "Addresses",
    href: "/profile/addresses",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    href: "/profile/payments",
  },
  {
    icon: Star,
    label: "My Reviews",
    href: "/profile/reviews",
  },
  {
    icon: Gift,
    label: "Rewards",
    children: [
      { icon: Gift, label: "My Points", href: "/profile/rewards" },
      { icon: FileText, label: "Points History", href: "/profile/rewards/history" },
    ],
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/profile/notifications",
    badge: 5,
  },
  {
    icon: Settings,
    label: "Settings",
    children: [
      { icon: User, label: "Edit Profile", href: "/profile/settings" },
      { icon: Shield, label: "Security", href: "/profile/settings/security" },
    ],
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    href: "/profile/support",
  },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          router.push("/sign-in?callbackUrl=/profile");
          return;
        }
        const role = (session.user as any).role;
        if (role !== "customer") {
          router.push("/");
          return;
        }
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
    router.push("/");
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
          icon: User,
          title: "My Account",
          href: "/cutomer",
        }}
        user={{
          name: user?.name ?? "Guest",
          email: user?.email ?? "",
          image: user?.image,
          role: "Customer",
        }}
        backLink={{
          label: "Continue Shopping",
          href: "/shop",
        }}
        onSignOut={handleSignOut}
      />

      {/* ── Important: Wrap children with WishlistProvider ── */}
      <WishlistProvider>
        <main className="md:ml-64 p-4 md:p-8">{children}</main>
      </WishlistProvider>
    </div>
  );
}