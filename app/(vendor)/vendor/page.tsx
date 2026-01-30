// ========================================
// File: app/(home)/vendor/dashboard/page.tsx
// Vendor Dashboard - Main Overview
// ========================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Wallet,
  BarChart3,
  Settings,
  ChevronRight,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  DashboardContainer,
  PageHeader,
  Section,
  StatsGrid,
  StatCard,
  Grid,
  AlertBanner,
  QuickAction,
  ListItem,
} from "@/components/dashboard/container";

// Types
interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: { name: string };
  products: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  stock: number;
  trend: "up" | "down" | "stable";
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

// Mock Data
const mockStats = {
  totalRevenue: 1245600,
  totalOrders: 342,
  totalProducts: 89,
  totalCustomers: 1256,
  pendingOrders: 12,
  lowStockProducts: 5,
  averageRating: 4.7,
  totalReviews: 423,
};

const mockRecentOrders: RecentOrder[] = [
  { id: "1", orderNumber: "ORD-2024-001", customer: { name: "Rahman Ahmed" }, products: 3, total: 15600, status: "pending", date: "2024-01-20T10:30:00Z" },
  { id: "2", orderNumber: "ORD-2024-002", customer: { name: "Fatima Begum" }, products: 1, total: 8900, status: "processing", date: "2024-01-20T09:15:00Z" },
  { id: "3", orderNumber: "ORD-2024-003", customer: { name: "Karim Uddin" }, products: 2, total: 23400, status: "shipped", date: "2024-01-19T16:45:00Z" },
  { id: "4", orderNumber: "ORD-2024-004", customer: { name: "Nusrat Jahan" }, products: 5, total: 45200, status: "delivered", date: "2024-01-19T11:20:00Z" },
  { id: "5", orderNumber: "ORD-2024-005", customer: { name: "Sakib Hasan" }, products: 1, total: 5600, status: "cancelled", date: "2024-01-18T14:00:00Z" },
];

const mockTopProducts: TopProduct[] = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", sold: 45, revenue: 765000, stock: 12, trend: "up" },
  { id: "2", name: "MacBook Pro 14\" M3", sold: 28, revenue: 560000, stock: 5, trend: "up" },
  { id: "3", name: "Sony WH-1000XM5", sold: 67, revenue: 234500, stock: 23, trend: "stable" },
  { id: "4", name: "Samsung Galaxy S24 Ultra", sold: 34, revenue: 510000, stock: 8, trend: "down" },
  { id: "5", name: "iPad Pro 12.9\"", sold: 22, revenue: 286000, stock: 15, trend: "up" },
];

const mockRevenueData: RevenueData[] = [
  { date: "Mon", revenue: 45000, orders: 12 },
  { date: "Tue", revenue: 52000, orders: 15 },
  { date: "Wed", revenue: 48000, orders: 11 },
  { date: "Thu", revenue: 61000, orders: 18 },
  { date: "Fri", revenue: 55000, orders: 14 },
  { date: "Sat", revenue: 72000, orders: 22 },
  { date: "Sun", revenue: 68000, orders: 19 },
];

