"use client"
import type React from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface MessageButtonProps {
  recipientId: string
  recipientName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function MessageButton({
  recipientId,
  recipientName,
  variant = "outline",
  size = "icon",
  className,
  children,
}: MessageButtonProps) {
  const router = useRouter()

  const handleStartConversation = () => {
    router.push(`/messages?recipient=${recipientId}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      className={cn(
        "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border-border",
        size === "icon" ? "rounded-full" : "",
        className,
      )}
      aria-label={`Message ${recipientName}`}
    >
      <MessageCircle className="h-4 w-4" />
      {children || (size !== "icon" && <span className="ml-2">Message</span>)}
    </Button>
  )
}
