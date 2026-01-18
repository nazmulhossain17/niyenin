// ========================================
// app/(dashboard)/vendor/layout.tsx - Vendor Dashboard Layout
// ========================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default async function VendorLayout({ children }: VendorLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string })?.role;

  if (userRole !== "vendor") {
    redirect("/");
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

  const navigation = [
    { name: "Dashboard", href: "/vendor" },
    { name: "Products", href: "/vendor/products" },
    { name: "Orders", href: "/vendor/orders" },
    { name: "Earnings", href: "/vendor/earnings" },
    { name: "Payouts", href: "/vendor/payouts" },
    { name: "Reviews", href: "/vendor/reviews" },
    { name: "Settings", href: "/vendor/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/vendor" className="text-xl font-bold text-primary">
            Vendor Panel
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
                {vendorData.shopName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {vendorData.shopName}
              </p>
              <p className="text-xs text-gray-500">
                {vendorData.isVerified ? "Verified" : "Not Verified"}
              </p>
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