// Status Badge Component
const OrderStatusBadge = ({ status }: { status: RecentOrder["status"] }) => {
  const config = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", icon: Clock },
    confirmed: { bg: "bg-blue-500/10", text: "text-blue-600", icon: CheckCircle },
    processing: { bg: "bg-purple-500/10", text: "text-purple-600", icon: Package },
    shipped: { bg: "bg-indigo-500/10", text: "text-indigo-600", icon: Truck },
    delivered: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle },
    cancelled: { bg: "bg-red-500/10", text: "text-red-600", icon: XCircle },
  };
  const { bg, text, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Mini Bar Chart
const MiniBarChart = ({ data }: { data: RevenueData[] }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-muted rounded-t-sm relative h-full">
            <div
              className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export default function VendorDashboardPage() {
  const [dateRange, setDateRange] = useState("7days");
  const stats = mockStats;
  const recentOrders = mockRecentOrders;
  const topProducts = mockTopProducts;
  const revenueData = mockRevenueData;

  return (
    <DashboardContainer>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store today."
        icon={Store}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Alert Banners */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {stats.pendingOrders > 0 && (
            <AlertBanner
              type="warning"
              icon={AlertCircle}
              message={
                <>
                  <span className="font-medium">Attention:</span> You have{" "}
                  <span className="font-bold">{stats.pendingOrders}</span> pending orders
                </>
              }
              action={
                <Link href="/vendor/orders?status=pending" className="text-sm font-medium hover:underline whitespace-nowrap">
                  View Orders
                </Link>
              }
            />
          )}
          {stats.lowStockProducts > 0 && (
            <AlertBanner
              type="error"
              icon={Package}
              message={
                <>
                  <span className="font-medium">Low Stock:</span>{" "}
                  <span className="font-bold">{stats.lowStockProducts}</span> products need restocking
                </>
              }
              action={
                <Link href="/vendor/products?stock=low" className="text-sm font-medium hover:underline whitespace-nowrap">
                  View Products
                </Link>
              }
            />
          )}
        </div>
      )}

      {/* Main Stats */}
      <StatsGrid columns={4}>
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          prefix="৳"
          change={12.5}
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change={8.2}
          changeType="positive"
          icon={ShoppingCart}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          change={3}
          changeType="neutral"
          icon={Package}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={15.3}
          changeType="positive"
          icon={Users}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
        />
      </StatsGrid>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500">
            <Star className="w-5 h-5 fill-yellow-500" />
            <span className="text-2xl font-bold">{stats.averageRating}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalReviews}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Reviews</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{stats.pendingOrders}</p>
          <p className="text-sm text-muted-foreground mt-1">Pending Orders</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{stats.lowStockProducts}</p>
          <p className="text-sm text-muted-foreground mt-1">Low Stock Items</p>
        </div>
      </div>

      {/* Revenue Chart & Quick Actions */}
      <Grid cols={3} className="mt-6">
        <div className="lg:col-span-2">
          <Section
            title="Revenue Overview"
            description="This week's earnings"
            action={
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ৳{revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-500 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +18.2% vs last week
                </p>
              </div>
            }
          >
            <MiniBarChart data={revenueData} />
          </Section>
        </div>

        <Section title="Quick Actions">
          <div className="space-y-3">
            <QuickAction icon={Plus} label="Add New Product" href="/vendor/products/new" color="bg-primary" />
            <QuickAction icon={ShoppingCart} label="View Orders" href="/vendor/orders" color="bg-blue-500" />
            <QuickAction icon={Wallet} label="Withdrawals" href="/vendor/wallet" color="bg-green-500" />
            <QuickAction icon={BarChart3} label="Analytics" href="/vendor/analytics" color="bg-purple-500" />
            <QuickAction icon={Settings} label="Shop Settings" href="/vendor/settings" color="bg-gray-500" />
          </div>
        </Section>
      </Grid>

      {/* Recent Orders & Top Products */}
      <Grid cols={2} className="mt-6">
        <Section
          title="Recent Orders"
          action={
            <Link href="/vendor/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          }
          className="overflow-hidden"
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {recentOrders.map((order) => (
              <ListItem key={order.id} href={`/vendor/orders/${order.id}`}>
                <div className="flex-1">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <div className="text-right ml-4">
                  <p className="font-semibold">৳{order.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{order.products} items</p>
                </div>
              </ListItem>
            ))}
          </div>
        </Section>

        <Section
          title="Top Products"
          action={
            <Link href="/vendor/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          }
          className="overflow-hidden"
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {topProducts.map((product, idx) => (
              <ListItem key={product.id} href={`/vendor/products/${product.id}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{product.sold} sold</span>
                    <span>•</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{product.revenue.toLocaleString()}</p>
                  <div className={`flex items-center justify-end gap-1 text-sm ${
                    product.trend === "up" ? "text-green-500" :
                    product.trend === "down" ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {product.trend === "up" && <TrendingUp className="w-3 h-3" />}
                    {product.trend === "down" && <TrendingDown className="w-3 h-3" />}
                    {product.trend === "up" ? "Trending" : product.trend === "down" ? "Declining" : "Stable"}
                  </div>
                </div>
              </ListItem>
            ))}
          </div>
        </Section>
      </Grid>
    </DashboardContainer>
  );
}