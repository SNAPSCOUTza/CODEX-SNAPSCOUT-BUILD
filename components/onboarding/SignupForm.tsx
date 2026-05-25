"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

interface SignupFormProps {
  roleLabel: string
  primaryButtonClass: string
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => Promise<void> | void
  onBack: () => void
  loading?: boolean
  error?: string
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

function getStrength(password: string) {
  let score = 0
  if (password.length >= 6) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

export function SignupForm({
  roleLabel,
  primaryButtonClass,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
  loading,
  error,
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const strength = useMemo(() => getStrength(password), [password])
  const canContinue = email.includes("@") && password.length >= 6 && !loading

  return (
    <motion.div {...fadeUp}>
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Email address</p>
            <Input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} autoComplete="email" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Password</p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className={`h-1 rounded ${item <= strength ? "bg-green-600" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <Button disabled={!canContinue} className={`w-full ${primaryButtonClass}`} onClick={onSubmit}>
            {loading ? "Creating account..." : `Join SnapScout as a ${roleLabel}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By joining you agree to SnapScout&apos;s Terms of Service and Privacy Policy
          </p>
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
