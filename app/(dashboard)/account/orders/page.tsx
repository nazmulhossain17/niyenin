// ========================================
// app/(dashboard)/account/orders/page.tsx - Customer Orders Page
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { orders, orderItems } from "@/db/schema";
import { eq, sql, desc, and, inArray } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function CustomerOrdersPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const offset = (page - 1) * limit;
  const status = params.status;

  const conditions = [eq(orders.userId, session.user.id)];

  if (status) {
    conditions.push(eq(orders.status, status as "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned" | "refunded"));
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const ordersList = await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  // Get order items for each order
  const orderIds = ordersList.map((o) => o.orderId);
  const items = orderIds.length > 0
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
    : [];

  // Group items by order
  const itemsByOrder = items.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = [];
    }
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-cyan-100 text-cyan-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-orange-100 text-orange-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">View and track your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form className="flex flex-wrap gap-4">
          <select
            name="status"
            defaultValue={status}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No orders found.</p>
            <Link href="/shop" className="text-primary hover:underline mt-2 inline-block">
              Start shopping
            </Link>
          </div>
        ) : (
          ordersList.map((order) => {
            const orderItemsList = itemsByOrder[order.orderId] || [];
            return (
              <div key={order.orderId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/account/orders/${order.orderId}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {orderItemsList.slice(0, 3).map((item) => (
                      <div key={item.orderItemId} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            📦
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    ))}
                    {orderItemsList.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{orderItemsList.length - 3} more item(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  {order.status === "pending" && (
                    <button className="px-4 py-2 text-sm text-red-600 hover:text-red-800">
                      Cancel Order
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <Link
                      href={`/account/orders/${order.orderId}/review`}
                      className="px-4 py-2 text-sm text-primary hover:underline"
                    >
                      Write a Review
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/account/orders?page=${page - 1}${status ? `&status=${status}` : ""}`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/account/orders?page=${page + 1}${status ? `&status=${status}` : ""}`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
