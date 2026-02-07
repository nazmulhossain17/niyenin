// ========================================
// File: components/Home/Footer/Footer.tsx
// Responsive Footer with Dynamic Data
// ========================================

"use client";

import {
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  Headphones,
  MapPin,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Footer link sections - easily customizable
const footerLinks = {
  categories: {
    title: "Categories",
    links: [
      { label: "Electronics", href: "/shop?category=electronics" },
      { label: "Fashion", href: "/shop?category=fashion" },
      { label: "Home & Living", href: "/shop?category=home-living" },
      { label: "Health & Beauty", href: "/shop?category=health-beauty" },
      { label: "Sports & Outdoor", href: "/shop?category=sports" },
      { label: "Groceries", href: "/shop?category=groceries" },
    ],
  },
  customerCare: {
    title: "Customer Care",
    links: [
      { label: "My Account", href: "/profile" },
      { label: "Track Order", href: "/orders" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Shopping Cart", href: "/cart" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/niyeninbd", label: "Facebook", hoverColor: "hover:text-blue-600" },
  { icon: Twitter, href: "https://x.com/niyeninbd", label: "Twitter", hoverColor: "hover:text-sky-500" },
  { icon: Youtube, href: "https://www.youtube.com/@niyeninbd", label: "YouTube", hoverColor: "hover:text-red-600" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/niyeninbd", label: "LinkedIn", hoverColor: "hover:text-blue-700" },
  { icon: Instagram, href: "https://www.instagram.com/niyeninbd", label: "Instagram", hoverColor: "hover:text-pink-600" },
];

const paymentMethods = [
  { src: "/images/bkash.png", alt: "bKash" },
  { src: "/images/nogod.png", alt: "Nagad" },
  { src: "/images/visa.png", alt: "Visa" },
  { src: "/images/master-card.png", alt: "Mastercard" },
  { src: "/images/american-express.png", alt: "American Express" },
];

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border text-foreground w-full overflow-x-hidden">
      {/* Newsletter Section */}
      <div className="bg-brand/10 border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-muted-foreground">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            <form className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2.5 bg-brand text-white rounded-lg font-medium text-sm hover:bg-brand/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {mounted && (
                <Image
                  src={theme === "dark" ? "/images/niyenin-dark.png" : "/images/niyenin-white.png"}
                  alt="NIYENIN Logo"
                  width={180}
                  height={60}
                  className="h-10 sm:h-12 w-auto"
                  priority
                />
              )}
            </motion.div>
            
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed max-w-sm">
              Your one-stop destination for quality products at affordable prices. 
              We deliver happiness right to your doorstep across Bangladesh.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-xs text-muted-foreground">
                    873, Islam Nagar Road No. 3, Khulna 9250
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a href="tel:+8801630072567" className="text-xs text-muted-foreground hover:text-brand">
                    +880 163-0072567
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a href="mailto:niyenin.bd@gmail.com" className="text-xs text-muted-foreground hover:text-brand">
                    niyenin.bd@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium">Working Hours</p>
                  <p className="text-xs text-muted-foreground">
                    Sat - Thu: 9:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground transition-colors ${social.hoverColor}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
              {footerLinks.categories.title}
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-1">
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
              {footerLinks.customerCare.title}
            </h3>
            <ul className="space-y-2">
              {footerLinks.customerCare.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1">
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
              {footerLinks.company.title}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App Download - Mobile Only */}
            <div className="mt-6 hidden sm:block lg:hidden">
              <p className="text-sm font-medium mb-2">Download Our App</p>
              <div className="flex gap-2">
                <Image
                  width={100}
                  height={32}
                  src="/images/google-play.png"
                  alt="Get it on Google Play"
                  className="h-8 w-auto"
                />
                <Image
                  width={100}
                  height={32}
                  src="/images/ios-store.png"
                  alt="Download on App Store"
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* App Download - Desktop */}
        <div className="hidden lg:flex items-center justify-between mt-8 pt-8 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-10 h-10 text-brand" />
              <div>
                <p className="text-brand font-semibold text-xs uppercase">
                  24/7 Customer Support
                </p>
                <p className="text-xl font-bold">+880 163-0072567</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Download Our App:</p>
            <div className="flex gap-2">
              <Image
                width={120}
                height={40}
                src="/images/google-play.png"
                alt="Get it on Google Play"
                className="h-10 w-auto hover:opacity-80 transition-opacity cursor-pointer"
              />
              <Image
                width={120}
                height={40}
                src="/images/ios-store.png"
                alt="Download on App Store"
                className="h-10 w-auto hover:opacity-80 transition-opacity cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border bg-muted/50">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © {currentYear}{" "}
              <span className="text-brand font-semibold">Niyenin</span>. 
              All Rights Reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                We Accept:
              </span>
              {paymentMethods.map((method) => (
                <div
                  key={method.alt}
                  className="h-6 sm:h-7 px-1.5 bg-background rounded border border-border flex items-center justify-center"
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={32}
                    height={20}
                    className="h-4 sm:h-5 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0 
        }}
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 sm:w-12 sm:h-12 bg-brand text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand/90 transition-colors z-50"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
}