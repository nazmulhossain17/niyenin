import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Users, Wrench, Shield, Heart } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-400 mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-primary hover:text-foreground"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-brand font-medium">
                About Us
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="order-2 lg:order-1">
            <Image
              width={800}
              height={600}
              src="https://thumbs.dreamstime.com/b/group-business-people-gathered-meeting-room-discussing-sharing-ideas-around-large-conference-table-392505079.jpg"
              alt="Business meeting"
              className="w-full h-100 object-cover rounded-lg"
            />
          </div>
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-6 text-balance">
              More Than 25+ Years We Provide True News
            </h1>
            <p className="text-primary mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos
              sequi, amet voluptatum cupiditate culpa numquam quos hic neque
              dolores officiis, iure voluptas aliquam sed explicabo dolor maxime
              itaque saepe, a quam quisquam consequatur fuga. Sed sapiente at
              quam dolore culpa! Repudiandae, laudantium? Temporibus iusto.
            </p>
            <ul className="space-y-2 text-popover-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Research beyond the business plan
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Marketing options and rates
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                The ability to turnaround consulting
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Customer engagement matters
              </li>
            </ul>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Some of our achievements
          </h2>
          <p className="text-primary max-w-3xl mx-auto mb-12 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos sequi,
            amet voluptatum cupiditate culpa numquam quos hic neque dolores
            officiis, iure voluptas aliquam sed explicabo dolor maxime itaque
            saepe, a quam quisquam consequatur.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">05+</div>
              <div className="text-primary text-sm">Years Service</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-brand" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">100+</div>
              <div className="text-primary text-sm">Expert Technicians</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">90%</div>
              <div className="text-primary text-sm">Devices Fixed</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-brand" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">800+</div>
              <div className="text-primary text-sm">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* CEO Message Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Message from the CEO
            </h2>
            <p className="text-primary mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos
              sequi, amet voluptatum cupiditate culpa numquam quos hic neque
              dolores officiis, iure voluptas aliquam sed explicabo dolor maxime
              itaque saepe, a quam quisquam consequatur fuga. Sed sapiente at
              quam dolore culpa! Repudiandae, laudantium? Temporibus iusto.
            </p>
            <ul className="space-y-2 text-primary mb-8">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Research beyond the business plan
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Marketing options and rates
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                The ability to turnaround consulting
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
                Customer engagement matters
              </li>
            </ul>
            <div>
              <div className="text-2xl font-script text-primary mb-1">
                Dominic Toretto
              </div>
              <div className="text-primary text-sm">CEO & Founder</div>
            </div>
          </div>
          <div>
            <Image
              width={800}
              height={600}
              src="https://static.vecteezy.com/system/resources/previews/047/784/321/non_2x/a-team-of-six-people-sits-around-a-conference-table-in-a-modern-office-discussing-business-during-the-day-free-vector.jpg"
              alt="CEO Dominic Toretto"
              className="w-full h-125 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Team Members Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            About team members
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos sequi,
            amet voluptatum cupiditate culpa numquam quos hic neque dolores
            officiis, iure voluptas aliquam sed explicabo dolor maxime itaque
            saepe, a quam quisquam consequatur fuga. Sed sapiente at quam dolore
            culpa! Repudiandae, laudantium? Temporibus iusto.
          </p>
          <ul className="space-y-2 text-primary max-w-md mx-auto text-left">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
              Research beyond the business plan
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
              Marketing options and rates
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
              The ability to turnaround consulting
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-brand rounded-full mr-3"></span>
              Customer engagement matters
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
