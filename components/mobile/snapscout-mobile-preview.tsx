"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Briefcase, ChevronRight, Compass, Search, SlidersHorizontal, Users } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import MobileShell from "@/components/mobile/mobile-shell"

const featuredCards = [
  {
    title: "Urban Loft Studio",
    city: "Cape Town",
    price: "R850 /hr",
    href: "/studios",
    image: "/images/photography-workspace.jpg",
  },
  {
    title: "Top Creators",
    city: "Johannesburg",
    price: "From R950 /day",
    href: "/creators",
    image: "/images/camera-viewfinder.jpg",
  },
  {
    title: "Film Crew",
    city: "Nationwide",
    price: "Browse profiles",
    href: "/find-crew",
    image: "/images/film-clapperboard.jpg",
  },
]

export default function SnapScoutMobilePreview() {
  const [splashState, setSplashState] = useState<"playing" | "done">("playing")

  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.innerWidth >= 768) {
      setSplashState("done")
      return
    }

    const splashKey = "snapscout-mobile-splash-v1"
    const alreadySeen = window.sessionStorage.getItem(splashKey) === "1"

    if (alreadySeen) {
      setSplashState("done")
      return
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(splashKey, "1")
      setSplashState("done")
    }, 2400)

    return () => window.clearTimeout(timer)
  }, [])

  const splashPlaying = splashState === "playing"

  return (
    <MobileShell title="Explore">
      <>
        <motion.div
          initial={false}
          animate={splashPlaying ? { clipPath: "circle(0% at 50% 78%)" } : { clipPath: "circle(150% at 50% 78%)" }}
          transition={{
            duration: splashPlaying ? 0 : 1.08,
            ease: [0.22, 1, 0.36, 1],
            delay: splashPlaying ? 0 : 0.08,
          }}
          className="will-change-[clip-path]"
        >
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-[34px] border border-[#ece4da] bg-[#fffaf4] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
          >
            <h2 className="max-w-[11ch] text-[48px] font-black leading-[0.94] tracking-[-0.03em] text-[#0b0b0d]">
              Find. Book. Shoot.
              <span className="block text-[#f20d14]">Done.</span>
            </h2>
            <p className="mt-5 max-w-[22ch] text-[17px] leading-7 text-[#1f232b]">
              Browse verified creatives, discover studios, and book your next production setup in one place.
            </p>

            <motion.div whileTap={{ scale: 0.99 }}>
              <Link
                href="/find-crew"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e7e0d6] bg-white px-4 py-3"
              >
                <Search className="h-4.5 w-4.5 text-[#6f6f73]" />
                <span className="text-[14px] text-[#6f6f73]">Search locations or talent...</span>
                <span className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6]">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-[#0b0b0d]" />
                </span>
              </Link>
            </motion.div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {[
                { label: "All", icon: Compass, href: "/" },
                { label: "Creatives", icon: Users, href: "/creators" },
                { label: "Studios", icon: Briefcase, href: "/studios" },
                { label: "Stores", icon: Briefcase, href: "/studios-stores" },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.label} whileTap={{ scale: 0.94 }}>
                    <Link
                      href={item.href}
                      className={`flex min-w-[78px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium ${
                        index === 0 ? "border-b-2 border-[#f20d14] text-[#0b0b0d]" : "text-[#34353a]"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#0b0b0d]">Featured</h3>
                <Link href="/find-crew" className="text-[13px] font-medium text-[#f20d14]">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {featuredCards.map((item) => (
                  <motion.div key={item.title} whileTap={{ scale: 0.97 }}>
                    <Link href={item.href}>
                      <div className="relative h-[142px] overflow-hidden rounded-[18px] border border-[#ece4da] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <p className="mt-2 text-[12px] font-semibold leading-tight text-[#0b0b0d]">{item.title}</p>
                      <p className="text-[11px] text-[#6f6f73]">{item.city}</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-[#0b0b0d]">{item.price}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button asChild className="h-12 rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]">
                <Link href="/find-crew">
                  Hire a Creative
                  <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-[#e7e0d6] bg-white text-[15px]">
                <Link href="/studios-stores">Find a Studio</Link>
              </Button>
            </div>
          </motion.section>
        </motion.div>

        <AnimatePresence>
          {splashPlaying && (
            <motion.div
              key="mobile-splash"
              className="fixed inset-0 z-[80] bg-[#fffcf7]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                clipPath: "circle(0% at 50% 78%)",
                transition: { duration: 1.06, ease: [0.22, 1, 0.36, 1] },
              }}
              transition={{ duration: 0.88, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="relative h-full w-full"
              >
                <Image
                  src="/images/snapscout-mobile-splash.png"
                  alt="SnapScout mobile splash screen"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </MobileShell>
  )
}
