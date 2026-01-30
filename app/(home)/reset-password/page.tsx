// ========================================
// File: app/(auth)/reset-password/page.tsx
// Reset Password Page - Set new password with token
// ========================================

"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, type Transition } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// Better Auth Client
import { authClient } from "@/lib/auth-client";

interface FormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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

  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) return;

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      });

      if (error) {
        throw new Error(error.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";

      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid")
      ) {
        setIsInvalidToken(true);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
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
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = [
    "var(--destructive)",
    "var(--color-chart-5)",
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
  ];

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
                Account Security • New Password
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
                Reset Password
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Create a new secure password for your account.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Reset Password Form Section */}
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
                      background: isSuccess
                        ? "linear-gradient(135deg, var(--color-chart-3) 0%, var(--color-chart-4) 100%)"
                        : isInvalidToken
                          ? "linear-gradient(135deg, var(--destructive) 0%, var(--color-chart-5) 100%)"
                          : "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    }}
                  >
                    {isSuccess ? (
                      <CheckCircle2
                        className="w-8 h-8"
                        style={{ color: "var(--primary-foreground)" }}
                      />
                    ) : isInvalidToken ? (
                      <AlertCircle
                        className="w-8 h-8"
                        style={{ color: "var(--primary-foreground)" }}
                      />
                    ) : (
                      <KeyRound
                        className="w-8 h-8"
                        style={{ color: "var(--primary-foreground)" }}
                      />
                    )}
                  </motion.div>
                  <CardTitle
                    className="text-2xl sm:text-3xl"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    {isSuccess
                      ? "Password Reset!"
                      : isInvalidToken
                        ? "Invalid Link"
                        : "New Password"}
                  </CardTitle>
                  <CardDescription
                    className="text-base sm:text-lg"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {isSuccess
                      ? "Your password has been reset successfully"
                      : isInvalidToken
                        ? "This reset link is invalid or has expired"
                        : "Enter your new password below"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    // Success State
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div
                        className="p-4 rounded-lg text-center"
                        style={{
                          backgroundColor: "var(--color-chart-3)/10",
                          border: "1px solid var(--color-chart-3)",
                        }}
                      >
                        <ShieldCheck
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: "var(--color-chart-3)" }}
                        />
                        <p
                          className="font-medium"
                          style={{ color: "var(--card-foreground)" }}
                        >
                          Your password has been updated
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Redirecting to sign in...
                        </p>
                      </div>

                      <Link href="/sign-in" className="block">
                        <Button
                          type="button"
                          className="w-full h-12 font-medium"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          Continue to Sign In
                        </Button>
                      </Link>
                    </motion.div>
                  ) : isInvalidToken ? (
                    // Invalid Token State
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div
                        className="p-4 rounded-lg text-center"
                        style={{
                          backgroundColor: "var(--destructive)/10",
                          border: "1px solid var(--destructive)",
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          The password reset link you clicked is either invalid
                          or has expired. Please request a new one.
                        </p>
                      </div>

                      <Link href="/forgot-password" className="block">
                        <Button
                          type="button"
                          className="w-full h-12 font-medium"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          Request New Reset Link
                        </Button>
                      </Link>

                      <Link href="/sign-in" className="block">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 font-medium"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Sign In
                        </Button>
                      </Link>
                    </motion.div>
                  ) : (
                    // Form State
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* New Password */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
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
                          New Password
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
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
                            autoComplete="new-password"
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

                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="flex gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-1 flex-1 rounded-full transition-colors"
                                  style={{
                                    backgroundColor:
                                      i < passwordStrength
                                        ? strengthColors[passwordStrength - 1]
                                        : "var(--muted)",
                                  }}
                                />
                              ))}
                            </div>
                            <p
                              className="text-xs"
                              style={{
                                color:
                                  passwordStrength > 0
                                    ? strengthColors[passwordStrength - 1]
                                    : "var(--muted-foreground)",
                              }}
                            >
                              {passwordStrength > 0
                                ? strengthLabels[passwordStrength - 1]
                                : "Enter password"}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Confirm Password */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label
                          htmlFor="confirmPassword"
                          className="text-base font-semibold flex items-center"
                          style={{ color: "var(--card-foreground)" }}
                        >
                          <Lock
                            className="w-4 h-4 mr-2"
                            style={{ color: "var(--brand)" }}
                          />
                          Confirm Password
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className={`h-12 pr-12 ${
                              errors.confirmPassword ? "border-red-500" : ""
                            }`}
                            style={{
                              borderColor: errors.confirmPassword
                                ? "var(--destructive)"
                                : "var(--input)",
                              backgroundColor: "var(--background)",
                              color: "var(--foreground)",
                            }}
                            disabled={isLoading}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: "var(--muted-foreground)" }}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm mt-1 flex items-center"
                            style={{ color: "var(--destructive)" }}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
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
                              Resetting Password...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-5 h-5 mr-2" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Back to Sign In */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center pt-4"
                      >
                        <Link
                          href="/sign-in"
                          className="inline-flex items-center text-sm font-medium hover:underline"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" />
                          Back to Sign In
                        </Link>
                      </motion.div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Password Tips */}
      {!isSuccess && !isInvalidToken && (
        <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card
                className="border-0 backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--card)",
                  background:
                    "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
                }}
              >
                <CardContent className="pt-6">
                  <h3
                    className="text-lg font-semibold mb-4 text-center"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    Password Requirements
                  </h3>
                  <ul
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {[
                      "At least 8 characters long",
                      "Contains uppercase letter (A-Z)",
                      "Contains lowercase letter (a-z)",
                      "Contains a number (0-9)",
                      "Consider special characters (!@#$)",
                      "Avoid common passwords",
                    ].map((tip, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2
                          className="w-4 h-4 mr-2 shrink-0"
                          style={{ color: "var(--color-chart-3)" }}
                        />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
      }}
    >
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand)" }} />
    </div>
  );
}

// Main export with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}