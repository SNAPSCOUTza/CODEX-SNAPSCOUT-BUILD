"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Lock, MessageCircle } from "lucide-react"
import { ahaCards } from "@/lib/onboarding-config"

interface AhaMomentProps {
  personaLine: string
  primaryButtonClass: string
  onContinue: () => void
  onBack: () => void
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function AhaMoment({ personaLine, primaryButtonClass, onContinue, onBack }: AhaMomentProps) {
  return (
    <motion.div {...fadeUp} className="space-y-4">
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle>Your personalised feed is ready</CardTitle>
          <p className="text-sm italic text-muted-foreground">{personaLine}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {ahaCards.map((item) => (
          <Card key={item.id} className="border-2 border-gray-200 hover:border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">{item.availability}</Badge>
                <Badge variant="secondary">{item.badge}</Badge>
              </div>
              <p className="mt-3 text-sm font-medium">{item.rate}</p>
              <Button variant="outline" className="mt-3 w-full justify-between border-gray-200">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Contact / Book
                </span>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-gray-200 bg-red-50">
        <CardContent className="p-4 text-sm text-red-700">
          Sign up to save, contact and book — your personalised feed is ready.
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button className={`w-full ${primaryButtonClass}`} onClick={onContinue}>
          Create my account
        </Button>
        <p className="text-center text-xs text-muted-foreground">No payment info needed to sign up</p>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Back
        </Button>
      </div>
    </motion.div>
  )
}
