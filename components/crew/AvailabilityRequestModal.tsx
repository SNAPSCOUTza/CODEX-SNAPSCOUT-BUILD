"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Loader2, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CrewPoolMember } from "@/types/crew-pool"

type AvailabilityRequestModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  poolId: string
  selectedMembers: CrewPoolMember[]
}

export function AvailabilityRequestModal({
  open,
  onOpenChange,
  poolId,
  selectedMembers,
}: AvailabilityRequestModalProps) {
  const router = useRouter()
  const [shootDate, setShootDate] = useState("")
  const [projectName, setProjectName] = useState("")
  const [location, setLocation] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!shootDate) {
      setError("Choose a shoot date first.")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/availability-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shoot_date: shootDate,
          shoot_location: location,
          project_name: projectName,
          note,
          crew_member_ids: selectedMembers.map((member) => member.profile_id),
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not send request")

      onOpenChange(false)
      router.push(`/crew-pools/${poolId}/availability/${payload.request.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-[#e7edf5] bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Check availability</DialogTitle>
          <DialogDescription>Send a one-tap availability request to selected crew.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shoot-date">Shoot date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
                <Input
                  id="shoot-date"
                  type="date"
                  value={shootDate}
                  onChange={(event) => setShootDate(event.target.value)}
                  className="h-12 rounded-2xl bg-white pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Nike campaign"
                className="h-12 rounded-2xl bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shoot-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647084]" />
              <Input
                id="shoot-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Woodstock, Cape Town"
                className="h-12 rounded-2xl bg-white pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note to crew</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Arrive camera-ready. Parking available."
              className="min-h-28 rounded-2xl bg-white"
            />
          </div>

          <div className="rounded-3xl border border-[#e7edf5] bg-[#f8fafc] p-4">
            <p className="text-sm font-semibold">{selectedMembers.length} selected crew</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <span key={member.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                  {member.profile?.full_name || "Crew member"}
                </span>
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button
            type="button"
            disabled={submitting || selectedMembers.length === 0}
            onClick={submit}
            className="h-12 w-full rounded-full bg-[#ef1218] text-white hover:bg-[#d90d12]"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send availability check
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
