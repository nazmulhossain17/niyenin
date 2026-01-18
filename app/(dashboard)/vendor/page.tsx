// ========================================
// app/(dashboard)/vendor/page.tsx - Vendor Dashboard Home
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { vendors, orders, orderItems, products, vendorEarnings, reviews } from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";
import Link from "next/link";

async function getVendorStats(vendorId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total earnings
  const totalEarnings = await db
    .select({ sum: sql<number>`sum(${vendorEarnings.netEarning}::numeric)` })
    .from(vendorEarnings)
    .where(eq(vendorEarnings.vendorId, vendorId));

  // Earnings this month
  const earningsThisMonth = await db
    .select({ sum: sql<number>`sum(${vendorEarnings.netEarning}::numeric)` })
    .from(vendorEarnings)
    .where(
      and(
        eq(vendorEarnings.vendorId, vendorId),
        gte(vendorEarnings.createdAt, thirtyDaysAgo)
      )
    );

  // Total orders
  const totalOrders = await db
    .select({ count: sql<number>`count(DISTINCT ${orderItems.orderId})` })
    .from(orderItems)
    .where(eq(orderItems.vendorId, vendorId));

  // Orders this week
  const ordersThisWeek = await db
    .select({ count: sql<number>`count(DISTINCT ${orderItems.orderId})` })
    .from(orderItems)
    .where(
      and(
        eq(orderItems.vendorId, vendorId),
        gte(orderItems.createdAt, sevenDaysAgo)
      )
    );

  // Total products
  const totalProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.vendorId, vendorId));

  // Active products
  const activeProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, "approved"),
        eq(products.isActive, true)
      )
    );

  // Pending products
  const pendingProducts = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        eq(products.status, "pending_review")
      )
    );

  // Total reviews
  const totalReviews = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.vendorId, vendorId));

  // Average rating
  const avgRating = await db
    .select({ avg: sql<number>`avg(${reviews.rating})` })
    .from(reviews)
    .where(and(eq(reviews.vendorId, vendorId), eq(reviews.isApproved, true)));

  // Pending balance
  const pendingBalance = await db
    .select({ sum: sql<number>`sum(${vendorEarnings.netEarning}::numeric)` })
    .from(vendorEarnings)
    .where(
      and(
        eq(vendorEarnings.vendorId, vendorId),
        eq(vendorEarnings.status, "pending")
      )
    );

  return {
    totalEarnings: Number(totalEarnings[0]?.sum || 0),
    earningsThisMonth: Number(earningsThisMonth[0]?.sum || 0),
    totalOrders: Number(totalOrders[0]?.count || 0),
    ordersThisWeek: Number(ordersThisWeek[0]?.count || 0),
    totalProducts: Number(totalProducts[0]?.count || 0),
    activeProducts: Number(activeProducts[0]?.count || 0),
    pendingProducts: Number(pendingProducts[0]?.count || 0),
    totalReviews: Number(totalReviews[0]?.count || 0),
    averageRating: Number(avgRating[0]?.avg || 0),
    pendingBalance: Number(pendingBalance[0]?.sum || 0),
  };
}

async function getRecentOrders(vendorId: string) {
  const recentOrderItems = await db
    .select({
      orderItem: orderItems,
      order: orders,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.orderId))
    .where(eq(orderItems.vendorId, vendorId))
    .orderBy(desc(orderItems.createdAt))
    .limit(5);

  return recentOrderItems;
}

async function getLowStockProducts(vendorId: string) {
  const lowStock = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.vendorId, vendorId),
        sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
      )
    )
    .limit(5);

  return lowStock;
}

export default async function VendorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Get vendor profile
  const vendor = await db
    .select()
    .from(vendors)
    .where(eq(vendors.userId, session.user.id))
    .limit(1);

  if (vendor.length === 0) {
    redirect("/become-vendor");
  }

  const vendorData = vendor[0];
  const stats = await getVendorStats(vendorData.vendorId);
  const recentOrders = await getRecentOrders(vendorData.vendorId);
  const lowStockProducts = await getLowStockProducts(vendorData.vendorId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      subtext: `${formatCurrency(stats.earningsThisMonth)} this month`,
      color: "bg-green-500",
    },
    {
      title: "Pending Balance",
      value: formatCurrency(stats.pendingBalance),
      subtext: "Available for payout",
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      subtext: `${stats.ordersThisWeek} this week`,
      color: "bg-purple-500",
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      subtext: `${stats.activeProducts} active, ${stats.pendingProducts} pending`,
      color: "bg-orange-500",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      subtext: `${stats.totalReviews} reviews`,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {vendorData.shopName}!
        </h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening with your store</p>
      </div>

      {/* Vendor Status Alert */}
      {vendorData.status !== "approved" && (
        <div
          className={`p-4 rounded-lg ${
            vendorData.status === "pending"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`font-medium ${
              vendorData.status === "pending" ? "text-yellow-800" : "text-red-800"
            }`}
          >
            {vendorData.status === "pending"
              ? "Your vendor account is pending approval. You can add products but they won't be visible until your account is approved."
              : `Your vendor account has been ${vendorData.status}. Please contact support for more information.`}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">Low Stock Alert</h3>
          <p className="text-sm text-red-700 mt-1">
            {lowStockProducts.length} product(s) are running low on stock
          </p>
          <Link
            href="/vendor/products?lowStock=true"
            className="text-sm text-red-700 hover:text-red-900 underline mt-2 inline-block"
          >
            View products
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-4 text-gray-500 text-sm">No orders yet</p>
            ) : (
              recentOrders.map(({ orderItem, order }) => (
                <div
                  key={orderItem.orderItemId}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{orderItem.productName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(Number(orderItem.total))}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link
              href="/vendor/products/new"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">+</span>
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </Link>
            <Link
              href="/vendor/orders?status=pending"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">📦</span>
              <span className="text-sm font-medium text-gray-900">Pending Orders</span>
            </Link>
            <Link
              href="/vendor/payouts"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">💰</span>
              <span className="text-sm font-medium text-gray-900">Request Payout</span>
            </Link>
            <Link
              href="/vendor/settings"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium text-gray-900">Shop Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
