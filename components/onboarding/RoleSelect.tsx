"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Building2, Search, CheckCircle } from "lucide-react"
import type { OnboardingRole } from "@/types/onboarding"
import { roleCards } from "@/lib/onboarding-config"

interface RoleSelectProps {
  onSelect: (role: OnboardingRole) => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function RoleSelect({ onSelect }: RoleSelectProps) {
  return (
    <motion.div {...fadeUp} className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Choose your role</h1>
        <p className="mt-2 text-sm text-muted-foreground">We’ll personalise SnapScout around how you work.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roleCards.map((role) => {
          const Icon = role.icon === "search" ? Search : role.icon === "camera" ? Camera : Building2
          return (
            <Card key={role.role} className="border-2 border-gray-200 transition-colors hover:border-red-200">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={role.badgeClass}>{role.badgeLabel}</Badge>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg font-semibold">{role.price}</p>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${role.ctaClass}`} onClick={() => onSelect(role.role)}>
                  Continue as {role.title}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </motion.div>
  )
}
