"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface SaveProfileButtonProps {
  profileId: string
  profileName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SaveProfileButton({
  profileId,
  profileName,
  variant = "ghost",
  size = "icon",
  className,
}: SaveProfileButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const initRef = useRef(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        checkIfSaved(session.user.id)
      }
    }
    initAuth()
  }, [profileId])

  const checkIfSaved = async (uid: string) => {
    try {
      const { data } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", uid)
        .eq("favorited_user_id", profileId)
        .maybeSingle()

      setIsSaved(!!data)
    } catch (error) {
      // Silent fail - just show as not saved
    }
  }

  const handleToggleSave = async () => {
    if (!userId) return

    try {
      setIsLoading(true)

      if (isSaved) {
        await supabase.from("user_favorites").delete().eq("user_id", userId).eq("favorited_user_id", profileId)

        setIsSaved(false)
      } else {
        await supabase.from("user_favorites").insert({
          user_id: userId,
          favorited_user_id: profileId,
        })

        setIsSaved(true)
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }

  if (!userId) return null

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={cn(isSaved ? "text-primary" : "text-muted-foreground", "hover:text-primary", className)}
      aria-label={isSaved ? `Remove ${profileName} from favorites` : `Save ${profileName} to favorites`}
    >
      <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
    </Button>
  )
}
