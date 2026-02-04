// ========================================
// File: app/admin/page.tsx
// Admin Dashboard Main Page
// ========================================

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
} from "lucide-react";
import Link from "next/link";

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ElementType;
  iconBg: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`flex items-center text-sm font-medium ${
              changeType === "increase" ? "text-green-500" : "text-red-500"
            }`}
          >
            {changeType === "increase" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {change}
          </span>
          <span className="text-xs text-muted-foreground">{subtitle || "vs last month"}</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// Mini Chart Component (simplified bar chart)
const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, idx) => (
        <div
          key={idx}
          className={`w-2 rounded-t ${color}`}
          style={{ height: `${(value / max) * 100}%`, opacity: 0.3 + (idx / data.length) * 0.7 }}
        />
      ))}
    </div>
  );
};

// Order Status Badge
const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
    processing: { bg: "bg-blue-500/10", text: "text-blue-500", icon: RefreshCw },
    shipped: { bg: "bg-purple-500/10", text: "text-purple-500", icon: Truck },
    delivered: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle },
    cancelled: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Recent Orders Table
const RecentOrdersTable = () => {
  const orders = [
    { id: "ORD-2024-001", customer: "John Doe", amount: "$125.00", status: "delivered", date: "2 hours ago" },
    { id: "ORD-2024-002", customer: "Jane Smith", amount: "$89.50", status: "shipped", date: "3 hours ago" },
    { id: "ORD-2024-003", customer: "Mike Johnson", amount: "$245.00", status: "processing", date: "5 hours ago" },
    { id: "ORD-2024-004", customer: "Sarah Williams", amount: "$67.25", status: "pending", date: "6 hours ago" },
    { id: "ORD-2024-005", customer: "David Brown", amount: "$189.99", status: "cancelled", date: "8 hours ago" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-sm">{order.id}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm">{order.customer}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium">{order.amount}</span>
              </td>
              <td className="py-3 px-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-muted-foreground">{order.date}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Top Products List
const TopProductsList = () => {
  const products = [
    { name: "Wireless Headphones", sales: 234, revenue: "$23,400", trend: 12 },
    { name: "Smart Watch Pro", sales: 189, revenue: "$18,900", trend: 8 },
    { name: "Laptop Stand", sales: 156, revenue: "$7,800", trend: -3 },
    { name: "USB-C Hub", sales: 142, revenue: "$5,680", trend: 15 },
    { name: "Mechanical Keyboard", sales: 128, revenue: "$12,800", trend: 5 },
  ];

  return (
    <div className="space-y-4">
      {products.map((product, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.sales} sales</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">{product.revenue}</p>
            <p
              className={`text-xs flex items-center justify-end ${
                product.trend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {product.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(product.trend)}%
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Pending Tasks Widget
const PendingTasksWidget = () => {
  const tasks = [
    { title: "Review vendor applications", count: 3, icon: Store, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Approve product listings", count: 5, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Respond to support tickets", count: 8, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Process refund requests", count: 2, icon: DollarSign, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-3">
      {tasks.map((task, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${task.bg}`}>
              <task.icon className={`w-4 h-4 ${task.color}`} />
            </div>
            <span className="text-sm font-medium">{task.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.bg} ${task.color}`}>
              {task.count}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Sales Chart (Simplified visual representation)
const SalesChart = () => {
  const data = [
    { month: "Jan", value: 65 },
    { month: "Feb", value: 78 },
    { month: "Mar", value: 90 },
    { month: "Apr", value: 81 },
    { month: "May", value: 95 },
    { month: "Jun", value: 88 },
    { month: "Jul", value: 100 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="h-64 flex items-end justify-between gap-2 px-4">
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2 flex-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg min-h-[20px] relative group cursor-pointer"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ${(item.value * 1000).toLocaleString()}
            </div>
          </motion.div>
          <span className="text-xs text-muted-foreground">{item.month}</span>
        </div>
      ))}
    </div>
  );
};

// Main Dashboard Page
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState("This Month");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            {dateRange}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="$124,592"
          change="12.5%"
          changeType="increase"
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Orders"
          value="1,429"
          change="8.2%"
          changeType="increase"
          icon={ShoppingCart}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="New Customers"
          value="892"
          change="4.1%"
          changeType="increase"
          icon={Users}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Active Vendors"
          value="156"
          change="2.3%"
          changeType="decrease"
          icon={Store}
          iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </motion.div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground">Monthly revenue trends</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <SalesChart />
        </motion.div>

        {/* Pending Tasks */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Tasks</h2>
            <Link href="/admin/tasks" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <PendingTasksWidget />
        </motion.div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-card rounded-xl border border-border"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <p className="text-sm text-muted-foreground">Latest customer orders</p>
              </div>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <RecentOrdersTable />
        </motion.div>

        {/* Top Products */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <TopProductsList />
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-xl font-bold mt-1">3.24%</p>
            </div>
            <MiniChart data={[20, 35, 25, 40, 30, 45, 50]} color="bg-green-500" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avg. Order Value</p>
              <p className="text-xl font-bold mt-1">$87.50</p>
            </div>
            <MiniChart data={[30, 25, 40, 35, 45, 40, 55]} color="bg-blue-500" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Cart Abandonment</p>
              <p className="text-xl font-bold mt-1">68.2%</p>
            </div>
            <MiniChart data={[50, 45, 55, 40, 35, 45, 40]} color="bg-orange-500" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Return Rate</p>
              <p className="text-xl font-bold mt-1">2.8%</p>
            </div>
            <MiniChart data={[15, 20, 18, 22, 16, 19, 15]} color="bg-purple-500" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}