"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  ShoppingCart,
  Menu,
  Search,
  Sun,
  Moon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="w-full">
      {/* Top Bar - Hidden on mobile, visible on tablet+ */}
      <div className="bg-background border-b border-border px-4 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          {/* Left side - Hidden on tablet, visible on desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-brand rounded-full"></div>
              <span className="text-muted-foreground">Deliver to</span>
              <MapPin className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">China</span>
            </div>

            <div className="flex items-center space-x-1 bg-muted px-2 py-1 rounded">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">
                Friday - Jul 22, 2024
              </span>
            </div>
          </div>

          {/* Right side - Responsive layout */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Contact info - Hidden on tablet, visible on desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  retailmarket@gmail.com
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+1(213)628-3034</span>
              </div>
            </div>

            {/* Language and Currency - Always visible on tablet+ */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Eng</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">USD</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Social Icons - Hidden on tablet, visible on desktop */}
            <div className="hidden lg:flex items-center space-x-2 text-muted-foreground">
              <Facebook className="w-4 h-4 hover:text-primary cursor-pointer" />
              <Twitter className="w-4 h-4 hover:text-primary cursor-pointer" />
              <Youtube className="w-4 h-4 hover:text-destructive cursor-pointer" />
              <Linkedin className="w-4 h-4 hover:text-primary cursor-pointer" />
              <Instagram className="w-4 h-4 hover:text-accent cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-card px-4 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-foreground hover:text-primary"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div className="text-xl md:text-2xl font-bold">
                <span className="text-brand italic">NIYE</span>
                <span className="text-primary">NIN</span>
              </div>
            </div>
          </motion.div>

          {/* Right side icons */}
          <motion.div
            className="flex items-center space-x-2 md:space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Search - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block cursor-pointer hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </div>

            {/* Heart - Always visible */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-muted-foreground hover:text-destructive">
                ❤
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                2
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-primary hover:text-primary-foreground transition-colors">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  2
                </div>
              </div>
              {/* Cart text - Hidden on mobile, visible on tablet+ */}
              <div className="hidden md:block text-sm">
                <div className="text-muted-foreground text-xs">
                  Shopping cart:
                </div>
                <div className="text-primary font-semibold">$57.00</div>
              </div>
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "dark"}
                aria-label="Toggle dark mode"
                className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full cursor-pointer focus:outline-none transition-colors ${
                  theme === "dark" ? "bg-primary" : "bg-muted"
                }`}
              >
                {/* Theme icons */}
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  <Sun className="w-2 h-2 md:w-3 md:h-3 text-yellow-500" />
                  <Moon className="w-2 h-2 md:w-3 md:h-3 text-blue-300" />
                </div>

                {/* Knob */}
                <motion.div
                  initial={false}
                  animate={{
                    x:
                      theme === "dark"
                        ? window.innerWidth >= 768
                          ? 24
                          : 20
                        : 0,
                  }}
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="absolute top-0.5 left-0.5 md:top-1 md:left-1 w-3 h-3 md:w-4 md:h-4 bg-card rounded-full shadow z-10"
                />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <motion.div
        className="hidden md:block bg-card border-t border-border px-4 py-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Browse */}
          <motion.button
            className="bg-brand hover:bg-primary/90 text-white px-3 py-2 md:px-4 rounded-lg flex items-center space-x-2 font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Menu className="w-4 h-4" />
            <span className="hidden lg:inline">Browse Category</span>
            <span className="lg:hidden">Browse</span>
          </motion.button>

          {/* Nav Menu - Responsive spacing */}
          <nav className="flex items-center space-x-4 lg:space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary font-medium text-sm"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-foreground hover:text-primary font-medium text-sm"
            >
              Shop
            </Link>
            <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
              <span className="font-medium text-sm">Pages</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
              <span className="font-medium text-sm">Blog</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link
              href="/about-us"
              className="hidden lg:flex text-foreground hover:text-primary font-medium items-center text-sm"
            >
              About Us
              <ShoppingCart className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:text-primary font-medium text-sm"
            >
              Contact
            </Link>
          </nav>

          {/* Search + Login - Hidden search on tablet, always show login */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block cursor-pointer hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </div>
            <Link href="/account">
              <motion.button
                className="bg-brand cursor-pointer text-white px-3 py-2 md:px-4 rounded font-medium transition-colors text-xs md:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden md:inline">Login / Sign Up</span>
                <span className="md:hidden">Login</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Mobile Navigation Menu */}
      <motion.div
        className={`md:hidden bg-card border-t border-border ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-4 space-y-4">
          {/* Search bar for mobile */}
          <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {/* Browse Category */}
          <motion.button
            className="w-full bg-brand hover:bg-primary/90 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Menu className="w-4 h-4" />
            <span>Browse Category</span>
          </motion.button>

          {/* Navigation Links */}
          <nav className="space-y-3">
            <Link
              href="/"
              className="block text-foreground hover:text-primary font-medium py-2 border-b border-border"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block text-foreground hover:text-primary font-medium py-2 border-b border-border"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <div className="flex items-center justify-between text-foreground hover:text-primary cursor-pointer py-2 border-b border-border">
              <span className="font-medium">Pages</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between text-foreground hover:text-primary cursor-pointer py-2 border-b border-border">
              <span className="font-medium">Blog</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link
              href="/about-us"
              className="block text-foreground hover:text-primary font-medium py-2 border-b border-border"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block text-foreground hover:text-primary font-medium py-2 border-b border-border"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>

          {/* Login Button */}
          <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.button
              className="w-full bg-brand text-white px-4 py-3 rounded font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login / Sign Up
            </motion.button>
          </Link>

          {/* Contact Info for Mobile */}
          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>retailmarket@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>+1(213)628-3034</span>
            </div>
          </div>

          {/* Social Icons for Mobile */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-border text-muted-foreground">
            <Facebook className="w-5 h-5 hover:text-primary cursor-pointer" />
            <Twitter className="w-5 h-5 hover:text-primary cursor-pointer" />
            <Youtube className="w-5 h-5 hover:text-destructive cursor-pointer" />
            <Linkedin className="w-5 h-5 hover:text-primary cursor-pointer" />
            <Instagram className="w-5 h-5 hover:text-accent cursor-pointer" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;
