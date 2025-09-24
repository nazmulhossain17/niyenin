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
} from "lucide-react";

const Header = () => {
  const [toggled, setToggled] = useState(false);

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Deliver to</span>
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-900 font-medium">China</span>
            </div>

            <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Friday - Jul 22, 2024
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">retailmarket@gmail.com</span>
            </div>

            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">+1(213)628-3034</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-gray-600">Eng</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-gray-600">USD</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2">
              <Facebook className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-700" />
              <Twitter className="w-4 h-4 text-blue-400 cursor-pointer hover:text-blue-500" />
              <Youtube className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-700" />
              <Linkedin className="w-4 h-4 text-blue-700 cursor-pointer hover:text-blue-800" />
              <Instagram className="w-4 h-4 text-pink-600 cursor-pointer hover:text-pink-700" />
            </div>

            {/* Toggle Button (fixed direction) */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">
                <span className="text-green-500 italic">Retail</span>
                <span className="text-gray-800"> Market</span>
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
              <div className="w-8 h-8 flex items-center justify-center">
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 24 22"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <path
                    fill="currentColor"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 
                       2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 
                       3.41.81 4.5 2.09C13.09 3.81 
                       14.76 3 16.5 3 19.58 3 22 
                       5.42 22 8.5c0 3.78-3.4 6.86-8.55 
                       11.54L12 21.35z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                2
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <div className="w-8 h-8 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-500 hover:text-green-600 transition-colors" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  2
                </div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500 text-xs">Shopping cart:</div>
                <div className="text-purple-600 font-semibold">$57.00</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToggled((s) => !s)}
              role="switch"
              aria-checked={toggled}
              aria-label="Toggle"
              className={`relative w-12 h-6 rounded-full cursor-pointer focus:outline-none transition-colors ${
                toggled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {/* knob */}
              {/* track has padding implicitly via positioning; knob uses pixel animation so direction is stable */}
              <motion.div
                initial={false}
                animate={{ x: toggled ? 24 : 0 }} // 24px moves knob to the right end (w-12 track, 4px padding left/right -> 24px)
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <motion.div
        className="bg-white border-t border-gray-200 px-4 py-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Browse */}
          <motion.button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Menu className="w-4 h-4" />
            <span>Browse Category</span>
          </motion.button>

          {/* Nav Menu */}
          <nav className="flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Shop
            </a>
            <div className="flex items-center space-x-1 text-gray-700 hover:text-green-600 cursor-pointer">
              <span className="font-medium">Pages</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1 text-gray-700 hover:text-green-600 cursor-pointer">
              <span className="font-medium">Blog</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <a
              href="#"
              className="text-gray-700 hover:text-green-600 font-medium flex items-center"
            >
              About Us
              <ShoppingCart className="w-4 h-4 ml-1" />
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              Contact
            </a>
          </nav>

          {/* Search + Login */}
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer hover:scale-105 transition-transform">
              <Search className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>

            <motion.button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login / Sign Up
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;
