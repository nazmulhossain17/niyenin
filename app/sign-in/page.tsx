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
import { Checkbox } from "@/components/ui/checkbox";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Shield,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

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
    console.log("🔍 Validating login form...");
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
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

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      console.log("❌ Password validation failed - empty");
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      console.log("❌ Password validation failed - too short");
    } else {
      console.log("✅ Password validation passed");
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("📊 Form validation result:", isValid ? "PASSED" : "FAILED");

    return isValid;
  };

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean
  ) => {
    console.log(`📝 Input changed - ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof Partial<LoginFormData>]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      console.log(`🧹 Cleared error for field: ${field}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submit event triggered");

    if (validateForm()) {
      console.log("✅ Form validation passed, proceeding with login...");
      setIsLoading(true);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("📋 Login credentials:", {
          email: formData.email,
          rememberMe: formData.rememberMe,
        });

        // Mock successful login
        console.log("✅ Login successful!");
        toast.success("Welcome back! Login successful");

        // Handle remember me functionality
        if (formData.rememberMe) {
          console.log("💾 Remember me enabled");
          // You could set localStorage or cookies here
        }

        // Mock redirect based on user role (you can customize this)
        setTimeout(() => {
          console.log("👤 Redirecting to dashboard");
          // Replace with your actual redirect logic
          window.location.href = "/dashboard";
        }, 1500);
      } catch (error: any) {
        console.error("💥 Unexpected login error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("❌ Form validation failed, submission blocked");
    }
  };

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
                Welcome Back • Secure Login
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
                Welcome Back
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sign in to your account to continue.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Sign In Form Section */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
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
                    <LogIn
                      className="w-8 h-8"
                      style={{ color: "var(--primary-foreground)" }}
                    />
                  </motion.div>
                  <CardTitle
                    className="text-2xl sm:text-3xl"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    Sign In
                  </CardTitle>
                  <CardDescription
                    className="text-base sm:text-lg"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
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
                        disabled={isLoading}
                        autoComplete="email"
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
                      transition={{ delay: 0.2 }}
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
                          placeholder="Enter your password"
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
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--muted-foreground)" }}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
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

                    {/* Remember Me & Forgot Password */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) =>
                            handleInputChange("rememberMe", checked as boolean)
                          }
                          disabled={isLoading}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm cursor-pointer"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Remember me
                        </Label>
                      </div>
                      <a
                        href="/forgot-password"
                        className="text-sm font-medium"
                        style={{ color: "var(--brand)" }}
                      >
                        Forgot password?
                      </a>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 text-lg font-semibold h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Sign Up Link */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center pt-4"
                    >
                      <p style={{ color: "var(--muted-foreground)" }}>
                        Don't have an account?{" "}
                        <a
                          href="/sign-up"
                          className="font-semibold"
                          style={{ color: "var(--brand)" }}
                        >
                          Create one here
                        </a>
                      </p>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Your Security is Our Priority
            </h2>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Shield,
                title: "SSL Encrypted",
                description:
                  "All data transmitted is encrypted with industry-standard SSL",
                gradient: "var(--brand), var(--color-chart-2)",
              },
              {
                icon: UserCheck,
                title: "Verified Users",
                description: "All members go through our verification process",
                gradient: "var(--color-chart-3), var(--color-chart-4)",
              },
              {
                icon: Lock,
                title: "Secure Storage",
                description: "Your personal information is stored securely",
                gradient: "var(--color-chart-5), var(--color-chart-1)",
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className="text-center hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm h-full"
                  style={{
                    backgroundColor: "var(--card)",
                    background:
                      "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
                  }}
                >
                  <CardContent className="pt-6">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${feature.gradient})`,
                      }}
                    >
                      <feature.icon
                        className="w-6 h-6"
                        style={{ color: "var(--primary-foreground)" }}
                      />
                    </motion.div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
