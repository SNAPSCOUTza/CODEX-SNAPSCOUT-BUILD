"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { OnboardingQuestion } from "@/types/onboarding"
import { ChipSelect } from "@/components/onboarding/ChipSelect"

interface QuestionScreenProps {
  question: OnboardingQuestion
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
  primaryButtonClass: string
  roleSelectionClass: string
}

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

export function QuestionScreen({
  question,
  value,
  onChange,
  onContinue,
  onBack,
  canContinue,
  primaryButtonClass,
  roleSelectionClass,
}: QuestionScreenProps) {
  const colsClass =
    question.layout === "three-col"
      ? "grid-cols-3"
      : question.layout === "two-col"
        ? "grid-cols-2"
        : "grid-cols-1"
  const isMulti = question.mode === "multi"
  const selectedSingle = typeof value === "string" ? value : ""
  const selectedMulti = Array.isArray(value) ? value : []

  return (
    <motion.div {...fadeUp}>
      <Card className="border-2 border-gray-200">
        <CardContent className="space-y-5 p-6">
          <h2 className="text-xl font-semibold">{question.prompt}</h2>

          {question.layout === "chips" ? (
            <ChipSelect
              options={question.options}
              values={selectedMulti}
              onChange={(next) => onChange(next)}
              roleSelectionClass={roleSelectionClass}
            />
          ) : (
            <div className={`grid gap-3 ${colsClass}`}>
              {question.options.map((option) => {
                const selected = isMulti ? selectedMulti.includes(option.value) : selectedSingle === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (isMulti) {
                        const next = selectedMulti.includes(option.value)
                          ? selectedMulti.filter((item) => item !== option.value)
                          : [...selectedMulti, option.value]
                        onChange(next)
                        return
                      }
                      onChange(option.value)
                    }}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      selected ? roleSelectionClass : "border-gray-200 hover:border-red-200"
                    }`}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    {option.description ? <p className="mt-1 text-xs text-muted-foreground">{option.description}</p> : null}
                  </button>
                )
              })}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button className={`w-full ${primaryButtonClass}`} disabled={!canContinue} onClick={onContinue}>
              Continue
            </Button>
            <Button variant="ghost" className="w-full" onClick={onBack}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
