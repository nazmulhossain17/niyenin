// ========================================
// app/(dashboard)/vendor/products/page.tsx - Vendor Products Page
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { products, vendors, categories } from "@/db/schema";
import { eq, sql, desc, and, ilike, or, lte } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    lowStock?: string;
  }>;
}

export default async function VendorProductsPage({ searchParams }: PageProps) {
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

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = params.status;
  const search = params.search;
  const lowStock = params.lowStock === "true";

  const conditions = [eq(products.vendorId, vendorData.vendorId)];

  if (status) {
    conditions.push(eq(products.status, status as "draft" | "pending_review" | "approved" | "rejected" | "suspended"));
  }

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`)
      )!
    );
  }

  if (lowStock) {
    conditions.push(lte(products.stockQuantity, products.lowStockThreshold));
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const productsList = await db
    .select({
      product: products,
      category: {
        categoryId: categories.categoryId,
        name: categories.name,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.categoryId))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form className="flex flex-wrap gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by name, SKU..."
            defaultValue={search}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            name="status"
            defaultValue={status}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="lowStock"
              value="true"
              defaultChecked={lowStock}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Low Stock Only</span>
          </label>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
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
            {productsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No products found.{" "}
                  <Link href="/vendor/products/new" className="text-primary hover:underline">
                    Add your first product
                  </Link>
                </td>
              </tr>
            ) : (
              productsList.map(({ product, category }) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.mainImage && (
                        <div className="h-12 w-12 relative rounded overflow-hidden bg-gray-100">
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku || "No SKU"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{category?.name || "Uncategorized"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(product.salePrice)}
                    </p>
                    {product.originalPrice !== product.salePrice && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.originalPrice)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p
                      className={`text-sm ${
                        product.stockQuantity <= (product.lowStockThreshold || 5)
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                      }`}
                    >
                      {product.stockQuantity}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        statusColors[product.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Link
                      href={`/vendor/products/${product.productId}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Edit
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
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} products
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/vendor/products?page=${page - 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}${lowStock ? "&lowStock=true" : ""}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/vendor/products?page=${page + 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}${lowStock ? "&lowStock=true" : ""}`}
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
