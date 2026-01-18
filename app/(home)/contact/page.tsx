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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-brand font-medium">
                  Contact
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel - Contact Form */}
          <div className="bg-card rounded-lg p-8 shadow-sm border">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Send Message
            </h2>

            <form className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-foreground font-medium"
                  >
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    className="bg-muted border-border focus:border-brand focus:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-foreground font-medium"
                  >
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    className="bg-muted border-border focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground font-medium"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-muted border-border focus:border-brand focus:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-foreground font-medium"
                  >
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-muted border-border focus:border-brand focus:ring-brand"
                  />
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label
                  htmlFor="comments"
                  className="text-foreground font-medium"
                >
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Enter your message"
                  rows={6}
                  className="bg-muted border-border focus:border-brand focus:ring-brand resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox id="saveInfo" className="mt-1" />
                <Label
                  htmlFor="saveInfo"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  Save my name, email, and website in this browser for the next
                  time I comment.
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="bg-brand hover:bg-brand/90 text-primary-foreground font-medium px-8 py-3 rounded-md transition-colors"
              >
                SEND MESSAGE
              </Button>
            </form>
          </div>

          {/* Right Panel - Contact Info */}
          <div className="bg-card rounded-lg p-8 shadow-sm border">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Contact Info
            </h2>

            <div className="space-y-8">
              {/* Office Location */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Office Location
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    873, Islam Nagar Road No. 3, Khulna 9250
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-brand" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Phone Number
                  </h3>
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p>+880 163-0072567</p>
                    {/* <p>+405 - 555 - 0128 - 63</p> */}
                  </div>
                </div>
              </div>

              {/* Mail Address */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-brand" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Mail address
                  </h3>
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p>niyenin.bd@gmail.com</p>
                    {/* <p>example@gmail.com</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-card rounded-lg overflow-hidden shadow-sm border">
          <div className="h-96 bg-muted relative">
            {/* <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4037!2d-83.7613!3d37.1537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA5JzEzLjMiTiA4M8KwNDUnNDAuNyJX!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            /> */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d7354.209359402968!2d89.53868615631734!3d22.835616338535797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s873%2C%20Islam%20Nagar%20Road%20No.%203%2C%20Khulna%209250!5e0!3m2!1sen!2sbd!4v1759072512256!5m2!1sen!2sbd"
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
