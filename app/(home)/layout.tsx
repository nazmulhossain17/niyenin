// ========================================
// File: app/layout.tsx
// Root Layout - Fixed Mobile Overflow
// ========================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Home/Navbar/Navbar";
import Footer from "@/components/Home/Footer/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/utils/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/utils/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Niyenin - Your Trusted Online Marketplace",
  description: "Shop quality products at affordable prices. Fast delivery across Bangladesh.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Providers>
              <Header />
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </Providers>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}