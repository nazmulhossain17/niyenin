// ========================================
// app/(dashboard)/admin/vendors/page.tsx - Admin Vendors Page
// ========================================

import { db } from "@/db/drizzle";
import { vendors, user } from "@/db/schema";
import { eq, sql, desc, and, ilike, or } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function AdminVendorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = params.status;
  const search = params.search;

  const conditions = [];

  if (status) {
    conditions.push(eq(vendors.status, status as "pending" | "approved" | "rejected" | "suspended"));
  }

  if (search) {
    conditions.push(
      or(
        ilike(vendors.shopName, `%${search}%`),
        ilike(vendors.businessName, `%${search}%`),
        ilike(vendors.businessEmail, `%${search}%`)
      )
    );
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(vendors)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const vendorsList = await db
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(vendors.createdAt))
    .limit(limit)
    .offset(offset);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage vendor applications and accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form className="flex flex-wrap gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by shop name, business name, email..."
            defaultValue={search}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            name="status"
            defaultValue={status}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendorsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendorsList.map(({ vendor, owner }) => (
                <tr key={vendor.vendorId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {vendor.logo ? (
                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-100">
                          <Image
                            src={vendor.logo}
                            alt={vendor.shopName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {vendor.shopName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{vendor.shopName}</p>
                        <p className="text-sm text-gray-500">{vendor.businessEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{owner?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{owner?.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{vendor.totalProducts}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{vendor.totalOrders}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-900">
                        {Number(vendor.averageRating).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">({vendor.totalRatings})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        statusColors[vendor.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/admin/vendors/${vendor.vendorId}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} vendors
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/vendors?page=${page - 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/vendors?page=${page + 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
