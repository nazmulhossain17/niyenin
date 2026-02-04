// ========================================
// File: app/(home)/sign-in/page.tsx
// Sign In Page - Email/Password & Social Login
// Checks for addresses after successful login
// ========================================

"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Separator } from "@/components/ui/separator";

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
import Link from "next/link";

// Better Auth Client
import { authClient, type UserRole } from "@/lib/auth-client";

// Social Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
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
    const newErrors: Partial<LoginFormData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  // Redirect after successful login based on role
  const redirectAfterLogin = (role?: UserRole) => {
    // Admin and vendor users go directly to their dashboards
    if (role === "super_admin" || role === "admin") {
      router.push("/admin");
      return;
    }
    
    if (role === "vendor") {
      router.push("/vendor/dashboard");
      return;
    }

    // For customers, just redirect to callback URL
    // The auth provider will handle address check for checkout routes
    router.push(callbackUrl);
  };

  // Email/Password Sign In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error) {
        throw new Error(error.message || "Sign in failed");
      }

      toast.success("Welcome back!");

      // Type assertion since we know our schema has role field
      const role = (data?.user as { role?: UserRole })?.role;
      
      // Redirect based on role
      redirectAfterLogin(role);
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Social Sign In Handlers
  const handleSocialLogin = async (provider: "google" | "facebook" | "apple") => {
    setSocialLoading(provider);
    setServerError(null);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        // For social login, we'll handle the address check in the callback
        // The auth provider will check after the redirect
        callbackURL: callbackUrl,
      });

      if (error) {
        throw new Error(error.message || `Failed to sign in with ${provider}`);
      }
    } catch (error: unknown) {
      console.error(`${provider} login error:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${provider}`;
      setServerError(errorMessage);
      toast.error(errorMessage);
      setSocialLoading(null);
    }
  };

  const isAnyLoading = isLoading || socialLoading !== null;

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
      }}
    >
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
            style={{ background: "var(--brand)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.08, scale: 1.2 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
            style={{ background: "var(--color-chart-2)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Left Content */}
            <motion.div variants={itemVariants} className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-2 text-sm font-medium"
                style={{
                  background: "var(--brand)/20",
                  color: "var(--brand)",
                }}
              >
                🎉 Welcome Back
              </Badge>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                Sign In to{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand) 0%, var(--color-chart-2) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your Account
                </span>
              </h1>
              <p
                className="text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                Access your orders, track deliveries, and enjoy personalized
                shopping experience with your account.
              </p>

              {/* Benefits reminder */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: "📦", text: "Track Orders" },
                  { icon: "❤️", text: "Saved Wishlist" },
                  { icon: "🎁", text: "Exclusive Offers" },
                  { icon: "🔄", text: "Easy Returns" },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--card)" }}
                  >
                    <span className="text-xl">{benefit.icon}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Login Form */}
            <motion.div variants={itemVariants}>
              <Card
                className="w-full max-w-md mx-auto shadow-2xl border-0 backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--card)",
                  background:
                    "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
                }}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle
                    className="text-2xl font-bold"
                    style={{ color: "var(--card-foreground)" }}
                  >
                    Sign In
                  </CardTitle>
                  <CardDescription style={{ color: "var(--muted-foreground)" }}>
                    Enter your credentials to continue
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { provider: "google" as const, icon: GoogleIcon, label: "Google" },
                      { provider: "facebook" as const, icon: FacebookIcon, label: "Facebook" },
                      { provider: "apple" as const, icon: AppleIcon, label: "Apple" },
                    ].map(({ provider, icon: Icon, label }) => (
                      <motion.div key={provider} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full h-12 relative"
                          onClick={() => handleSocialLogin(provider)}
                          disabled={isAnyLoading}
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--background)",
                          }}
                        >
                          {socialLoading === provider ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Icon />
                          )}
                          <span className="sr-only">Sign in with {label}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative mb-6">
                    <Separator style={{ backgroundColor: "var(--border)" }} />
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm"
                      style={{
                        backgroundColor: "var(--card)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      or continue with email
                    </span>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        <Mail className="w-4 h-4 mr-2" style={{ color: "var(--brand)" }} />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`mt-2 h-12 ${errors.email ? "border-red-500" : ""}`}
                        style={{
                          borderColor: errors.email ? "var(--destructive)" : "var(--input)",
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                        disabled={isAnyLoading}
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
                        <Lock className="w-4 h-4 mr-2" style={{ color: "var(--brand)" }} />
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={`h-12 pr-12 ${errors.password ? "border-red-500" : ""}`}
                          style={{
                            borderColor: errors.password ? "var(--destructive)" : "var(--input)",
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                          disabled={isAnyLoading}
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isAnyLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                          )}
                        </Button>
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
                          disabled={isAnyLoading}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm cursor-pointer"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Remember me
                        </Label>
                      </div>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium hover:underline"
                        style={{ color: "var(--brand)" }}
                      >
                        Forgot password?
                      </Link>
                    </motion.div>

                    {/* Server Error */}
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg flex items-center"
                        style={{
                          backgroundColor: "var(--destructive)/10",
                          border: "1px solid var(--destructive)",
                        }}
                      >
                        <AlertCircle
                          className="w-5 h-5 mr-2 shrink-0"
                          style={{ color: "var(--destructive)" }}
                        />
                        <p className="text-sm" style={{ color: "var(--destructive)" }}>
                          {serverError}
                        </p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isAnyLoading}
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
                        Don&apos;t have an account?{" "}
                        <Link
                          href="/sign-up"
                          className="font-semibold hover:underline"
                          style={{ color: "var(--brand)" }}
                        >
                          Create one here
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