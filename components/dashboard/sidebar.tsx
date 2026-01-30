// ========================================
// File: components/dashboard/sidebar.tsx
// Reusable Dashboard Sidebar Component
// ========================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  ChevronLeft,
  LogOut,
  Sun,
  Moon,
  HelpCircle,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  navigationItems: NavItem[];
  logo: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    href: string;
  };
  user?: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
  backLink?: {
    label: string;
    href: string;
  };
  helpCard?: {
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
  };
  onSignOut?: () => void;
}

export function DashboardSidebar({
  navigationItems,
  logo,
  user,
  backLink,
  helpCard,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-expand active parent
  useEffect(() => {
    navigationItems.forEach((item) => {
      if (item.children?.some((child) => child.href === pathname)) {
        setExpandedItems((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, [pathname, navigationItems]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut();
    } else {
      await authClient.signOut();
      window.location.href = "/sign-in";
    }
  };

  const LogoIcon = logo.icon;

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive =
      item.href === pathname ||
      item.children?.some((child) => child.href === pathname);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4"
              >
                {item.children?.map((child, idx) => (
                  <Link
                    key={idx}
                    href={child.href || "#"}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      pathname === child.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                    {child.badge !== undefined && child.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium text-white bg-primary rounded-full">
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
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium text-white bg-primary rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href={logo.href} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LogoIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="font-bold text-lg">{logo.title}</span>
              {logo.subtitle && (
                <span className="text-xs text-muted-foreground block">
                  {logo.subtitle}
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map((item, idx) => (
              <NavItemComponent key={idx} item={item} />
            ))}
          </nav>

          {/* Help Card */}
          {helpCard && (
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <HelpCircle className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium">{helpCard.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {helpCard.description}
              </p>
              <Link
                href={helpCard.linkHref}
                className="inline-block mt-3 text-sm text-primary hover:underline"
              >
                {helpCard.linkText} →
              </Link>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            {backLink && (
              <Link
                href={backLink.href}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                {backLink.label}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0) || "U"
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <p className="font-medium">{user.name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        {user.role && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                            {user.role}
                          </span>
                        )}
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
            )}
          </div>
        </div>
      </header>
    </>
  );
}