"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MessagingProvider, useMessaging } from "@/components/messaging/supabase-messaging-provider"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatView } from "@/components/messaging/chat-view"
import { NewConversationModal } from "@/components/messaging/new-conversation-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquarePlus } from "lucide-react"

function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { selectConversation, createConversation, currentUserId, loading } = useMessaging()

  const handledParamsRef = useRef(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (loading || !currentUserId || handledParamsRef.current) return

    const handleUrlParams = async () => {
      handledParamsRef.current = true

      const recipientId = searchParams.get("recipient")
      const conversationId = searchParams.get("conversation")

      if (conversationId) {
        setSelectedConversationId(conversationId)
        await selectConversation(conversationId)
      } else if (recipientId) {
        const newConvoId = await createConversation(recipientId)
        if (newConvoId) {
          setSelectedConversationId(newConvoId)
          await selectConversation(newConvoId)
          // Clear URL params without reload
          window.history.replaceState({}, "", "/messages")
        }
      }
    }

    handleUrlParams()
  }, [loading, currentUserId, searchParams, selectConversation, createConversation])

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversationId(conversationId)
    await selectConversation(conversationId)
  }

  const handleBack = () => {
    setSelectedConversationId(null)
  }

  const handleConversationCreated = async (conversationId: string) => {
    setSelectedConversationId(conversationId)
    await selectConversation(conversationId)
  }

  if (!loading && !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view messages</p>
          <Button onClick={() => router.push("/auth/login?redirect=/messages")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Conversation List */}
      <div
        className={`${isMobile ? (selectedConversationId ? "hidden" : "w-full") : "w-80 border-r border-border"} flex flex-col`}
      >
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
          </div>
          <Button
            onClick={() => setShowNewModal(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList onSelect={handleConversationSelect} selectedId={selectedConversationId} />
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex-1 ${isMobile ? (selectedConversationId ? "block" : "hidden") : "block"}`}>
        {selectedConversationId ? (
          <ChatView onBack={isMobile ? handleBack : undefined} />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/10">
            <div className="text-center">
              <MessageSquarePlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">No conversation selected</h2>
              <p className="text-muted-foreground mb-4">Choose a conversation or start a new one</p>
              <Button
                onClick={() => setShowNewModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      <NewConversationModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <MessagingProvider>
      <MessagesContent />
    </MessagingProvider>
  )
}
