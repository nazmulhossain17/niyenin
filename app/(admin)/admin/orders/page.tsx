// ========================================
// File: app/admin/orders/page.tsx
// Admin Orders Management Page
// ========================================

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  X,
  Printer,
  Edit,
  Trash2,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";

// Types
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  items: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001234",
    customer: { name: "John Doe", email: "john@example.com", phone: "+880 1712345678" },
    items: 3,
    total: 2450.0,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "bKash",
    shippingAddress: "123 Main St, Dhaka 1205, Bangladesh",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-001235",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "+880 1812345678" },
    items: 1,
    total: 890.5,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    shippingAddress: "456 Park Ave, Chittagong, Bangladesh",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-17T11:00:00Z",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-001236",
    customer: { name: "Mike Johnson", email: "mike@example.com", phone: "+880 1912345678" },
    items: 5,
    total: 4200.0,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Nagad",
    shippingAddress: "789 Lake Rd, Sylhet, Bangladesh",
    createdAt: "2024-01-17T14:45:00Z",
    updatedAt: "2024-01-17T14:45:00Z",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-001237",
    customer: { name: "Sarah Williams", email: "sarah@example.com", phone: "+880 1612345678" },
    items: 2,
    total: 1560.0,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Cash on Delivery",
    shippingAddress: "321 River St, Rajshahi, Bangladesh",
    createdAt: "2024-01-18T08:00:00Z",
    updatedAt: "2024-01-18T08:00:00Z",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-001238",
    customer: { name: "David Brown", email: "david@example.com", phone: "+880 1512345678" },
    items: 4,
    total: 3890.0,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "bKash",
    shippingAddress: "654 Hill Ave, Khulna, Bangladesh",
    createdAt: "2024-01-14T16:30:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "6",
    orderNumber: "ORD-2024-001239",
    customer: { name: "Emily Davis", email: "emily@example.com", phone: "+880 1412345678" },
    items: 2,
    total: 1250.0,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    shippingAddress: "987 Beach Rd, Cox's Bazar, Bangladesh",
    createdAt: "2024-01-18T11:20:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
  {
    id: "7",
    orderNumber: "ORD-2024-001240",
    customer: { name: "Robert Wilson", email: "robert@example.com", phone: "+880 1312345678" },
    items: 6,
    total: 5670.0,
    status: "returned",
    paymentStatus: "refunded",
    paymentMethod: "Nagad",
    shippingAddress: "147 Forest Lane, Barisal, Bangladesh",
    createdAt: "2024-01-10T13:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
];

// Status Badge Component
const StatusBadge = ({ status, type = "order" }: { status: string; type?: "order" | "payment" }) => {
  const orderStatusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", icon: Clock },
    confirmed: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", icon: CheckCircle },
    processing: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", icon: RefreshCw },
    shipped: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", icon: Truck },
    delivered: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", icon: CheckCircle },
    cancelled: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", icon: XCircle },
    returned: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", icon: Package },
  };

  const paymentStatusConfig: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
    paid: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
    failed: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
    refunded: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  };

  if (type === "payment") {
    const config = paymentStatusConfig[status] || paymentStatusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  const config = orderStatusConfig[status] || orderStatusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Status Section */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Order Status:</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Payment:</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Shipping Address
            </h3>
            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({order.items})</span>
                <span>৳{(order.total * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>৳{(order.total * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>৳{(order.total * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">৳{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex flex-wrap gap-3 justify-end">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            <Edit className="w-4 h-4" />
            Edit Order
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm">
            <Truck className="w-4 h-4" />
            Update Status
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Orders Page
export default function AdminOrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "returned", label: "Returned" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "1,429", color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending", value: "23", color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Processing", value: "45", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Delivered", value: "1,289", color: "text-green-500", bg: "bg-green-500/10" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* More Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Extended Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Status</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="all">All Methods</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="card">Credit Card</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Order ID
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Total
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, idx) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-medium text-sm text-primary">{order.orderNumber}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-sm">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">{order.items} items</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-sm">৳{order.total.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}