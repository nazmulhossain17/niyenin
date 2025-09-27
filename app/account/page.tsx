"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Mail, Lock, Apple } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";

function AuthForm() {
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] =
    useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="px-8 py-4">
        <div className="text-sm text-gray-600">
          <span className="text-green-600">Home</span> &gt; Account
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Sign Up Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Sign Up</h1>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <Apple className="w-5 h-5 mr-3" />
                Continue with Apple
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <FaFacebook className="w-5 h-5 mr-3 text-blue-600" />
                Continue with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Ex: Eliza"
                      className="pl-10 h-12 bg-gray-100 border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Ex: Maguire"
                      className="pl-10 h-12 bg-gray-100 border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Ex: Maguire@FlexUI.com"
                    className="pl-10 h-12 bg-gray-100 border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-12 bg-gray-100 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showSignUpConfirmPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-12 bg-gray-100 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowSignUpConfirmPassword(!showSignUpConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showSignUpConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to al{" "}
                <span className="text-green-600 underline cursor-pointer">
                  Terms & Condition
                </span>{" "}
                and Feeds
              </label>
            </div>

            {/* Sign Up Button */}
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium">
              Sign Up
            </Button>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Login here</h1>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <Apple className="w-5 h-5 mr-3" />
                Continue with Apple
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              >
                <FaFacebook className="w-5 h-5 mr-3 text-blue-600" />
                Continue with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Ex: Maguire@FlexUI.com"
                    className="pl-10 h-12 bg-gray-100 border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-12 bg-gray-100 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember Me?
              </label>
            </div>

            {/* Login Button */}
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium">
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
