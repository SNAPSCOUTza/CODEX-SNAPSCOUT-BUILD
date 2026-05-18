"use client"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface MessageButtonProps {
  recipientId: string
  recipientName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function MessageButton({ recipientId, recipientName, variant = "outline", size = "icon" }: MessageButtonProps) {
  const router = useRouter()

  const handleStartConversation = () => {
    router.push(`/messages?recipient=${recipientId}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      className={`bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border-border ${
        size === "icon" ? "rounded-full" : ""
      }`}
      aria-label={`Message ${recipientName}`}
    >
      <MessageCircle className="h-4 w-4" />
      {size !== "icon" && <span className="ml-2">Message</span>}
    </Button>
  )
}
