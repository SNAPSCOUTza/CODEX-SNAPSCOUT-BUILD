"use client"

import { useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface PortfolioItem {
  id: string
  type: "image" | "video"
  thumbnail: string
  fullUrl?: string
  title?: string
  platform?: "instagram" | "youtube" | "vimeo" | "facebook" | "local"
  duration?: number
  link?: string
}

interface PortfolioLightboxProps {
  items: PortfolioItem[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onHire?: () => void
}

const platformColors: Record<string, string> = {
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  youtube: "bg-red-500",
  vimeo: "bg-blue-500",
  facebook: "bg-blue-600",
  local: "bg-gray-500",
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const extractYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

const extractVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function PortfolioLightbox({ items, currentIndex, onClose, onNext, onPrev, onHire }: PortfolioLightboxProps) {
  const currentItem = items[currentIndex]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    },
    [onClose, onNext, onPrev],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2"
        aria-label="Close lightbox"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Previous Button */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        aria-label="Previous item"
      >
        <ChevronLeft className="h-12 w-12" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        aria-label="Next item"
      >
        <ChevronRight className="h-12 w-12" />
      </button>

      {/* Content */}
      <div className="max-w-5xl w-full max-h-[90vh] relative px-16">
        {currentItem.type === "video" ? (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {currentItem.platform === "youtube" && currentItem.link && (
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(currentItem.link)}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {currentItem.platform === "vimeo" && currentItem.link && (
              <iframe
                src={`https://player.vimeo.com/video/${extractVimeoId(currentItem.link)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
            {(currentItem.platform === "local" || !currentItem.link) && (
              <video src={currentItem.fullUrl || currentItem.thumbnail} controls autoPlay className="w-full h-full" />
            )}
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <Image
              src={currentItem.fullUrl || currentItem.thumbnail}
              alt={currentItem.title || "Portfolio item"}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        )}

        {/* Info Bar */}
        <div className="absolute bottom-0 left-16 right-16 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {currentItem.platform && (
                <Badge className={`${platformColors[currentItem.platform]} text-white border-0`}>
                  {currentItem.platform}
                </Badge>
              )}
              {currentItem.title && <span className="font-medium">{currentItem.title}</span>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {currentIndex + 1} / {items.length}
              </span>
              {currentItem.link && (
                <Button variant="outline" size="sm" className="bg-transparent text-white border-white/50" asChild>
                  <a href={currentItem.link} target="_blank" rel="noopener noreferrer">
                    View Original <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {onHire && (
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={onHire}>
                  Hire Creator
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
