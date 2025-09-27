"use client";
import { Facebook, Twitter, Youtube, Linkedin, Instagram } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-background rounded-sm flex items-center justify-center">
                  <div className="w-4 h-2 bg-primary rounded-sm"></div>
                </div>
              </div>
              <span className="text-xl font-bold">
                <span className="text-brand">NIYE</span> NIN
              </span>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Phasellus justo ligula, dictum sit amet tortor eu, iaculis
              tristique turpis. Ut non sed est suscipit tempor ut quis felis.
              Praesent pellentesque
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-accent rounded-full">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
                <span className="text-primary font-semibold text-sm">
                  GOT QUESTION? CALL US 24/7!
                </span>
              </div>
              <p className="text-lg font-bold">+1(213)628-3034</p>
            </div>

            <div className="flex gap-2">
              <Image
                width={200}
                height={80}
                src="/google-play-store-badge.png"
                alt="Get it on Google Play"
                className="h-10"
              />
              <Image
                width={200}
                height={80}
                src="/app-store-badge.png"
                alt="Download on App Store"
                className="h-10"
              />
            </div>
          </div>

          {/* Find It Fast */}
          <div>
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
              Find It Fast
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Laptops & Computers",
                "Camera & Photography",
                "Smart Phones & Tablets",
                "Video Games & Consoles",
                "TV & Audio",
                "Sport & Outdoor",
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
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
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
            <h3 className="text-brand font-bold text-sm mb-4 uppercase">
              Weekly Selected
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  src: "/smart-watch-black.jpg",
                  alt: "Smart Watch",
                  name: "Smart Watch for Men Women",
                  price: "$167",
                },
                {
                  src: "/apple-iphone-14-pro-max.jpg",
                  alt: "iPhone 14 Pro Max",
                  name: "Apple iPhone 14 Pro Max, 256GB",
                  price: "$991",
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
                    width={200}
                    height={80}
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Copyright © 2024,{" "}
              <span className="text-primary font-semibold">Retail Market</span>.
              All Rights Reserved.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Facebook className="w-5 h-5 text-muted-foreground hover:text-blue-600 cursor-pointer" />
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-blue-400 cursor-pointer" />
                <Youtube className="w-5 h-5 text-muted-foreground hover:text-red-600 cursor-pointer" />
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-blue-700 cursor-pointer" />
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-pink-600 cursor-pointer" />
              </div>

              <div className="flex gap-2 ml-4">
                <Image
                  width={200}
                  height={80}
                  src="/mastercard-logo.png"
                  alt="Mastercard"
                  className="h-6"
                />
                <Image
                  width={200}
                  height={80}
                  src="/american-express-logo.png"
                  alt="American Express"
                  className="h-6"
                />
                <Image
                  width={200}
                  height={80}
                  src="/visa-logo-generic.png"
                  alt="Visa"
                  className="h-6"
                />
                <Image
                  width={200}
                  height={80}
                  src="/abstract-discover-logo.png"
                  alt="Discover"
                  className="h-6"
                />
                <Image
                  width={200}
                  height={80}
                  src="/paypal-logo.png"
                  alt="PayPal"
                  className="h-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
