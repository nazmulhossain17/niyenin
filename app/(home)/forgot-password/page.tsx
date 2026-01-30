// ========================================
// File: app/(auth)/forgot-password/page.tsx
// Forgot Password Page - Request password reset email
// ========================================

"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
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
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// Better Auth Client
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    setError(null);
    return true;
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      // Use requestPasswordReset - the correct Better Auth method name
      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to send reset email");
      }

      setIsSuccess(true);
      toast.success("Password reset email sent!");
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to resend email");
      }

      toast.success("Reset email resent successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
                Account Recovery • Secure Reset
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
                Forgot Password?
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              No worries! Enter your email and we&apos;ll send you a reset link.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Forgot Password Form Section */}
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
                        : "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    }}
                  >
                    {isSuccess ? (
                      <CheckCircle2
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
                    {isSuccess ? "Check Your Email" : "Reset Password"}
                  </CardTitle>
                  <CardDescription
                    className="text-base sm:text-lg"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {isSuccess
                      ? "We've sent a password reset link to your email"
                      : "Enter your email to receive a reset link"}
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
                        <Mail
                          className="w-12 h-12 mx-auto mb-3"
                          style={{ color: "var(--color-chart-3)" }}
                        />
                        <p
                          className="font-medium mb-1"
                          style={{ color: "var(--card-foreground)" }}
                        >
                          Email sent to:
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {email}
                        </p>
                      </div>

                      <div
                        className="text-sm text-center space-y-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        <p>
                          Didn&apos;t receive the email? Check your spam folder
                          or
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResend}
                          disabled={isLoading}
                          className="p-0 h-auto font-semibold"
                          style={{ color: "var(--brand)" }}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Resending...
                            </>
                          ) : (
                            "Click here to resend"
                          )}
                        </Button>
                      </div>

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
                          value={email}
                          onChange={(e) => handleInputChange(e.target.value)}
                          className={`mt-2 h-12 ${error ? "border-red-500" : ""}`}
                          style={{
                            borderColor: error
                              ? "var(--destructive)"
                              : "var(--input)",
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                          disabled={isLoading}
                          autoComplete="email"
                          autoFocus
                        />
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm mt-1 flex items-center"
                            style={{ color: "var(--destructive)" }}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {error}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
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
                              Sending Reset Link...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Send Reset Link
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Back to Sign In */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
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

      {/* Help Section */}
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
                  Need Help?
                </h3>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <div className="space-y-2">
                    <p className="font-medium" style={{ color: "var(--card-foreground)" }}>
                      Common Issues:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your spam/junk folder</li>
                      <li>Make sure you entered the correct email</li>
                      <li>Wait a few minutes for the email to arrive</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium" style={{ color: "var(--card-foreground)" }}>
                      Still having trouble?
                    </p>
                    <p>
                      Contact our support team at{" "}
                      <a
                        href="mailto:support@example.com"
                        className="font-medium hover:underline"
                        style={{ color: "var(--brand)" }}
                      >
                        support@example.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}