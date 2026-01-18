// ========================================
// app/(dashboard)/admin/layout.tsx - Admin Dashboard Layout
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string })?.role;
  const allowedRoles = ["super_admin", "admin", "moderator"];

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/");
  }

  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin" || isSuperAdmin;

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "dashboard" },
    { name: "Orders", href: "/admin/orders", icon: "orders" },
    { name: "Products", href: "/admin/products", icon: "products" },
    { name: "Categories", href: "/admin/categories", icon: "categories" },
    { name: "Brands", href: "/admin/brands", icon: "brands" },
    ...(isAdmin
      ? [
          { name: "Vendors", href: "/admin/vendors", icon: "vendors" },
          { name: "Users", href: "/admin/users", icon: "users" },
          { name: "Coupons", href: "/admin/coupons", icon: "coupons" },
          { name: "Banners", href: "/admin/banners", icon: "banners" },
        ]
      : []),
    { name: "Support", href: "/admin/support", icon: "support" },
    ...(isAdmin
      ? [
          { name: "Disputes", href: "/admin/disputes", icon: "disputes" },
          { name: "Reports", href: "/admin/reports", icon: "reports" },
        ]
      : []),
    ...(isSuperAdmin
      ? [{ name: "Settings", href: "/admin/settings", icon: "settings" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/admin" className="text-xl font-bold text-primary">
            Admin Panel
          </Link>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {session.user.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userRole?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}
