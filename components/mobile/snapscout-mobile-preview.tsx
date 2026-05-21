"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  MapPin,
  MoreHorizontal,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import MobileShell from "@/components/mobile/mobile-shell"
import { useAuth } from "@/contexts/auth-context"
import { communitySuccessStories, regionalGroups, upcomingCommunityEvents } from "@/lib/community-data"

const featuredCards = [
  {
    title: "Urban Loft Studio",
    city: "Cape Town",
    price: "R850 /hr",
    href: "/studios-stores/1",
    image: "/images/photography-workspace.jpg",
  },
  {
    title: "City View Rooftop",
    city: "Johannesburg",
    price: "R950 /hr",
    href: "/studios-stores/2",
    image: "/images/camera-viewfinder.jpg",
  },
  {
    title: "Warehouse Space",
    city: "Durban",
    price: "R650 /hr",
    href: "/studios-stores/3",
    image: "/images/film-clapperboard.jpg",
  },
]

const previewVideoUrl = "https://www.youtube.com/watch?v=cpQKutRoglo"

const monthlyPlans = [
  {
    name: "Scout",
    price: "Free",
    detail: "Browse profiles, save favorites, and message creatives.",
  },
  {
    name: "Creators & Crew",
    price: "R129",
    detail: "Create a public profile, show rates, portfolio, availability, and reviews.",
  },
  {
    name: "Studios & Stores",
    price: "R489",
    detail: "List bookable spaces, gear, services, and manage high-intent leads.",
  },
]

export default function SnapScoutMobilePreview() {
  const { isAuthenticated, isLoading } = useAuth()
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
  const showGuestHero = !isLoading && !isAuthenticated

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
            className="flex min-h-[calc(100dvh-190px)] flex-col rounded-[34px] border border-[#ece4da] bg-white p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
          >
            <h2 className="max-w-[13ch] text-[34px] font-black leading-[1.02] text-[#0b0b0d]">
              Find. Book. Shoot.
              <span className="block text-[#f20d14]">Done.</span>
            </h2>

            <motion.div whileTap={{ scale: 0.99 }}>
              <Link
                href="/studios-stores"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e7e0d6] bg-white px-4 py-3"
              >
                <Search className="h-4.5 w-4.5 text-[#6f6f73]" />
                <span className="text-[14px] text-[#6f6f73]">Search locations...</span>
                <span className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6]">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-[#0b0b0d]" />
                </span>
              </Link>
            </motion.div>

            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {[
                { label: "All", icon: Compass, href: "/" },
                { label: "Studios", icon: Briefcase, href: "/studios-stores" },
                { label: "Rooftops", icon: Building2, href: "/studios-stores" },
                { label: "Warehouses", icon: Warehouse, href: "/studios-stores" },
                { label: "More", icon: MoreHorizontal, href: "/studios-stores" },
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
                <h3 className="text-[18px] font-semibold text-[#0b0b0d]">Featured Locations</h3>
                <Link href="/studios-stores" className="text-[13px] font-medium text-[#f20d14]">
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

            <div className="mt-auto pt-6">
              <Button asChild className="h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d9070d]">
                <Link href="/studios-stores">
                  Find Your Location
                  <ChevronRight className="ml-1.5 h-4.5 w-4.5" />
                </Link>
              </Button>
            </div>
          </motion.section>
        </motion.div>

        <div className="mt-5 space-y-5 pb-3">
          {showGuestHero && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff1f1] px-3 py-1.5 text-[12px] font-semibold text-[#f20d14]">
                <Sparkles className="h-3.5 w-3.5" />
                Join the creative network
              </div>
              <h2 className="text-[28px] font-black leading-[1.05] text-[#0b0b0d]">
                Connect with South Africa's creative community.
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-[#4d5663]">
                Build a profile, share your real work, list your rates, and get discovered by clients looking for shoot-ready talent.
              </p>
              <div className="mt-5 grid gap-3">
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]">
                  <Link href="/onboarding">
                    <UserPlus className="mr-2 h-4.5 w-4.5" />
                    Create Profile
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-12 rounded-full border-[#e8e4de] bg-white text-[14px] font-semibold">
                    <Link href="/onboarding">Join SnapScout</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-full border-[#e8e4de] bg-white text-[14px] font-semibold">
                    <a href={previewVideoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-1.5 h-4 w-4 fill-[#f20d14] text-[#f20d14]" />
                      Preview
                    </a>
                  </Button>
                </div>
              </div>
            </motion.section>
          )}

          <section className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f20d14]">Community</p>
                <h2 className="mt-1 text-[22px] font-black leading-tight text-[#0b0b0d]">Stories, groups, and events</h2>
              </div>
              <Button asChild variant="ghost" className="h-9 rounded-full px-3 text-[#f20d14]">
                <Link href="/community">Open</Link>
              </Button>
            </div>

            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
              {communitySuccessStories.slice(0, 2).map((story) => (
                <motion.article
                  key={story.name}
                  whileTap={{ scale: 0.98 }}
                  className="min-w-[248px] rounded-[22px] border border-[#e8edf5] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffe7e7] text-[#f20d14]">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-[#111318]">
                      <Star className="h-3.5 w-3.5 fill-[#f2a900] text-[#f2a900]" />
                      {story.rating}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold text-[#111318]">{story.name}</h3>
                  <p className="text-[12px] text-[#667085]">{story.role}</p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-5 text-[#4d5663]">"{story.quote}"</p>
                  <p className="mt-3 text-[12px] font-semibold text-[#111318]">{story.projects}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-4 rounded-[22px] border border-[#e8edf5] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-[#111318]">Regional groups</p>
                <MapPin className="h-4 w-4 text-[#f20d14]" />
              </div>
              <div className="mt-3 grid gap-2">
                {regionalGroups.slice(0, 3).map((group) => (
                  <div key={group.province} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                    <div>
                      <p className="text-[13px] font-semibold">{group.province}</p>
                      <p className="text-[11px] text-[#667085]">{group.city}</p>
                    </div>
                    <span className="rounded-full border border-[#e8edf5] px-2 py-1 text-[11px] text-[#4d5663]">{group.members}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-[#e8edf5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1ff] text-[#3366ff]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-bold">{upcomingCommunityEvents[0].title}</p>
                  <p className="text-[12px] text-[#667085]">{upcomingCommunityEvents[0].date}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-[#4d5663]">
                <span>{upcomingCommunityEvents[0].type}</span>
                <span>{upcomingCommunityEvents[0].attending}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#e8e4de] bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#f20d14]">Simple monthly plans</p>
            <h2 className="mt-1 text-[22px] font-black leading-tight text-[#0b0b0d]">Choose what fits your workflow.</h2>
            <div className="mt-4 grid gap-3">
              {monthlyPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[22px] border border-[#e8edf5] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-bold text-[#111318]">{plan.name}</p>
                      <p className="mt-1 text-[12px] leading-5 text-[#667085]">{plan.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[24px] font-black text-[#111318]">{plan.price}</p>
                      {plan.price !== "Free" && <p className="text-[11px] text-[#667085]">/month</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button asChild className="mt-4 h-[52px] w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]">
              <Link href="/onboarding">Start with SnapScout</Link>
            </Button>
          </section>
        </div>

        <AnimatePresence>
          {splashPlaying && (
            <motion.div
              key="mobile-splash"
              className="fixed inset-0 z-[80] bg-white"
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
