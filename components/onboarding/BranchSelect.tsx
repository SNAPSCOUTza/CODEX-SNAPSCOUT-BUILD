"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { OnboardingBranch, OnboardingRole } from "@/types/onboarding"
import { branchOptions, roleTheme } from "@/lib/onboarding-config"

interface BranchSelectProps {
  role: Exclude<OnboardingRole, "scout">
  onSelect: (branch: OnboardingBranch) => void
  onBack: () => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function BranchSelect({ role, onSelect, onBack }: BranchSelectProps) {
  const options = branchOptions[role]
  const primaryClass = roleTheme[role].primary

  return (
    <motion.div {...fadeUp}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Select your branch</h2>
        <p className="mt-2 text-sm text-muted-foreground">Pick the path that matches what you offer on SnapScout.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => (
          <Card key={option.id} className="border-2 border-gray-200 hover:border-red-200">
            <CardHeader>
              <CardTitle className="text-xl">{option.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{option.subtitle}</p>
            </CardHeader>
            <CardContent />
            <CardFooter>
              <Button className={`w-full ${primaryClass}`} onClick={() => onSelect(option.id)}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Button variant="ghost" className="mt-4 w-full" onClick={onBack}>
        Back
      </Button>
    </motion.div>
  )
}
