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
                <span className="text-primary">Retail</span> Market
              </span>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Phasellus justo ligula, dictum sit amet tortor eu, iaculis
              tristique turpis. Ut non sed est suscipit tempor ut quis felis.
              Praesent pellentesque
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-green-600 font-semibold text-sm">
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
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Find It Fast
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-green-600">
                  Laptops & Computers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Camera & Photography
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Smart Phones & Tablets
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Video Games & Consoles
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  TV & Audio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Sport & Outdoor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Waterproof Headphones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Quick Links
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Customer Care
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-green-600">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Track Your Order
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Wishlist
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Customer Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Returns/Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-600">
                  Product Support
                </a>
              </li>
            </ul>
          </div>

          {/* Weekly Selected */}
          <div className="lg:col-span-2">
            <h3 className="text-green-600 font-bold text-sm mb-4 uppercase">
              Weekly Selected
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/smart-watch-black.jpg"
                  alt="Smart Watch"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    Smart Watch for Men Women
                  </p>
                  <p className="text-green-600 font-bold">$167</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/apple-iphone-14-pro-max.jpg"
                  alt="iPhone 14 Pro Max"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    Apple iPhone 14 Pro Max, 256GB
                  </p>
                  <p className="text-green-600 font-bold">$991</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/surface-laptop-touchscreen.jpg"
                  alt="Surface Laptop"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    Surface Laptop Touchscreen
                  </p>
                  <p className="text-green-600 font-bold">$1,510</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/bearway-super-console-gaming.jpg"
                  alt="Bearway Super Console"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    Bearway Super Console x2
                  </p>
                  <p className="text-green-600 font-bold">$118</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/oneodio-wired-headphones.jpg"
                  alt="OneOdio Headphones"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    OneOdio Wired Headphones
                  </p>
                  <p className="text-green-600 font-bold">$149</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  width={200}
                  height={80}
                  src="/microsoft-surface-pro-9-tablet.jpg"
                  alt="Surface Pro 9"
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    Microsoft Surface Pro 9 Tablet
                  </p>
                  <p className="text-green-600 font-bold">$791</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Copyright © 2024,{" "}
              <span className="text-green-600 font-semibold">
                Retail Market
              </span>
              . All Rights Reserved.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-600 cursor-pointer" />
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
