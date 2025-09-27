"use client";
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

import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Hero Section */}
      <div className="px-3 py-6">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl p-8 min-h-[600px]"
            style={{
              backgroundImage: `url('/images/background-hero.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand rounded-full"></div>
                <span className="text-brand font-medium">Widescreen 4k</span>
                <div className="w-0 h-0 border-l-4 border-l-brand border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
              </div>

              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                  DIGITAL SLR CAMERA
                  <br />
                  HIGH DEFINITION
                </h1>
                <p className="text-muted-foreground mt-4">
                  Sumptuous, filling, and temptingly healthy
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-brand text-sm">Up</span>
                  <span className="text-brand text-sm">To</span>
                </div>
                <span className="text-brand text-4xl font-bold">70%</span>
                <span className="text-2xl font-bold text-black">$180.99</span>
              </div>

              <Button className="bg-brand hover:bg-brand/90 text-white px-8 py-3 rounded-full">
                SHOP NOW
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Center Camera Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative">
                <Image
                  width={400}
                  height={300}
                  src="/images/camera.png"
                  alt="Canon EOS 77D DSLR Camera"
                  className="w-full max-w-md h-auto transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right Side Products */}
            <div className="lg:col-span-3 space-y-4">
              {/* Security Camera */}
              <Card
                className="p-4 relative border rounded-2xl overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: "url('/images/mobile-bg.jpg')" }}
              >
                <div className="relative z-10">
                  <Badge className="bg-primary text-primary-foreground mb-2">
                    New
                  </Badge>

                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    CLOUD CAM,
                  </h3>
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    SECURITY CAMERA
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary text-xs">Up To</span>
                    <span className="text-primary text-2xl font-bold">70%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white cursor-pointer bg-brand border-brand hover:bg-brand hover:text-primary-foreground transition-colors"
                    >
                      SHOP NOW
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>

                    <Badge className="bg-brand text-white rounded-full">
                      25% offer
                    </Badge>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Image
                      width={320}
                      height={320}
                      src="/images/mobile.png"
                      alt="Security Camera"
                    />
                  </div>
                </div>

                {/* Dark overlay for better text contrast */}
                <div className="absolute inset-0 bg-black/30 rounded-2xl z-0" />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your existing code remains the same... */}
      {/* Trust Badges */}
      <div className="bg-card border-t border-b border-brand/20 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-full">
                <Truck className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-brand">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">
                  Free shipping on all your order
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-full">
                <Headphones className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-brand">
                  Customer Support 24/7
                </h4>
                <p className="text-sm text-muted-foreground">
                  Instant access to Support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-full">
                <Shield className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-brand">
                  100% Secure Payment
                </h4>
                <p className="text-sm text-muted-foreground">
                  We ensure your money is save
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 rounded-full">
                <RotateCcw className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h4 className="font-semibold text-brand">
                  Money-Back Guarantee
                </h4>
                <p className="text-sm text-muted-foreground">
                  30 Days Money-Back Guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Break Disc Deals */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Image
                  width={80}
                  height={80}
                  src="https://sm.pcmag.com/pcmag_au/photo/m/msi-titan-/msi-titan-18-hx_r2s9.jpg"
                  alt="Gaming Laptop"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    BREAK DISC
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-brand text-xs">Up To</span>
                    <span className="text-brand text-2xl font-bold">70%</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-brand p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Headphones */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Image
                  width={80}
                  height={80}
                  src="https://cdn.shopz.com.bd/2020/08/Plextone-PC780-Gaming-Headset-with-Mic-10.jpg"
                  alt="Gaming Headphones"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    BREAK DISC
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-brand text-xs">Up To</span>
                    <span className="text-brand text-2xl font-bold">70%</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-brand p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Image
                  width={80}
                  height={80}
                  src="https://www.livemint.com/lm-img/img/2025/05/22/600x338/best_tablets_1747901932210_1747901939207.jpg"
                  alt="Tablet"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    BREAK DISC
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-brand text-xs">Up To</span>
                    <span className="text-brand text-2xl font-bold">70%</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-brand p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Monitor */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Image
                  width={80}
                  height={80}
                  src="https://www.asus.com/media/Odin/Websites/global/Tab/20240326013834.jpg"
                  alt="Monitor"
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    BREAK DISC
                  </p>
                  <p className="text-xs text-muted-foreground uppercase">
                    DEALS ON THIS
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-brand text-xs">Up To</span>
                    <span className="text-brand text-2xl font-bold">70%</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-brand p-0 h-auto"
                  >
                    Shop Now
                    <div className="ml-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                      <ArrowRight className="h-2 w-2 text-white" />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections - Rest of your existing code... */}
    </div>
  );
}
