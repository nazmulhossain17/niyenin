import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Truck,
  Headphones,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import canon from "../../assets/canon.jpg";
import modernsmartphonewithcolorfuldisplaymob from "../../assets/modern-smartphone-with-colorful-display-screen-mob.jpg";

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Hero Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  Widescreen 4k
                </span>
                <div className="w-0 h-0 border-l-4 border-l-green-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
              </div>

              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  DIGITAL SLR CAMERA
                  <br />
                  HIGH DEFINATION
                </h1>
                <p className="text-gray-600 mt-4">
                  Sumptuous, filling, and temptingly healthy
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-green-600 text-sm">Up</span>
                  <span className="text-green-600 text-sm">To</span>
                </div>
                <span className="text-green-600 text-4xl font-bold">70%</span>
                <span className="text-2xl font-bold text-gray-900">
                  $180.99
                </span>
              </div>

              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full">
                SHOP NOW
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Center Camera Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative">
                <img
                  src={canon}
                  alt="Canon EOS 77D DSLR Camera"
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>

            {/* Right Side Products */}
            <div className="lg:col-span-3 space-y-4">
              {/* Security Camera */}
              <Card
                className="p-4 bg-white relative bg-cover bg-right text-gray-900"
                style={{
                  backgroundImage: `url(${modernsmartphonewithcolorfuldisplaymob})`,
                }}
              >
                <div className="absolute inset-0 bg-white/80 rounded-2xl"></div>{" "}
                {/* overlay */}
                <div className="relative z-10">
                  <Badge className="bg-green-500 text-white mb-2">New</Badge>
                  <h3 className="font-semibold text-sm mb-1">CLOUD CAM,</h3>
                  <h3 className="font-semibold text-sm mb-2">
                    SECURITY CAMERA
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-xs">Up To</span>
                    <span className="text-green-600 text-2xl font-bold">
                      70%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 bg-transparent"
                    >
                      SHOP NOW
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                    <Badge className="bg-green-500 text-white rounded-full">
                      25% offer
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Phone */}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-t border-b border-green-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-600">Free Shipping</h4>
                <p className="text-sm text-gray-600">
                  Free shipping on all your order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Headphones className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-600">
                  Customer Support 24/7
                </h4>
                <p className="text-sm text-gray-600">
                  Instant access to Support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-600">
                  100% Secure Payment
                </h4>
                <p className="text-sm text-gray-600">
                  We ensure your money is save
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <RotateCcw className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-600">
                  Money-Back Guarantee
                </h4>
                <p className="text-sm text-gray-600">
                  30 Days Money-Back Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Break Disc Deals */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <img
                  src="/gaming-laptop-computer-with-rgb-keyboard.jpg"
                  alt="Gaming Laptop"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase">BREAK DISC</p>
                  <p className="text-xs text-gray-500 uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 text-xs">Up To</span>
                    <span className="text-green-600 text-2xl font-bold">
                      70%
                    </span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Headphones */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <img
                  src="/blue-gaming-headphones-with-microphone.jpg"
                  alt="Gaming Headphones"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase">BREAK DISC</p>
                  <p className="text-xs text-gray-500 uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 text-xs">Up To</span>
                    <span className="text-green-600 text-2xl font-bold">
                      70%
                    </span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <img
                  src="/modern-tablet-with-colorful-screen-display.jpg"
                  alt="Tablet"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase">BREAK DISC</p>
                  <p className="text-xs text-gray-500 uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 text-xs">Up To</span>
                    <span className="text-green-600 text-2xl font-bold">
                      70%
                    </span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Monitor */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <img
                  src="/computer-monitor-display-screen.jpg"
                  alt="Monitor"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-500 uppercase">BREAK DISC</p>
                  <p className="text-xs text-gray-500 uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 text-xs">Up To</span>
                    <span className="text-green-600 text-2xl font-bold">
                      70%
                    </span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Gaming Accessories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Gaming Accessories</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src="/gaming-headphones-black.jpg"
                    alt="Headsets"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Headsets</p>
                </div>
                <div className="text-center">
                  <img
                    src="/mechanical-gaming-keyboard-rgb.jpg"
                    alt="Keyboards"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Keyboards</p>
                </div>
                <div className="text-center">
                  <img
                    src="/black-gaming-mouse.png"
                    alt="Keyboards"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Keyboards</p>
                </div>
                <div className="text-center">
                  <img
                    src="/gaming-chair-black.jpg"
                    alt="Chairs"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Chairs</p>
                </div>
              </div>
              <Button variant="link" className="text-green-600 mt-4">
                See more
              </Button>
            </div>

            {/* Shop Deals in Fashion */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Shop Deals in Fashion
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <img
                    src="/fashion-tops-under-25-dollars.jpg"
                    alt="Tops under $25"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-sm">Tops under $25</p>
                </div>
                <div className="text-center">
                  <img
                    src="/jeans-under-50-dollars.jpg"
                    alt="Jeans under $50"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-sm">Jeans under $50</p>
                </div>
                <div className="text-center">
                  <img
                    src="/dresses-under-30-dollars.jpg"
                    alt="Dresses under $30"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-sm">Dresses under $30</p>
                </div>
                <div className="text-center">
                  <img
                    src="/shoes-under-50-dollars.jpg"
                    alt="Shoes under $50"
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-sm">Shoes under $50</p>
                </div>
              </div>
              <Button variant="link" className="text-green-600 mt-4">
                See more
              </Button>
            </div>

            {/* Launched in the last 30 days */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Launched in the last 30 days
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src="/new-headsets-product-launch.jpg"
                    alt="Headsets"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Headsets</p>
                </div>
                <div className="text-center">
                  <img
                    src="/smartwatch-new-product.jpg"
                    alt="Watch"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Watch</p>
                </div>
                <div className="text-center">
                  <img
                    src="/chains-jewelry-new.jpg"
                    alt="Chains"
                    className="w-20 h-20 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm">Chains</p>
                </div>
              </div>
              <Button variant="link" className="text-green-600 mt-4">
                See more
              </Button>
            </div>

            {/* Best Selling Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Best Selling Products
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get discounts on popular items
              </p>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <img
                    src="/placeholder.svg?height=120&width=120"
                    alt="Wireless Earbuds"
                    className="w-30 h-30 mx-auto mb-2 rounded"
                  />
                  <p className="text-sm font-medium">Get 25% Discount</p>
                </div>
              </div>
              <Button variant="link" className="text-green-600 mt-4">
                See more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
