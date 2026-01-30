"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, type Transition } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Lock, Eye, EyeOff, AlertCircle, Loader2, KeyRound, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { authClient } from "@/lib/auth-client"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

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
  }

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token")
      router.push("/forgot-password")
    }
  }, [token, router])

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    setIsLoading(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (error) {
        throw new Error(error.message || "Failed to reset password")
      }

      setIsSuccess(true)
      toast.success("Password reset successfully!")
    } catch (error: unknown) {
      console.error("Reset password error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div
        className="min-h-screen overflow-x-hidden flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card
            className="border-0 backdrop-blur-sm"
            style={{
              backgroundColor: "var(--card)",
              background: "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
            }}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "var(--primary)/10" }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: "var(--primary)" }} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--card-foreground)" }}>
                Password Reset!
              </h2>
              <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link href="/sign-in">
                <Button
                  className="w-full"
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--color-chart-2) 100%)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-sidebar) 0%, var(--background) 50%, var(--color-muted) 100%)",
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
                Account Recovery
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--color-chart-2) 100%)",
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
              Enter your new password below.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Card
                className="hover:shadow-2xl transition-all duration-500 border-0 backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--card)",
                  background: "linear-gradient(135deg, var(--card) 0%, var(--popover) 100%)",
                }}
              >
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: "linear-gradient(135deg, var(--primary) 0%, var(--color-chart-2) 100%)",
                    }}
                  >
                    <KeyRound className="w-8 h-8" style={{ color: "var(--primary-foreground)" }} />
                  </motion.div>
                  <CardTitle className="text-2xl sm:text-3xl" style={{ color: "var(--card-foreground)" }}>
                    New Password
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg" style={{ color: "var(--muted-foreground)" }}>
                    Create a strong password for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password */}
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
                        <Lock className="w-4 h-4 mr-2" style={{ color: "var(--primary)" }} />
                        New Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password (min 8 characters)"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, password: undefined }))
                          }}
                          className={`h-12 pr-12 ${errors.password ? "border-red-500" : ""}`}
                          style={{
                            borderColor: errors.password ? "var(--destructive)" : "var(--input)",
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
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                        <Lock className="w-4 h-4 mr-2" style={{ color: "var(--primary)" }} />
                        Confirm Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                          }}
                          className={`h-12 pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                          style={{
                            borderColor: errors.confirmPassword ? "var(--destructive)" : "var(--input)",
                            backgroundColor: "var(--background)",
                            color: "var(--foreground)",
                          }}
                          disabled={isLoading}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: "var(--muted-foreground)" }}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                        className="w-full py-4 text-lg font-semibold h-auto disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, var(--primary) 0%, var(--color-chart-2) 100%)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-5 h-5 mr-2" />
                            Reset Password
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
