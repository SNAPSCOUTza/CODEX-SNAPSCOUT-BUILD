"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useState } from "react"
import { ArrowRight, Camera, Users, Building2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
// import { signUp } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

type AccountType = "content_creator" | "scout" | "studio"

export default function SimplifiedOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [display_name, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const { signUp, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type)
    setCurrentStep(2)
  }

  const handleCreateAccount = async () => {
    setError("")

    // Validation
    if (!display_name.trim()) {
      setError("Please enter your display name")
      return
    }

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!agreedToTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    if (!accountType) {
      setError("Please select an account type")
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await signUp(email, password, display_name, accountType)

      if (signUpError) {
        throw signUpError
      }

      setCurrentStep(3)
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/snapscout-circular-logo.png"
              alt="SnapScout Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">SnapScout</h1>
              <p className="text-sm text-gray-600">Quick Signup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium text-gray-700">Type</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-gray-700">Account</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: currentStep >= 3 ? "100%" : "0%" }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium text-gray-700">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Account Type */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Account Type</h2>
                <p className="text-gray-600">Select the option that best describes you</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Creator */}
                <button
                  onClick={() => handleAccountTypeSelect("content_creator")}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500 group"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors">
                    <Camera className="w-8 h-8 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Creator</h3>
                  <p className="text-gray-600 text-sm">Film Crew / Content Creator looking for work</p>
                </button>

                {/* Scout */}
                <button
                  onClick={() => handleAccountTypeSelect("scout")}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500 group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors">
                    <Users className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scout</h3>
                  <p className="text-gray-600 text-sm">Client looking to hire creative talent</p>
                </button>

                {/* Studio/Store */}
                <button
                  onClick={() => handleAccountTypeSelect("studio")}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500 group"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500 transition-colors">
                    <Building2 className="w-8 h-8 text-purple-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Studio/Store</h3>
                  <p className="text-gray-600 text-sm">Studio or equipment rental business</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Create Account */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Enter your details to get started</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      type="text"
                      placeholder="How should we call you?"
                      value={display_name}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight cursor-pointer">
                      I agree to the{" "}
                      <a href="/terms" className="text-red-500 hover:underline">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-red-500 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleCreateAccount}
                    disabled={loading || isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>

                  <Button onClick={() => setCurrentStep(1)} variant="ghost" className="w-full">
                    Back to Account Type
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-red-500 hover:underline font-medium">
                    Sign in
                  </a>
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to SnapScout!</h2>
                <p className="text-gray-600 mb-6">
                  Your account has been created successfully. Check your email to verify your account, then complete
                  your profile in the dashboard.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong>
                    <br />
                    1. Verify your email address
                    <br />
                    2. Complete your profile in the dashboard
                    <br />
                    3. Start connecting with the community
                  </p>
                </div>

                <Button onClick={handleComplete} className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
