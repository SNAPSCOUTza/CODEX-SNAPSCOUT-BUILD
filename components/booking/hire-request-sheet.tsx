"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type HireRequestSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  talentId: string
  talentName: string
  talentType: "creator" | "crew" | "studio" | "store"
  priceLabel: string
  initialDate?: string
  bookingTypeOptions?: string[]
  bookingTypeLabel?: string
  bookingTypePlaceholder?: string
  durationLabel?: string
  briefLabel?: string
  briefPlaceholder?: string
}

const durationOptions = [
  { value: "2-hours", label: "Two hours" },
  { value: "3-hours", label: "Three hours" },
  { value: "4-hours", label: "Four hours" },
  { value: "all-day", label: "All day" },
  { value: "multiple-days", label: "Multiple days" },
]

const bookingTypeOptionsByTalent: Record<HireRequestSheetProps["talentType"], string[]> = {
  creator: [
    "Wedding",
    "Maternity shoot",
    "Portraits",
    "Event",
    "Brand shoot",
    "Fashion shoot",
    "Product shoot",
    "Music video",
    "Other",
  ],
  crew: [
    "Commercial production",
    "Film production",
    "Music video",
    "Interview setup",
    "Event coverage",
    "Post-production",
    "Documentary",
    "Other",
  ],
  studio: [
    "Studio booking",
    "Photo shoot",
    "Video shoot",
    "Podcast recording",
    "Commercial shoot",
    "Full-day studio hire",
    "Multiple-day booking",
    "Other",
  ],
  store: [
    "Camera rental",
    "Lens rental",
    "Lighting rental",
    "Audio gear rental",
    "Props rental",
    "Full kit rental",
    "Multiple-day rental",
    "Other",
  ],
}

const defaultBriefPlaceholders: Record<HireRequestSheetProps["talentType"], string> = {
  creator: "Example: maternity shoot, 3 hours, natural light, 12 edited photos, Cape Town CBD...",
  crew: "Example: brand shoot, 4 hours, two-camera setup, sound, lighting, Cape Town CBD...",
  studio: "Example: studio booking, all day, natural light, parking, changing area, Cape Town...",
  store: "Example: camera rental, two days, Sony FX kit, tripod, lights, pickup in Johannesburg...",
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateKey(key?: string) {
  if (!key) return null
  const [year, month, day] = key.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 12)
}

function formatShortDate(key?: string) {
  const parsed = parseDateKey(key)
  if (!parsed) return ""
  return parsed.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getInclusiveRangeDays(startKey?: string, endKey?: string) {
  const start = parseDateKey(startKey)
  const end = parseDateKey(endKey || startKey)
  if (!start || !end) return 0
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
}

function isBetweenDateKeys(key: string, startKey?: string, endKey?: string) {
  if (!startKey || !endKey) return false
  return key > startKey && key < endKey
}

function buildDateOption(date: Date) {
  return {
    key: formatDateKey(date),
    day: date.toLocaleDateString("en-ZA", { day: "2-digit" }),
    label: date.toLocaleDateString("en-ZA", { weekday: "short" }),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
  }
}

function buildMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1, 12)
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
  const cells: Array<ReturnType<typeof buildDateOption> | null> = Array.from({ length: firstDay.getDay() }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(buildDateOption(new Date(year, month, day, 12)))
  }

  return cells
}

function buildDateOptions(initialDate?: string) {
  const options = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return buildDateOption(date)
  })

  if (initialDate && !options.some((option) => option.key === initialDate)) {
    const parsed = new Date(`${initialDate}T12:00:00`)
    if (!Number.isNaN(parsed.getTime())) {
      return [buildDateOption(parsed), ...options]
    }
  }

  return options
}

