"use client"

import type { ComponentType, ReactNode } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Briefcase, CalendarDays, CircleUserRound, Compass, Menu, MessageCircle, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { CommunityNavLink } from "@/components/community/community-nav-link"
import { InteractiveMenu, type InteractiveMenuItem } from "@/components/ui/modern-mobile-menu"

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
  { label: "Profile", href: "/profile/preview", icon: CircleUserRound },
]

const interactiveNavItems: InteractiveMenuItem[] = bottomNavItems.map((item) => ({
  label: item.label,
  icon: item.icon,
  href: item.href,
}))

const menuItems: Array<{ label: string; href: string }> = [
  { label: "Home", href: "/" },
  { label: "Find Crew", href: "/find-crew" },
  { label: "Creators", href: "/creators" },
  { label: "Studios & Stores", href: "/studios-stores" },
  { label: "Community", href: "/community" },
  { label: "Messages", href: "/messages" },
  { label: "Saved Profiles", href: "/saved-profiles" },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function MobileShell({ title, rightAction, children }: MobileShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const activeBottomHref = useMemo(() => {
    if (pathname.startsWith("/find-crew") || pathname.startsWith("/creators") || pathname.startsWith("/crew/")) {
      return "/find-crew"
    }
    if (pathname.startsWith("/messages")) return "/messages"
    if (pathname.startsWith("/profile")) return "/profile/preview"
    if (pathname.startsWith("/dashboard")) return "/dashboard"
    return "/"
  }, [pathname])

  return (
    <div className="min-h-[100dvh] bg-[#fffcf7] text-[#0b0b0d]">
      <div className="w-full px-4 pb-24 pt-3">
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
          <div className="flex items-center gap-2">
            <CommunityNavLink iconOnly className="h-11 w-11 border border-[#ece5db] bg-white p-0 text-[#f20d14] hover:bg-[#fff1f1]" />
            <motion.button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              whileTap={{ scale: 0.94 }}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`grid h-11 w-11 place-items-center rounded-full border border-[#ece5db] text-[#f20d14] transition-colors duration-150 ${
                menuOpen ? "bg-[#fff1f1]" : "bg-white hover:bg-[#fff1f1]"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.84 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.84 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="grid place-items-center"
                >
                  {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
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

      <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
        <InteractiveMenu items={interactiveNavItems} activeHref={activeBottomHref} accentColor="#f20d14" />
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black/35"
            role="dialog"
            aria-modal="true"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
              className="absolute right-0 top-0 h-full w-[88%] max-w-[380px] border-l border-[#e7ded2] bg-[#fffaf4] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold">Menu</p>
              <motion.button
                type="button"
                aria-label="Close menu"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ece5db] bg-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="mt-5 grid gap-2">
              {menuItems.map((item) => (
                <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-2xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                      isActive(pathname, item.href)
                        ? "border-[#f20d14] bg-[#fff2f2] text-[#f20d14]"
                        : "border-[#ece4da] bg-white text-[#1b1c1f] hover:bg-[#fff7f0]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {rightAction ? (
              <div className="mt-6 border-t border-[#ece4da] pt-5" onClick={() => setMenuOpen(false)}>
                {rightAction}
              </div>
            ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
