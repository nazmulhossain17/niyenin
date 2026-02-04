// ========================================
// File: app/layout.tsx
// Root Layout - This MUST have html and body tags
// ========================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import AdminLayout from "./vendor-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NIYENIN - Multi-Vendor E-Commerce",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <AdminLayout>
                {children}
            </AdminLayout>
          
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}