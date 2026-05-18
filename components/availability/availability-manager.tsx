"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CalendarClock, Download, Lock, Minus, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildIcsCalendar,
  buildMockAvailability,
  formatDateKey,
  getAvailabilityMap,
  getMonthDays,
  type AvailabilityEntry,
  type AvailabilityOwnerType,
  type AvailabilityStatus,
} from "@/lib/availability"

type AvailabilityManagerProps = {
  ownerId: string
  ownerType?: AvailabilityOwnerType
}

const statusOrder: Array<AvailabilityStatus | "reset"> = ["available", "blocked", "reset"]

export function AvailabilityManager({ ownerId, ownerType = "crew" }: AvailabilityManagerProps) {
  const [month] = useState(() => new Date())
  const [entries, setEntries] = useState<AvailabilityEntry[]>(() => buildMockAvailability(ownerId, ownerType))
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkDates, setBulkDates] = useState<string[]>([])

  const entriesByDate = useMemo(() => getAvailabilityMap(entries), [entries])
  const nextBooking = entries.find((entry) => entry.status === "booked" && entry.date >= formatDateKey(new Date()))

  const updateDate = (date: string) => {
    const current = entriesByDate.get(date)
    if (current?.status === "booked") return

    if (bulkMode) {
      setBulkDates((currentDates) =>
        currentDates.includes(date) ? currentDates.filter((item) => item !== date) : [...currentDates, date],
      )
      return
    }

    const currentIndex = statusOrder.indexOf(current?.status ?? "reset")
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]

    setEntries((prev) => {
      const withoutDate = prev.filter((entry) => entry.date !== date)
      if (nextStatus === "reset") return withoutDate
      return [...withoutDate, { owner_id: ownerId, owner_type: ownerType, date, status: nextStatus }]
    })
  }

  const blockBulkDates = () => {
    setEntries((prev) => {
      const kept = prev.filter((entry) => !bulkDates.includes(entry.date) || entry.status === "booked")
      const blocked = bulkDates.map((date) => ({ owner_id: ownerId, owner_type: ownerType, date, status: "blocked" as const }))
      return [...kept, ...blocked]
    })
    setBulkDates([])
    setBulkMode(false)
  }

  const exportIcs = () => {
    const blob = new Blob([buildIcsCalendar(entries)], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "snapscout-availability.ics"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card">
      <CardContent className="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-bold leading-tight">Availability</h2>
            <p className="text-[14px] text-muted-foreground">Tap dates to mark available, blocked, or reset.</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={exportIcs}
            className="grid h-11 w-11 place-items-center rounded-full border bg-background"
            aria-label="Export availability calendar"
          >
            <Download className="h-4 w-4" />
          </motion.button>
        </div>

        {nextBooking && (
          <div className="rounded-2xl border bg-muted p-4 text-[14px]">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarClock className="h-4 w-4 text-primary" />
              Your next booking
            </div>
            <p className="mt-1 text-muted-foreground">
              {new Date(nextBooking.date).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })} · Client booking
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={bulkMode ? "default" : "outline"}
            className="h-[52px] rounded-full"
            onClick={() => setBulkMode((value) => !value)}
          >
            <ShieldCheck className="h-4 w-4" />
            Block dates
          </Button>
          <Button
            variant="outline"
            className="h-[52px] rounded-full"
            disabled={!bulkDates.length}
            onClick={blockBulkDates}
          >
            <Minus className="h-4 w-4" />
            Apply {bulkDates.length || ""}
          </Button>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[18px] font-bold">{month.toLocaleDateString("en-ZA", { month: "long" })}</h3>
            <span className="font-mono text-[12px] text-muted-foreground">{month.getFullYear()}</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getMonthDays(month).map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="aspect-square" />

              const key = formatDateKey(date)
              const entry = entriesByDate.get(key)
              const status = entry?.status
              const selectedForBulk = bulkDates.includes(key)

              return (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => updateDate(key)}
                  className={`relative grid aspect-square min-h-11 place-items-center rounded-2xl border font-mono text-[14px] transition-colors ${
                    selectedForBulk
                      ? "border-primary bg-primary text-primary-foreground"
                      : status === "booked"
                        ? "border-red-500/30 bg-red-500/10 text-red-700"
                        : status === "blocked"
                          ? "border-muted bg-muted text-muted-foreground"
                          : status === "available"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            : "border-border bg-background"
                  }`}
                  aria-label={`Set availability for ${key}`}
                >
                  {status === "booked" && <Lock className="absolute right-1.5 top-1.5 h-3 w-3" />}
                  {date.getDate()}
                </motion.button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
