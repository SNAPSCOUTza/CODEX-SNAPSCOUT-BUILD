"use client"

import { Button } from "@/components/ui/button"
import type { QuestionOption } from "@/types/onboarding"

interface ChipSelectProps {
  options: QuestionOption[]
  values: string[]
  onChange: (next: string[]) => void
  roleSelectionClass: string
}

export function ChipSelect({ options, values, onChange, roleSelectionClass }: ChipSelectProps) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
      return
    }
    onChange([...values, value])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option.value)
        return (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            onClick={() => toggle(option.value)}
            className={`rounded-full border-2 px-4 py-2 text-sm ${selected ? roleSelectionClass : "border-gray-200 hover:border-red-200"}`}
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