export function HireRequestSheet({
  open,
  onOpenChange,
  talentId,
  talentName,
  talentType,
  priceLabel,
  initialDate,
  bookingTypeOptions,
  bookingTypeLabel,
  bookingTypePlaceholder,
  durationLabel,
  briefLabel = "What do you need?",
  briefPlaceholder,
}: HireRequestSheetProps) {
  const dateOptions = useMemo(() => buildDateOptions(initialDate), [initialDate])
  const finalBookingTypeOptions = useMemo(
    () => bookingTypeOptions?.filter(Boolean) || bookingTypeOptionsByTalent[talentType],
    [bookingTypeOptions, talentType],
  )
  const [selectedStartDate, setSelectedStartDate] = useState(initialDate || dateOptions[0]?.key || "")
  const [selectedEndDate, setSelectedEndDate] = useState("")
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [monthCursor, setMonthCursor] = useState(() => parseDateKey(initialDate || dateOptions[0]?.key) || new Date())
  const [bookingType, setBookingType] = useState("")
  const [duration, setDuration] = useState("all-day")
  const [brief, setBrief] = useState("")
  const [sent, setSent] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const isListingBooking = talentType === "studio" || talentType === "store"
  const titleTarget = isListingBooking ? talentName : talentName.split(" ")[0]
  const actionLabel = isListingBooking ? "booking" : "hire"
  const monthCells = useMemo(() => buildMonthCells(monthCursor), [monthCursor])
  const selectedRangeDays = getInclusiveRangeDays(selectedStartDate, selectedEndDate)
  const needsRange = duration === "multiple-days"
  const hasRequiredRange = !needsRange || Boolean(selectedEndDate)
  const dateSummary = selectedEndDate
    ? `${formatShortDate(selectedStartDate)} - ${formatShortDate(selectedEndDate)} - ${selectedRangeDays} days`
    : `${formatShortDate(selectedStartDate)} - 1 day`
  const confirmLabel = isListingBooking ? "Confirm booking" : "Confirm hire"

  useEffect(() => {
    if (!open) return
    const nextDate = initialDate || dateOptions[0]?.key || ""
    setSelectedStartDate(nextDate)
    setSelectedEndDate("")
    setMonthCursor(parseDateKey(nextDate) || new Date())
    setShowMonthPicker(false)
    setBookingType("")
    setIsClosing(false)
  }, [dateOptions, initialDate, open, talentId])

  const handleDateSelect = (dateKey: string) => {
    if (!selectedStartDate || selectedEndDate || dateKey < selectedStartDate) {
      setSelectedStartDate(dateKey)
      setSelectedEndDate("")
      return
    }

    if (dateKey === selectedStartDate) {
      setSelectedEndDate("")
      return
    }

    setSelectedEndDate(dateKey)
  }

  const requestClose = () => {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      setIsClosing(false)
      onOpenChange(false)
    }, 560)
  }

  const handleSubmit = () => {
    const request = {
      id: `hire-${Date.now()}`,
      talentId,
      talentName,
      talentType,
      bookingType,
      selectedDate: selectedStartDate,
      selectedEndDate: selectedEndDate || selectedStartDate,
      dateRangeDays: selectedRangeDays,
      duration,
      brief,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    try {
      const current = JSON.parse(window.localStorage.getItem("snapscout_hire_requests") || "[]")
      window.localStorage.setItem("snapscout_hire_requests", JSON.stringify([request, ...current]))
    } catch {
      window.localStorage.setItem("snapscout_hire_requests", JSON.stringify([request]))
    }

    setSent(true)
    window.setTimeout(() => {
      setSent(false)
      setBrief("")
      requestClose()
    }, 900)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true)
          return
        }
        requestClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed bottom-0 left-0 right-0 top-auto z-[80] flex max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e5e9f2] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:left-1/2 sm:top-1/2 sm:max-h-[92dvh] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:border",
          isClosing && "translate-y-[112%] opacity-0 sm:translate-y-6",
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
        <DialogHeader className="border-b border-[#e8edf5] bg-white px-5 pb-4 pt-4 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[22px] leading-tight">
                {isListingBooking ? "Book" : "Hire"} {titleTarget}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Send a {actionLabel} request with date, time, and project details.
              </DialogDescription>
            </div>
            <motion.button
              type="button"
              onClick={requestClose}
              aria-label="Close hire request"
              whileTap={{ scale: 0.9, rotate: -8 }}
              animate={isClosing ? { opacity: 0, scale: 0.7, rotate: 45 } : { opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm transition-colors hover:bg-[#f6f8fc]"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5">
          <div className="rounded-[22px] border border-[#e8edf5] bg-[#f8fafc] p-4">
            <p className="text-[12px] text-[#667085]">Starting from</p>
            <p className="mt-1 font-mono text-[30px] font-black leading-none">{priceLabel}</p>
          </div>

          <div className="mt-5">
            <div className="mb-5 grid gap-2">
              <Label className="text-[14px] font-bold">
                {bookingTypeLabel ||
                  (talentType === "creator"
                    ? "What type of shoot are you booking?"
                    : talentType === "crew"
                      ? "What type of production is this?"
                      : "What are you booking?")}
              </Label>
              <Select value={bookingType} onValueChange={setBookingType}>
                <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                  <SelectValue placeholder={bookingTypePlaceholder || "Select booking type"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-white">
                  {finalBookingTypeOptions.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-xl py-3">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <Label className="text-[14px] font-bold">Select date</Label>
              <motion.button
                type="button"
                onClick={() => setShowMonthPicker((value) => !value)}
                whileTap={{ scale: 0.9, rotate: -5 }}
                className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-[#f20d14] transition-colors hover:bg-red-100"
                aria-label="Open monthly calendar"
              >
                <CalendarDays className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dateOptions.map((date) => {
                const active = selectedStartDate === date.key || selectedEndDate === date.key
                const inRange = isBetweenDateKeys(date.key, selectedStartDate, selectedEndDate)
                return (
                  <motion.button
                    key={date.key}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleDateSelect(date.key)}
                    className={`grid min-h-[76px] min-w-[64px] place-items-center rounded-2xl border px-2 text-center ${
                      active
                        ? "border-[#f20d14] bg-[#f20d14] text-white"
                        : inRange
                          ? "border-red-100 bg-red-50 text-[#f20d14]"
                        : "border-[#e8edf5] bg-white text-[#111318]"
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{date.label}</span>
                    <span className="font-mono text-[22px] font-black leading-none">{date.day}</span>
                    <span className="text-[11px]">{date.month}</span>
                  </motion.button>
                )
              })}
            </div>
            <p className="mt-2 text-[12px] font-medium text-[#667085]">
              {dateSummary}
              {needsRange && !selectedEndDate ? " - choose an end date" : ""}
            </p>

            {showMonthPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mt-3 rounded-[24px] border border-[#e8edf5] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12))
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e7f1] bg-white"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.button>
                  <p className="text-[14px] font-bold">
                    {monthCursor.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12))
                    }
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e1e7f1] bg-white"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-[#98a2b3]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span key={`${day}-${index}`}>{day}</span>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1">
                  {monthCells.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="h-10" />
                    const active = selectedStartDate === date.key || selectedEndDate === date.key
                    const inRange = isBetweenDateKeys(date.key, selectedStartDate, selectedEndDate)
                    return (
                      <motion.button
                        key={date.key}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleDateSelect(date.key)}
                        className={`grid h-10 place-items-center rounded-2xl border text-[13px] font-semibold ${
                          active
                            ? "border-[#f20d14] bg-[#f20d14] text-white"
                            : inRange
                              ? "border-red-100 bg-red-50 text-[#f20d14]"
                              : "border-transparent bg-[#f8fafc] text-[#111318]"
                        }`}
                      >
                        {date.day}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-5 grid gap-2">
            <Label className="text-[14px] font-bold">
              {durationLabel || (talentType === "studio" ? "How long do you need the space?" : talentType === "store" ? "How long do you need the rental?" : "How long do you need them?")}
            </Label>
            <Select
              value={duration}
              onValueChange={(value) => {
                setDuration(value)
                if (value === "multiple-days") setShowMonthPicker(true)
              }}
            >
              <SelectTrigger className="h-[52px] rounded-2xl border-[#e1e7f1] bg-white px-4 text-[14px]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-white">
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-xl py-3">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 grid gap-2">
            <Label className="text-[14px] font-bold">{briefLabel}</Label>
            <Textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder={briefPlaceholder || defaultBriefPlaceholders[talentType]}
              className="min-h-[118px] rounded-2xl border-[#e1e7f1] bg-white text-[14px]"
            />
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-[#e8edf5] bg-white px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_26px_rgba(15,23,42,0.08)]">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedStartDate || !duration || !bookingType || !hasRequiredRange || sent}
            className="h-[56px] w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d9070d]"
          >
            {sent ? (
              <>
                <Check className="h-4.5 w-4.5" />
                Request sent
              </>
            ) : (
              <>
                <Send className="h-4.5 w-4.5" />
                {confirmLabel}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
