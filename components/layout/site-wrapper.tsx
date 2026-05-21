"use client"

import type React from "react"
import MobilePreviewFrame from "@/components/mobile/mobile-preview-frame"

export default function SiteWrapper({ children }: { children: React.ReactNode }) {
  return <MobilePreviewFrame>{children}</MobilePreviewFrame>
}
