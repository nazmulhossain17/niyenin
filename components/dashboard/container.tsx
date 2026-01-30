// ========================================
// File: components/dashboard/container.tsx
// Reusable Dashboard Container Component
// ========================================

"use client";

import React from "react";
import { motion } from "framer-motion";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
}

interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
}

// Main Container - wraps the entire dashboard content
export function DashboardContainer({ children, className = "" }: ContainerProps) {
  return (
    <div className={`lg:ml-72 pt-16 min-h-screen bg-background ${className}`}>
      <div className="p-4 md:p-6 lg:p-8">{children}</div>
    </div>
  );
}

// Page Header
export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// Section wrapper with optional title
export function Section({ title, description, action, children, className = "" }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl border border-border ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// Stats Grid
export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  return <div className={`grid gap-4 ${colClasses[columns]}`}>{children}</div>;
}

// Stat Card
export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor,
  iconBg,
  prefix = "",
  suffix = "",
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={`bg-card rounded-xl border border-border p-5 ${
        onClick ? "cursor-pointer hover:border-primary/30 transition-colors" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                changeType === "positive"
                  ? "text-green-500"
                  : changeType === "negative"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              <span>
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}

// Grid Layout
export function Grid({
  children,
  cols = 2,
  className = "",
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 lg:grid-cols-3",
  };

  return (
    <div className={`grid gap-6 ${colClasses[cols]} ${className}`}>
      {children}
    </div>
  );
}

// Alert Banner
export function AlertBanner({
  type = "warning",
  icon: Icon,
  message,
  action,
}: {
  type?: "warning" | "error" | "success" | "info";
  icon?: React.ElementType;
  message: React.ReactNode;
  action?: React.ReactNode;
}) {
  const styles = {
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
    error: "bg-red-500/10 border-red-500/20 text-red-600",
    success: "bg-green-500/10 border-green-500/20 text-green-600",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-4 rounded-xl border ${styles[type]}`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <p className="flex-1 text-sm">{message}</p>
      {action}
    </motion.div>
  );
}

// Empty State
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Quick Action Card
export function QuickAction({
  icon: Icon,
  label,
  href,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  color: string;
  onClick?: () => void;
}) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="font-medium text-sm flex-1">{label}</span>
      <svg
        className="w-4 h-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

// Table wrapper
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">{children}</table>
    </div>
  );
}

// List Item
export function ListItem({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0";

  if (href) {
    return (
      <a href={href} className={`${className} cursor-pointer`}>
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${className} w-full text-left cursor-pointer`}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}