import HeroSection from "@/components/Home/Hero/Hero";
import ShopSection from "@/components/Home/Shopsection/ShopSection";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <div className="">
      <Toaster />
      <HeroSection />
      <ShopSection/>
    </div>
  );
}
