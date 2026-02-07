// ========================================
// File: app/admin/layout.tsx
// Admin Dashboard Layout with Sidebar
// This is a NESTED layout - html/body tags are in root layout
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  Ticket,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  User,
  Layers,
  ImageIcon,
  FileText,
  HelpCircle,
  Shield,
  CreditCard,
  Truck,
  Gift,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BadgePercent,
} from "lucide-react";
import { authClient, type User as AuthUser, type UserRole } from "@/lib/auth-client";

// Types
interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: number | string;
  badgeColor?: string;
  children?: NavItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Navigation configuration
const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/vendor",
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/vendor/orders",
    badge: 12,
    badgeColor: "bg-blue-500",
  },
  {
    icon: Package,
    label: "Products",
    children: [
      { icon: Package, label: "All Products", href: "/vendor/products" },
      { icon: AlertTriangle, label: "Pending Review", href: "/vendor/products/pending", badge: 5 },
    ],
  },
  {
    icon: Store,
    label: "Vendors",
    children: [
      { icon: Store, label: "All Vendors", href: "/vendor/vendors" },
      { icon: AlertTriangle, label: "Pending Approval", href: "/vendor/vendors/pending", badge: 3 },
      { icon: CreditCard, label: "Payouts", href: "/vendor/vendors/payouts" },
      { icon: TrendingUp, label: "Commissions", href: "/vendor/vendors/commissions" },
    ],
  },
  {
    icon: Users,
    label: "Customers",
    href: "/vendor/customers",
  },
  {
    icon: BadgePercent,
    label: "Marketing",
    children: [
      { icon: Gift, label: "Coupons", href: "/vendor/coupons" },
      { icon: ImageIcon, label: "Banners", href: "/vendor/banners" },
      { icon: Tag, label: "Flash Deals", href: "/vendor/flash-deals" },
    ],
  },
  {
    icon: Ticket,
    label: "Support",
    children: [
      { icon: Ticket, label: "Tickets", href: "/vendor/tickets", badge: 8, badgeColor: "bg-orange-500" },
      { icon: MessageSquare, label: "Disputes", href: "/vendor/disputes", badge: 2, badgeColor: "bg-red-500" },
      { icon: HelpCircle, label: "FAQs", href: "/vendor/faqs" },
    ],
  },
  {
    icon: Truck,
    label: "Shipping",
    children: [
      { icon: Truck, label: "Zones", href: "/vendor/shipping/zones" },
      { icon: DollarSign, label: "Rates", href: "/vendor/shipping/rates" },
    ],
  },
  {
    icon: BarChart3,
    label: "Reports",
    children: [
      { icon: TrendingUp, label: "Sales Report", href: "/vendor/reports/sales" },
      { icon: Package, label: "Product Report", href: "/vendor/reports/products" },
      { icon: Users, label: "Customer Report", href: "/vendor/reports/customers" },
      { icon: Store, label: "Vendor Report", href: "/vendor/reports/vendors" },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    children: [
      { icon: Settings, label: "General", href: "/vendor/settings" },
      { icon: CreditCard, label: "Payments", href: "/vendor/settings/payments" },
      { icon: Shield, label: "Roles & Permissions", href: "/vendor/settings/roles" },
      { icon: FileText, label: "Audit Logs", href: "/vendor/settings/audit-logs" },
    ],
  },
];

// Sidebar Nav Item Component
const NavItemComponent = ({
  item,
  isCollapsed,
  pathname,
  expandedItems,
  toggleExpand,
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
  expandedItems: string[];
  toggleExpand: (label: string) => void;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.label);
  const isActive = item.href === pathname || item.children?.some((child) => child.href === pathname);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => toggleExpand(item.label)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3"
            >
              {item.children?.map((child, idx) => (
                <Link
                  key={idx}
                  href={child.href || "#"}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    pathname === child.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                  </div>
                  {child.badge && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${
                        child.badgeColor || "bg-primary"
                      }`}
                    >
                      {child.badge}
                    </span>
                  )}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
        {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
      </div>
      {!isCollapsed && item.badge && (
        <span
          className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${
            item.badgeColor || "bg-primary"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};

// Main Admin Layout
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          router.push("/sign-in?callbackUrl=/vendor");
          return;
        }
        const role = (session.user as { role?: UserRole }).role;
        if (role !== "vendor") {
          router.push("/");
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-expand active parent
  useEffect(() => {
    navigationItems.forEach((item) => {
      if (item.children?.some((child) => child.href === pathname)) {
        setExpandedItems((prev) => (prev.includes(item.label) ? prev : [...prev, item.label]));
      }
    });
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: "New order received", message: "Order #12345 from John Doe", time: "2 min ago", unread: true },
    { id: 2, title: "Vendor application", message: "New vendor application pending", time: "15 min ago", unread: true },
    { id: 3, title: "Product review", message: "5 products pending review", time: "1 hour ago", unread: false },
    { id: 4, title: "Support ticket", message: "New ticket from customer", time: "2 hours ago", unread: false },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ${
          sidebarCollapsed ? "w-[70px]" : "w-[260px]"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              {mounted && (
                <Image
                  src={theme === "dark" ? "/images/niyenin-dark.png" : "/images/niyenin-white.png"}
                  alt="Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              )}
            </Link>
          )}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setSidebarCollapsed(!sidebarCollapsed);
              } else {
                setMobileSidebarOpen(false);
              }
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <X className="w-5 h-5 lg:hidden" />
                <Menu className="w-5 h-5 hidden lg:block" />
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-3 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            {navigationItems.map((item, idx) => (
              <NavItemComponent
                key={idx}
                item={item}
                isCollapsed={sidebarCollapsed}
                pathname={pathname}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
              />
            ))}
          </nav>

          {/* Logout at bottom */}
          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium text-sm">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[260px]"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-muted lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none flex-1"
                />
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border hover:bg-muted transition-colors cursor-pointer ${
                              notification.unread ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {notification.unread && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                              )}
                              <div className={notification.unread ? "" : "ml-5"}>
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-border">
                        <Link
                          href="/admin/notifications"
                          className="block text-center text-sm text-primary hover:underline"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-brand flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">
                      {(user as { role?: string })?.role || "admin"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/admin/profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile</span>
                        </Link>
                        <Link
                          href="/admin/settings"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
}