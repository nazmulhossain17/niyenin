// ========================================
// app/(dashboard)/admin/page.tsx - Admin Dashboard Home
// ========================================

import { db } from "@/db/drizzle";
import { orders, products, vendors, user, supportTickets } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import Link from "next/link";

async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total orders
  const totalOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders);

  // Orders this month
  const ordersThisMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(gte(orders.createdAt, thirtyDaysAgo));

  // Total revenue
  const totalRevenue = await db
    .select({ sum: sql<number>`sum(${orders.totalAmount}::numeric)` })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));

  // Revenue this month
  const revenueThisMonth = await db
    .select({ sum: sql<number>`sum(${orders.totalAmount}::numeric)` })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "paid"),
        gte(orders.createdAt, thirtyDaysAgo)
      )
    );

  // Total products
  const totalProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);

  // Pending products
  const pendingProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "pending_review"));

  // Total vendors
  const totalVendors = await db
    .select({ count: sql<number>`count(*)` })
    .from(vendors);

  // Pending vendors
  const pendingVendors = await db
    .select({ count: sql<number>`count(*)` })
    .from(vendors)
    .where(eq(vendors.status, "pending"));

  // Total users
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);

  // New users this week
  const newUsersThisWeek = await db
    .select({ count: sql<number>`count(*)` })
    .from(user)
    .where(gte(user.createdAt, sevenDaysAgo));

  // Open support tickets
  const openTickets = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportTickets)
    .where(eq(supportTickets.status, "open"));

  // Pending orders
  const pendingOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));

  return {
    totalOrders: Number(totalOrders[0]?.count || 0),
    ordersThisMonth: Number(ordersThisMonth[0]?.count || 0),
    totalRevenue: Number(totalRevenue[0]?.sum || 0),
    revenueThisMonth: Number(revenueThisMonth[0]?.sum || 0),
    totalProducts: Number(totalProducts[0]?.count || 0),
    pendingProducts: Number(pendingProducts[0]?.count || 0),
    totalVendors: Number(totalVendors[0]?.count || 0),
    pendingVendors: Number(pendingVendors[0]?.count || 0),
    totalUsers: Number(totalUsers[0]?.count || 0),
    newUsersThisWeek: Number(newUsersThisWeek[0]?.count || 0),
    openTickets: Number(openTickets[0]?.count || 0),
    pendingOrders: Number(pendingOrders[0]?.count || 0),
  };
}

async function getRecentOrders() {
  const recentOrders = await db
    .select({
      order: orders,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(5);

  return recentOrders;
}

async function getPendingVendors() {
  const pending = await db
    .select({
      vendor: vendors,
      owner: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(vendors)
    .leftJoin(user, eq(vendors.userId, user.id))
    .where(eq(vendors.status, "pending"))
    .orderBy(sql`${vendors.createdAt} DESC`)
    .limit(5);

  return pending;
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders();
  const pendingVendors = await getPendingVendors();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtext: `${formatCurrency(stats.revenueThisMonth)} this month`,
      color: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      subtext: `${stats.ordersThisMonth} this month`,
      color: "bg-blue-500",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      subtext: `${stats.pendingProducts} pending review`,
      color: "bg-purple-500",
    },
    {
      title: "Total Vendors",
      value: stats.totalVendors.toLocaleString(),
      subtext: `${stats.pendingVendors} pending approval`,
      color: "bg-orange-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      subtext: `${stats.newUsersThisWeek} new this week`,
      color: "bg-pink-500",
    },
    {
      title: "Support Tickets",
      value: stats.openTickets.toLocaleString(),
      subtext: "Open tickets",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-6 border-l-4"
            style={{ borderLeftColor: stat.color.replace("bg-", "#") }}
          >
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {(stats.pendingOrders > 0 || stats.pendingProducts > 0 || stats.pendingVendors > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Requires Attention</h3>
          <div className="mt-2 flex flex-wrap gap-4">
            {stats.pendingOrders > 0 && (
              <Link
                href="/admin/orders?status=pending"
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                {stats.pendingOrders} pending orders
              </Link>
            )}
            {stats.pendingProducts > 0 && (
              <Link
                href="/admin/products?status=pending_review"
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                {stats.pendingProducts} products awaiting review
              </Link>
            )}
            {stats.pendingVendors > 0 && (
              <Link
                href="/admin/vendors?status=pending"
                className="text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                {stats.pendingVendors} vendor applications
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-4 text-gray-500 text-sm">No orders yet</p>
            ) : (
              recentOrders.map(({ order, customer }) => (
                <div key={order.orderId} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{customer?.name || "Guest"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(Number(order.totalAmount))}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Pending Vendor Applications</h2>
            <Link href="/admin/vendors?status=pending" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {pendingVendors.length === 0 ? (
              <p className="px-6 py-4 text-gray-500 text-sm">No pending applications</p>
            ) : (
              pendingVendors.map(({ vendor, owner }) => (
                <div key={vendor.vendorId} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{vendor.shopName}</p>
                    <p className="text-sm text-gray-500">{owner?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </p>
                    <Link
                      href={`/admin/vendors/${vendor.vendorId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
