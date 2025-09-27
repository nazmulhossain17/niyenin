"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MapPin, Phone, Mail } from "lucide-react";

function ContactForm() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-green-600 font-medium">
                  Contact
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel - Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Send Message
            </h2>

            <form className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-gray-700 font-medium"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-gray-700 font-medium"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments" className="text-gray-700 font-medium">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Enter your message"
                  rows={6}
                  className="bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox id="saveInfo" className="mt-1" />
                <Label
                  htmlFor="saveInfo"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Save my name, email, and website in this browser for the next
                  time I comment.
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-3 rounded-md transition-colors"
              >
                SEND MESSAGE
              </Button>
            </form>
          </div>

          {/* Right Panel - Contact Info */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Contact Info
            </h2>

            <div className="space-y-8">
              {/* Office Location */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Office Location
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    4517 Washington Ave. Manchester, Kentucky 39495
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Phone Number
                  </h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>+405 - 555 - 0128 - 34</p>
                    <p>+405 - 555 - 0128 - 63</p>
                  </div>
                </div>
              </div>

              {/* Mail Address */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mail address
                  </h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>example@gmail.com</p>
                    <p>example@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="h-96 bg-gray-200 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4037!2d-83.7613!3d37.1537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA5JzEzLjMiTiA4M8KwNDUnNDAuNyJX!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
