"use client"

import type { ComponentType, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  CircleUserRound,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Users,
  FolderKanban,
} from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveMenu, type InteractiveMenuItem } from "@/components/ui/modern-mobile-menu"
import StaggeredMenu, { type StaggeredMenuItem } from "@/components/ui/staggered-menu"
import { useAuth } from "@/contexts/auth-context"

type MobileShellProps = {
  title: string
  rightAction?: ReactNode
  children: ReactNode
}

type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const bottomNavItems: NavItem[] = [
  { label: "Explore", href: "/", icon: Compass },
  { label: "Bookings", href: "/dashboard", icon: CalendarDays },
  { label: "Hire", href: "/find-crew", icon: Briefcase },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/dashboard", icon: CircleUserRound },
]

const interactiveNavItems: InteractiveMenuItem[] = bottomNavItems.map((item) => ({
  label: item.label,
  icon: item.icon,
  href: item.href,
}))

const menuItems: StaggeredMenuItem[] = [
  { label: "Home", link: "/", ariaLabel: "Go to home page", icon: Home },
  { label: "Find Crew", link: "/find-crew", ariaLabel: "Find crew members", icon: Users },
  { label: "Creators", link: "/creators", ariaLabel: "Browse creators", icon: Camera },
  { label: "Studios", link: "/studios-stores", ariaLabel: "Browse studios and stores", icon: Building2 },
]

const baseQuickMenuItems: StaggeredMenuItem[] = [
  { label: "Community", link: "/community", ariaLabel: "Open community page", icon: Compass },
  { label: "Messages", link: "/messages", ariaLabel: "Open messages", icon: MessageCircle },
  { label: "Saved Profiles", link: "/saved-profiles", ariaLabel: "Open saved profiles", icon: Heart },
]

export default function MobileShell({ title, rightAction, children }: MobileShellProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showBottomNav, setShowBottomNav] = useState(true)
  const [crewPoolCount, setCrewPoolCount] = useState(0)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (!user) {
      setCrewPoolCount(0)
      return
    }

    let active = true
    fetch("/api/crew-pools", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (active) setCrewPoolCount(Array.isArray(payload?.pools) ? payload.pools.length : 0)
      })
      .catch(() => {
        if (active) setCrewPoolCount(0)
      })

    return () => {
      active = false
    }
  }, [user])

  const quickMenuItems = useMemo(
    () =>
      user
        ? [
            {
              label: "Crew Pools",
              link: "/crew-pools",
              ariaLabel: "Open crew pools",
              icon: FolderKanban,
              badgeCount: crewPoolCount,
            },
            ...baseQuickMenuItems,
          ]
        : baseQuickMenuItems,
    [crewPoolCount, user],
  )

  const activeBottomHref = useMemo(() => {
    if (pathname.startsWith("/find-crew") || pathname.startsWith("/creators") || pathname.startsWith("/crew/")) {
      return "/find-crew"
    }
    if (pathname.startsWith("/messages")) return "/messages"
  if (pathname.startsWith("/profile") || pathname.startsWith("/dashboard")) return "/dashboard"
    if (pathname.startsWith("/dashboard")) return "/dashboard"
    return "/"
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return

    lastScrollY.current = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      if (currentY <= 18) {
        setShowBottomNav(true)
      } else if (delta > 8) {
        setShowBottomNav(false)
      } else if (delta < -8) {
        setShowBottomNav(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-[#0b0b0d]">
      <div className="w-full flex-1 px-1.5 pb-[calc(108px+env(safe-area-inset-bottom))] pt-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut", delay: 0.04 }}
          className="mt-3 flex items-center justify-between"
        >
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/" aria-label="SnapScout home">
              <Image src="/images/snapscout-circular-logo.png" alt="SnapScout" width={56} height={56} className="h-14 w-14" />
            </Link>
          </motion.div>
          <h1 className="text-[17px] font-semibold">{title}</h1>
          <div className="h-11 w-11" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.08 }}
          className="mt-6 [&_button]:transition-transform [&_button]:duration-150 [&_button:active]:scale-[0.97]"
        >
          <div className="[&_a]:transition-transform [&_a]:duration-150 [&_a:active]:scale-[0.98]">{children}</div>
        </motion.div>
      </div>

      <motion.nav
        initial={false}
        animate={{
          y: showBottomNav ? 0 : 150,
          opacity: showBottomNav ? 1 : 0,
        }}
        transition={{ duration: 0.26, ease: "easeOut" }}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-1.5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-white/98 backdrop-blur-md" />
        <div className="pointer-events-auto">
          <InteractiveMenu items={interactiveNavItems} activeHref={activeBottomHref} accentColor="#f20d14" />
        </div>
      </motion.nav>

      <StaggeredMenu
        className="md:hidden"
        isFixed
        position="right"
        items={menuItems}
        quickItems={quickMenuItems}
        displaySocials={false}
        displayItemNumbering={false}
        menuButtonColor="#f20d14"
        openMenuButtonColor="#6b7280"
        changeMenuColorOnOpen
        colors={["#f3f6fb", "#ffffff"]}
        accentColor="#f20d14"
        showBackdrop={false}
        topOffset="26px"
        panelFooter={rightAction}
      />
    </div>
  )
}
