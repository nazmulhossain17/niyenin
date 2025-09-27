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
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-background border-b border-border px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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

          {/* Right side */}
          <div className="flex items-center space-x-6">
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

            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Eng</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">USD</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2 text-muted-foreground">
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
          {/* Logo */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold">
                <span className="text-green-500 italic">NIYE</span>
                <span className="text-primary">NIN</span>
              </div>
            </div>
          </motion.div>

          {/* Right side icons */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Heart */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform">
              <div className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive">
                ❤
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                2
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary-foreground transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  2
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground text-xs">
                  Shopping cart:
                </div>
                <div className="text-primary font-semibold">$57.00</div>
              </div>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Toggle dark mode"
              className={`relative w-12 h-6 rounded-full cursor-pointer focus:outline-none transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              {/* Theme icons */}
              <div className="absolute inset-0 flex items-center justify-between px-1">
                <Sun className="w-3 h-3 text-yellow-500" />
                <Moon className="w-3 h-3 text-blue-300" />
              </div>

              {/* Knob */}
              {mounted && (
                <motion.div
                  initial={false}
                  animate={{ x: theme === "dark" ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="absolute top-1 left-1 w-4 h-4 bg-card rounded-full shadow z-10"
                />
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <motion.div
        className="bg-card border-t border-border px-4 py-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Browse */}
          <motion.button
            className="bg-green-600 hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Menu className="w-4 h-4" />
            <span>Browse Category</span>
          </motion.button>

          {/* Nav Menu */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary font-medium"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-foreground hover:text-primary font-medium"
            >
              Shop
            </Link>
            <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
              <span className="font-medium">Pages</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
              <span className="font-medium">Blog</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link
              href="/about-us"
              className="text-foreground hover:text-primary font-medium flex items-center"
            >
              About Us
              <ShoppingCart className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/contact"
              className="text-foreground hover:text-primary font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Search + Login */}
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer hover:scale-105 transition-transform text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </div>
            <Link href="/account">
              <motion.button
                className="bg-green-600 hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded font-medium transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login / Sign Up
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Header;
