"use client";
import { useState } from "react";
import { motion, type Transition } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  drivingLicense?: string;
  phoneNumber: string;
  referralFullName: string;
  referralEmail: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  drivingLicense?: string;
  phoneNumber?: string;
  referralFullName?: string;
  referralEmail?: string;
}

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    drivingLicense: "",
    phoneNumber: "",
    referralFullName: "",
    referralEmail: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      } as Transition,
    },
  };

  const validateForm = (): boolean => {
    console.log("🔍 Starting form validation...");
    console.log("📋 Current form data:", formData);

    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      console.log("❌ Full name validation failed");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
      console.log("❌ Full name too short");
    } else {
      console.log("✅ Full name validation passed");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      console.log("❌ Email validation failed - empty");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      console.log("❌ Email validation failed - invalid format");
    } else {
      console.log("✅ Email validation passed");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      console.log("❌ Password validation failed - empty");
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      console.log("❌ Password validation failed - too short");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
      console.log("❌ Password validation failed - complexity requirements");
    } else {
      console.log("✅ Password validation passed");
    }

    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      console.log("❌ Phone number validation failed - empty");
    } else if (
      !phoneRegex.test(formData.phoneNumber.replace(/[\s\-()]/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      console.log("❌ Phone number validation failed - invalid format");
    } else {
      console.log("✅ Phone number validation passed");
    }

    if (formData.referralEmail.trim()) {
      if (!emailRegex.test(formData.referralEmail)) {
        newErrors.referralEmail = "Please enter a valid referral email address";
        console.log("❌ Referral email validation failed - invalid format");
      } else {
        console.log("✅ Referral email validation passed");
      }
    } else {
      console.log("ℹ️ Referral email is empty (optional)");
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("📊 Validation result:", isValid ? "PASSED" : "FAILED");
    console.log("🚫 Validation errors:", newErrors);

    return isValid;
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    console.log(`📝 Input changed - ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors for the field being updated
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      console.log(`🧹 Cleared error for field: ${field}`);
    }
  };

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    console.log("🚀 Form submission started...");
    console.log("📦 Payload being sent:", data);

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("✅ Registration successful!");
      toast.success("Account created! Redirecting to login...");

      // Mock successful registration
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 1500);
    } catch (error: any) {
      console.error("💥 Registration error:", error);
      const errorMessage = error.message || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("🏁 Form submission finished");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submit event triggered");
    console.log("🔍 Current form data before validation:", formData);

    if (validateForm()) {
      console.log("✅ Form validation passed, proceeding with submission...");
      await onSubmit(formData);
    } else {
      console.log("❌ Form validation failed, submission blocked");
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
      }}
    >
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8 sm:mb-12"
          >
            <motion.div variants={itemVariants}>
              <Badge
                className="mb-4 text-xs sm:text-sm"
                style={{
                  backgroundColor: "var(--color-sidebar-accent)",
                  color: "var(--color-sidebar-accent-foreground)",
                }}
              >
                Join Our Community • Interest-Free Lending
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Create Your Account
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Join our community of lenders and borrowers committed to
              interest-free financial assistance based on Islamic principles.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sign Up Form Section */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card
                className="hover:shadow-2xl transition-all duration-500 border-0 backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--card)",
                  background:
                    "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
                }}
              >
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    }}
                  >
                    <User
                      className="w-8 h-8"
                      style={{ color: "var(--primary-foreground)" }}
                    />
                  </motion.div>
                  <CardTitle
                    className="text-2xl sm:text-3xl"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    Sign Up
                  </CardTitle>
                  <CardDescription
                    className="text-base sm:text-lg"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Fill in your details to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label
                        htmlFor="fullName"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <User
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className={`mt-2 h-12 ${
                          errors.fullName ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.fullName
                            ? "var(--destructive)"
                            : "var(--input)",
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm mt-1 flex items-center"
                          style={{ color: "var(--destructive)" }}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.fullName}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <Mail
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`mt-2 h-12 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.email
                            ? "var(--destructive)"
                            : "var(--input)",
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm mt-1 flex items-center"
                          style={{ color: "var(--destructive)" }}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label
                        htmlFor="password"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <Lock
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className={`h-12 pr-12 ${
                            errors.password ? "border-red-500" : ""
                          }`}
                          style={{
                            borderColor: errors.password
                              ? "var(--destructive)"
                              : "var(--input)",
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-2 flex-1 rounded ${
                                  level <= passwordStrength
                                    ? passwordStrength <= 2
                                      ? "bg-red-500"
                                      : passwordStrength <= 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            Password strength:{" "}
                            {passwordStrength <= 2
                              ? "Weak"
                              : passwordStrength <= 3
                              ? "Medium"
                              : "Strong"}
                          </p>
                        </div>
                      )}
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm mt-1 flex items-center"
                          style={{ color: "var(--destructive)" }}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.password}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Phone Number */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label
                        htmlFor="phoneNumber"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <Phone
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        className={`mt-2 h-12 ${
                          errors.phoneNumber ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.phoneNumber
                            ? "var(--destructive)"
                            : "var(--input)",
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.phoneNumber && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm mt-1 flex items-center"
                          style={{ color: "var(--destructive)" }}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phoneNumber}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Referral Full Name */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label
                        htmlFor="referralFullName"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <UserPlus
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Address
                      </Label>
                      <Input
                        id="referralFullName"
                        type="text"
                        placeholder="Enter your Address"
                        value={formData.referralFullName}
                        onChange={(e) =>
                          handleInputChange("referralFullName", e.target.value)
                        }
                        className="mt-2 h-12"
                        style={{
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                          borderColor: "var(--input)",
                        }}
                        disabled={isSubmitting}
                      />
                    </motion.div>

                    {/* Referral Email */}
                    {/* <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label
                        htmlFor="referralEmail"
                        className="text-base font-semibold flex items-center"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        <Mail
                          className="w-4 h-4 mr-2"
                          style={{ color: "var(--brand)" }}
                        />
                        Referrer's Email
                      </Label>
                      <Input
                        id="referralEmail"
                        type="email"
                        placeholder="Enter referrer's email if applicable"
                        value={formData.referralEmail}
                        onChange={(e) =>
                          handleInputChange("referralEmail", e.target.value)
                        }
                        className={`mt-2 h-12 ${
                          errors.referralEmail ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.referralEmail
                            ? "var(--destructive)"
                            : "var(--input)",
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        disabled={isSubmitting}
                      />
                      {errors.referralEmail && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm mt-1 flex items-center"
                          style={{ color: "var(--destructive)" }}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.referralEmail}
                        </motion.p>
                      )}
                    </motion.div> */}

                    {/* Submit Button */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 text-lg font-semibold h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Login Link */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-center pt-4"
                    >
                      <p style={{ color: "var(--muted-foreground)" }}>
                        Already have an account?{" "}
                        <Link
                          href="/sign-in"
                          className="font-semibold"
                          style={{ color: "var(--brand)" }}
                        >
                          Sign in here
                        </Link>
                      </p>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
