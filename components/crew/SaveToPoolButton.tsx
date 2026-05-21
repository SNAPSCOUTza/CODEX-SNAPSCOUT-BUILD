"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Bookmark, Check, FolderPlus, Loader2, Plus, X } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { CrewPool } from "@/types/crew-pool"
import { cn } from "@/lib/utils"

type SaveToPoolButtonProps = {
  profileId: string
  profileName: string
  className?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

export function SaveToPoolButton({
  profileId,
  profileName,
  className,
  variant = "outline",
  size = "default",
}: SaveToPoolButtonProps) {
  const [open, setOpen] = useState(false)
  const [pools, setPools] = useState<CrewPool[]>([])
  const [savedPoolIds, setSavedPoolIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [busyPoolId, setBusyPoolId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [newPoolName, setNewPoolName] = useState("")
  const [creating, setCreating] = useState(false)

  const isSaved = savedPoolIds.size > 0

  const label = useMemo(() => {
    if (size === "icon") return ""
    return isSaved ? "Saved" : "Save to Pool"
  }, [isSaved, size])

  const fetchPools = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/crew-pools", { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load pools")

      const nextPools: CrewPool[] = payload.pools || []
      setPools(nextPools)

      const savedIds = new Set<string>()
      await Promise.all(
        nextPools.map(async (pool) => {
          const membersResponse = await fetch(`/api/crew-pools/${pool.id}/members`, { credentials: "include" })
          if (!membersResponse.ok) return
          const membersPayload = await membersResponse.json()
          const exists = (membersPayload.members || []).some((member: any) => member.profile_id === profileId)
          if (exists) savedIds.add(pool.id)
        }),
      )
      setSavedPoolIds(savedIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pools")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchPools()
  }, [open])

  const togglePool = async (pool: CrewPool) => {
    setBusyPoolId(pool.id)
    setError("")
    const alreadySaved = savedPoolIds.has(pool.id)

    try {
      const response = await fetch(
        alreadySaved
          ? `/api/crew-pools/${pool.id}/members/${profileId}`
          : `/api/crew-pools/${pool.id}/members`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: alreadySaved ? undefined : JSON.stringify({ profile_id: profileId }),
        },
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Could not update pool")

      setSavedPoolIds((prev) => {
        const next = new Set(prev)
        if (alreadySaved) next.delete(pool.id)
        else next.add(pool.id)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update pool")
    } finally {
      setBusyPoolId(null)
    }
  }

  const createInlinePool = async () => {
    if (!newPoolName.trim()) return
    setCreating(true)
    setError("")
    try {
      const response = await fetch("/api/crew-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newPoolName.trim() }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not create pool")

      setPools((prev) => [payload.pool, ...prev])
      setNewPoolName("")
      await togglePool(payload.pool)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create pool")
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
        className={cn(
          "rounded-full",
          isSaved && "border-[#ef1218] bg-red-50 text-[#ef1218] hover:bg-red-100",
          className,
        )}
      >
        <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed bottom-0 top-auto max-h-[86vh] translate-y-0 rounded-t-[30px] border-[#e7edf5] bg-white p-0 sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]">
          <div className="border-b border-[#e7edf5] px-5 py-5">
            <DialogHeader>
              <DialogTitle>Save {profileName}</DialogTitle>
              <DialogDescription>Add this profile to one or more crew pools.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="no-scrollbar max-h-[62vh] space-y-3 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-[#647084]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading pools...
              </div>
            ) : pools.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#dfe6ef] bg-[#f8fafc] p-5 text-center">
                <FolderPlus className="mx-auto h-8 w-8 text-[#647084]" />
                <p className="mt-3 font-semibold">No pools yet</p>
                <p className="mt-1 text-sm text-[#647084]">Create your first pool below.</p>
              </div>
            ) : (
              pools.map((pool) => {
                const saved = savedPoolIds.has(pool.id)
                return (
                  <motion.button
                    key={pool.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePool(pool)}
                    className="flex w-full items-center justify-between rounded-3xl border border-[#e1e8f0] bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pool.color }} />
                      <span>
                        <span className="block font-semibold">{pool.name}</span>
                        <span className="text-xs text-[#647084]">{pool.member_count || 0} saved profiles</span>
                      </span>
                    </span>
                    {busyPoolId === pool.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#647084]" />
                    ) : saved ? (
                      <Check className="h-5 w-5 text-[#ef1218]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#647084]" />
                    )}
                  </motion.button>
                )
              })
            )}

            <div className="flex gap-2 pt-2">
              <Input
                value={newPoolName}
                onChange={(event) => setNewPoolName(event.target.value)}
                placeholder="Create new pool"
                className="h-12 rounded-full bg-white"
              />
              <Button
                type="button"
                disabled={creating || !newPoolName.trim()}
                onClick={createInlinePool}
                className="h-12 rounded-full bg-[#111318] px-5 text-white hover:bg-black"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">
                <X className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
