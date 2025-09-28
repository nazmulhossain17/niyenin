"use client";
import {
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  Headphones,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <footer className="bg-background border-t border-border text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <motion.div
              className="flex items-center mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {mounted && (
                <Image
                  src={
                    theme === "dark"
                      ? "/images/niyenin-dark.png"
                      : "/images/niyenin-white.png"
                  }
                  alt="NIYENIN Logo"
                  width={240} // bigger than before
                  height={80}
                  className="h-12 w-auto md:h-16"
                  priority
                />
              )}
            </motion.div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Phasellus justo ligula, dictum sit amet tortor eu, iaculis
              tristique turpis. Mauris non orci sed est suscipit tempor ut quis
              felis. Praesent pellentesque
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-6 h-6 text-green-600" />
                <span className="text-green-600 font-semibold text-sm">
                  GOT QUESTION? CALL US 24/7!
                </span>
              </div>
              <p className="text-lg font-bold">+1(213)628-3034</p>
            </div>

            <div className="flex gap-2">
              <Image
                width={150}
                height={50}
                src="/images/google-play.png"
                alt="Get it on Google Play"
                className="h-10 w-auto"
              />
              <Image
                width={150}
                height={50}
                src="/images/ios-store.png"
                alt="Download on App Store"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Find It Fast */}
          <div>
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Find It Fast
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Laptops & Computers",
                "Cameras & Photography",
                "Smart Phones & Tablets",
                "Video Games & Consoles",
                "TV & Audio",
                "Gadgets",
                "Waterproof Headphones",
                "Quick Links",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Customer Care
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "My Account",
                "Track Your Order",
                "Wishlist",
                "Customer Service",
                "Returns/Exchange",
                "FAQ",
                "Product Support",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Selected */}
          <div className="lg:col-span-2">
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Weekly Selected
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  src: "/smart-watch-black.jpg",
                  alt: "Smart Watch",
                  name: "Smart Watch for Men Women",
                  price: "$197",
                },
                {
                  src: "/apple-iphone-14-pro-max.jpg",
                  alt: "iPhone 14 Pro Max",
                  name: "Apple iPhone 14 Pro Max, 256GB",
                  price: "$891",
                },
                {
                  src: "/surface-laptop-touchscreen.jpg",
                  alt: "Surface Laptop",
                  name: "Surface Laptop Touchscreen",
                  price: "$1,510",
                },
                {
                  src: "/bearway-super-console-gaming.jpg",
                  alt: "Bearway Super Console",
                  name: "Bearway Super Console x2",
                  price: "$118",
                },
                {
                  src: "/oneodio-wired-headphones.jpg",
                  alt: "OneOdio Headphones",
                  name: "OneOdio Wired Headphones",
                  price: "$149",
                },
                {
                  src: "/microsoft-surface-pro-9-tablet.jpg",
                  alt: "Surface Pro 9",
                  name: "Microsoft Surface Pro 9 Tablet",
                  price: "$791",
                },
              ].map((item) => (
                <div key={item.alt} className="flex items-center gap-3">
                  <Image
                    width={48}
                    height={48}
                    src={item.src}
                    alt={item.alt}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-primary font-bold">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border bg-muted">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Copyright © 2024,{" "}
              <span className="text-green-600 font-semibold">
                Retail Market
              </span>
              . All Rights Reserved.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <a href="https://www.facebook.com/niyeninbd" target="_blank">
                  <Facebook className="w-6 h-6 text-muted-foreground hover:text-blue-600 cursor-pointer" />
                </a>
                <a href="https://x.com/niyeninbd" target="_blank">
                  <Twitter className="w-6 h-6 text-muted-foreground hover:text-blue-400 cursor-pointer" />
                </a>
                <a href="https://www.youtube.com/@niyeninbd" target="_blank">
                  <Youtube className="w-6 h-6 text-muted-foreground hover:text-red-600 cursor-pointer" />
                </a>
                <a
                  href="https://www.linkedin.com/company/niyeninbd"
                  target="_blank"
                >
                  <Linkedin className="w-6 h-6 text-muted-foreground hover:text-blue-700 cursor-pointer" />
                </a>
                <a href="https://www.instagram.com/niyeninbd" target="_blank">
                  <Instagram className="w-6 h-6 text-muted-foreground hover:text-pink-600 cursor-pointer" />
                </a>
              </div>

              <div className="flex gap-3 ml-7">
                <Image
                  src="/images/american-express.png"
                  alt="American Express"
                  width={40}
                  height={24}
                  className="h-6 w-auto"
                />
                <Image
                  src="/images/master-card.png"
                  alt="Mastercard"
                  width={40}
                  height={24}
                  className="h-6 w-auto"
                />
                <Image
                  src="/images/visa.png"
                  alt="Visa"
                  width={40}
                  height={24}
                  className="h-6 w-auto"
                />
                <Image
                  src="/images/bkash.png"
                  alt="Bikash"
                  width={40}
                  height={24}
                  className="h-6 w-auto"
                />
                <Image
                  src="/images/nogod.png"
                  alt="Nagad"
                  width={40}
                  height={24}
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
