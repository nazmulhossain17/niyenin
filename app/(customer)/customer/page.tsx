// ========================================
// File: app/(home)/profile/page.tsx
// Customer Dashboard - Main Overview
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Star,
  Gift,
  Coins,
  ChevronRight,
  Camera,
  Award,
  Calendar,
  Edit,
} from "lucide-react";
import {
  DashboardContainer,
  Section,
  StatsGrid,
  Grid,
  QuickAction,
  ListItem,
} from "@/components/dashboard/container";
import { authClient } from "@/lib/auth-client";
import { useWishlist } from "@/context/wishlist-context";

// Types
interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  image?: string;
}

// Mock Data
const mockOrderSummary = {
  total: 24,
  pending: 2,
  processing: 3,
  shipped: 4,
  delivered: 14,
  cancelled: 1,
};

const mockRecentOrders: RecentOrder[] = [
  { id: "1", orderNumber: "ORD-2024-1234", date: "2024-01-20T10:30:00Z", total: 45600, status: "shipped", items: 3, image: "/images/products/macbook.png" },
  { id: "2", orderNumber: "ORD-2024-1233", date: "2024-01-18T14:20:00Z", total: 12300, status: "delivered", items: 2, image: "/images/products/headphones.png" },
  { id: "3", orderNumber: "ORD-2024-1232", date: "2024-01-15T09:45:00Z", total: 8900, status: "delivered", items: 1, image: "/images/products/mouse.png" },
];

const mockUserStats = {
  totalOrders: 24,
  totalSpent: 245600,
  loyaltyPoints: 2456,
  wishlistItems: 12,
  reviewsWritten: 8,
  memberSince: "2023-06-15",
};

// Status Badge
const OrderStatusBadge = ({ status }: { status: RecentOrder["status"] }) => {
  const config = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", icon: Clock, label: "Pending" },
    processing: { bg: "bg-blue-500/10", text: "text-blue-600", icon: Package, label: "Processing" },
    shipped: { bg: "bg-purple-500/10", text: "text-purple-600", icon: Truck, label: "Shipped" },
    delivered: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle, label: "Delivered" },
    cancelled: { bg: "bg-red-500/10", text: "text-red-600", icon: XCircle, label: "Cancelled" },
  };
  const { bg, text, icon: Icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// Stat Card
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-xl border border-border p-4"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const { itemCount: wishlistCount } = useWishlist();
  const orderSummary = mockOrderSummary;
  const recentOrders = mockRecentOrders;
  const userStats = mockUserStats;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  const memberDuration = () => {
    const start = new Date(userStats.memberSince);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""}`;
  };

  return (
    <DashboardContainer>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg overflow-hidden">
              {user?.image ? (
                <Image src={user.image} alt={user.name || "User"} fill className="rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{user?.name || "User"}</h1>
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" />
                Gold Member
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Member for {memberDuration()}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                {userStats.loyaltyPoints.toLocaleString()} Points
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/profile/settings">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatCard icon={ShoppingBag} label="Total Orders" value={userStats.totalOrders} color="bg-blue-500" />
        <StatCard icon={Coins} label="Total Spent" value={`৳${(userStats.totalSpent / 1000).toFixed(0)}K`} color="bg-green-500" />
        <StatCard icon={Star} label="Reviews" value={userStats.reviewsWritten} color="bg-yellow-500" />
        <StatCard icon={Heart} label="Wishlist" value={wishlistCount || userStats.wishlistItems} color="bg-red-500" />
      </StatsGrid>

      {/* Order Summary */}
      <Section title="Order Summary" className="mt-6">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { label: "Total", value: orderSummary.total, color: "text-foreground" },
            { label: "Pending", value: orderSummary.pending, color: "text-yellow-500" },
            { label: "Processing", value: orderSummary.processing, color: "text-blue-500" },
            { label: "Shipped", value: orderSummary.shipped, color: "text-purple-500" },
            { label: "Delivered", value: orderSummary.delivered, color: "text-green-500" },
            { label: "Cancelled", value: orderSummary.cancelled, color: "text-red-500" },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-muted/50 rounded-lg">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Recent Orders & Quick Links */}
      <Grid cols={3} className="mt-6">
        <div className="lg:col-span-2">
          <Section
            title="Recent Orders"
            action={
              <Link href="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            }
            className="overflow-hidden"
          >
            <div className="divide-y divide-border -mx-5 -mb-5">
              {recentOrders.map((order) => (
                <ListItem key={order.id} href={`/orders/${order.id}`}>
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    {order.image ? (
                      <Image src={order.image} alt="Order" width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.items} item{order.items > 1 ? "s" : ""} •{" "}
                      {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="font-semibold text-primary mt-1">৳{order.total.toLocaleString()}</p>
                  </div>
                </ListItem>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Quick Links">
          <div className="space-y-3">
            <QuickAction icon={Package} label="My Orders" href="/orders" color="bg-blue-500" />
            <QuickAction icon={Heart} label="Wishlist" href="/wishlist" color="bg-red-500" />
            <QuickAction icon={MapPin} label="Addresses" href="/profile/addresses" color="bg-green-500" />
            <QuickAction icon={CreditCard} label="Payment Methods" href="/profile/payments" color="bg-purple-500" />
            <QuickAction icon={Bell} label="Notifications" href="/profile/notifications" color="bg-orange-500" />
            <QuickAction icon={Settings} label="Account Settings" href="/profile/settings" color="bg-gray-500" />
          </div>
        </Section>
      </Grid>

      {/* Loyalty Program Card */}
      <div className="mt-6 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-xl border border-yellow-500/20 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shrink-0">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Loyalty Points</h3>
              <p className="text-muted-foreground text-sm">
                You have <span className="font-bold text-yellow-600">{userStats.loyaltyPoints}</span> points worth{" "}
                <span className="font-bold text-yellow-600">৳{userStats.loyaltyPoints}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/rewards">
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                Redeem Points
              </button>
            </Link>
            <Link href="/rewards/history">
              <button className="px-4 py-2 border border-yellow-500/30 text-yellow-600 rounded-lg font-medium hover:bg-yellow-500/10 transition-colors text-sm">
                View History
              </button>
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to Platinum</span>
            <span className="font-medium">2,456 / 5,000 points</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "49%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Earn 2,544 more points to reach Platinum status and unlock exclusive benefits!
          </p>
        </div>
      </div>
    </DashboardContainer>
  );
}