// ========================================
// app/(dashboard)/account/page.tsx - Customer Account Overview
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { orders, wishlists, userAddresses, supportTickets } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import Link from "next/link";

async function getAccountStats(userId: string) {
  // Total orders
  const totalOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.userId, userId));

  // Total spent
  const totalSpent = await db
    .select({ sum: sql<number>`sum(${orders.totalAmount}::numeric)` })
    .from(orders)
    .where(eq(orders.userId, userId));

  // Wishlist items
  const wishlistItems = await db
    .select({ count: sql<number>`count(*)` })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  // Saved addresses
  const savedAddresses = await db
    .select({ count: sql<number>`count(*)` })
    .from(userAddresses)
    .where(eq(userAddresses.userId, userId));

  // Open support tickets
  const openTickets = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportTickets)
    .where(
      sql`${supportTickets.userId} = ${userId} AND ${supportTickets.status} NOT IN ('resolved', 'closed')`
    );

  return {
    totalOrders: Number(totalOrders[0]?.count || 0),
    totalSpent: Number(totalSpent[0]?.sum || 0),
    wishlistItems: Number(wishlistItems[0]?.count || 0),
    savedAddresses: Number(savedAddresses[0]?.count || 0),
    openTickets: Number(openTickets[0]?.count || 0),
  };
}

async function getRecentOrders(userId: string) {
  const recentOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  return recentOrders;
}

export default async function AccountOverview() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const stats = await getAccountStats(session.user.id);
  const recentOrders = await getRecentOrders(session.user.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      href: "/account/orders",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      href: "/account/orders",
    },
    {
      title: "Wishlist Items",
      value: stats.wishlistItems.toString(),
      href: "/account/wishlist",
    },
    {
      title: "Saved Addresses",
      value: stats.savedAddresses.toString(),
      href: "/account/addresses",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}!</p>
      </div>

      {/* Open Tickets Alert */}
      {stats.openTickets > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            You have {stats.openTickets} open support ticket(s).{" "}
            <Link href="/account/support" className="underline hover:text-blue-900">
              View tickets
            </Link>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="text-primary hover:underline mt-2 inline-block">
                Start shopping
              </Link>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.orderId} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
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
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">📦</span>
            <span className="text-sm font-medium text-gray-900">My Orders</span>
          </Link>
          <Link
            href="/account/wishlist"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">❤️</span>
            <span className="text-sm font-medium text-gray-900">Wishlist</span>
          </Link>
          <Link
            href="/account/addresses"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">📍</span>
            <span className="text-sm font-medium text-gray-900">Addresses</span>
          </Link>
          <Link
            href="/account/support"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">💬</span>
            <span className="text-sm font-medium text-gray-900">Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
