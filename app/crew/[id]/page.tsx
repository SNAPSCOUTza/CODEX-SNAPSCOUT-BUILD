"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AvailabilityCalendar } from "@/components/availability/availability-calendar"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { SaveToPoolButton } from "@/components/crew/SaveToPoolButton"
import { ProfilePortfolioGallery } from "@/components/portfolio/profile-portfolio-gallery"
import { mockCrewMembers, type MockCrewMember } from "@/lib/mock-data/crew-data"
import { fallbackImagesToPortfolioItems } from "@/types/portfolio"

interface CrewProfile {
  id: string
  display_name: string
  bio: string
  profession: string
  profile_image_url: string
  location: string
  pricing: string
  skills: string[]
  portfolio_images: string[]
  rating: number
  reviews: number
  projects: string
  years: string
  responseRate: string
  memberSince: string
}

const portfolioFallbacks = [
  "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=900",
]

function mockToProfile(member: MockCrewMember): CrewProfile {
  const firstTwoProfileTweaks: Record<string, Partial<CrewProfile>> = {
    "crew-001": {
      pricing: "R950/hr",
      projects: "132+",
      years: "12",
      responseRate: "98%",
      memberSince: "Feb 2021",
      reviews: 47,
    },
    "crew-002": {
      pricing: "R1,200/hr",
      projects: "120+",
      years: "8",
      responseRate: "96%",
      memberSince: "Aug 2020",
      reviews: 32,
    },
  }

  const images = [member.recent_work, member.profile_picture, ...portfolioFallbacks].filter(Boolean)

  return {
    id: member.id,
    display_name: member.display_name,
    bio: member.bio,
    profession: member.profession,
    profile_image_url: member.profile_picture,
    location: `${member.city}, ${member.province}`,
    pricing: "R950/hr",
    skills: member.skills,
    portfolio_images: images,
    rating: member.rating,
    reviews: Math.round((member.rating - 4) * 100),
    projects: "120+",
    years: member.years_experience.replace(/\D/g, "").slice(0, 2) || "4",
    responseRate: "98%",
    memberSince: "Feb 2021",
    ...firstTwoProfileTweaks[member.id],
  }
}

export default function CrewProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [hireSheetOpen, setHireSheetOpen] = useState(false)
  const [requestedDate, setRequestedDate] = useState<string | undefined>()

  const profile = useMemo(() => {
    const mockProfile = mockCrewMembers.find((member) => member.id === params.id || member.user_id === params.id)
    return mockProfile ? mockToProfile(mockProfile) : null
  }, [params.id])

  const firstName = profile?.display_name.split(" ")[0] || "Creative"
  const hero = profile?.portfolio_images?.[0] || profile?.profile_image_url || "/placeholder.jpg"
  const services = useMemo(() => profile?.skills?.slice(0, 6) || [], [profile])
  const portfolioItems = useMemo(
    () => fallbackImagesToPortfolioItems(profile?.portfolio_images || [], profile?.id || "crew", profile?.display_name || "Portfolio"),
    [profile],
  )
  const primaryLocation = profile?.location.split(",")[0]?.trim() || profile?.location || ""

  const openHireSheet = (date?: string) => {
    setRequestedDate(date)
    setHireSheetOpen(true)
  }

  if (!profile) return <div className="grid min-h-screen place-items-center bg-white">Profile not found.</div>

  return (
    <div className="h-[100dvh] overflow-hidden bg-white text-[#0b0b0d]">
      <div className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
        <section className="no-scrollbar min-w-full snap-start overflow-y-auto px-0 pb-28 pt-0 sm:px-0 sm:pt-0 md:pb-24">
          <div className="relative overflow-hidden rounded-none border-x-0 border-t-0 border-b border-[#e4e9f1] bg-white shadow-none sm:rounded-[34px] sm:border sm:shadow-[0_18px_40px_rgba(8,10,18,0.08)]">
            <div className="relative h-[350px] overflow-hidden rounded-none bg-[#f4f6f8] sm:h-[330px] sm:rounded-[30px]">
              <Image src={hero} alt={profile.display_name} fill className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => router.back()} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Go back">
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.92 }} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Share profile">
                  <Share2 className="h-5 w-5" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }} onClick={() => setSaved((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Save profile">
                  <Heart className={`h-5 w-5 ${saved ? "fill-[#f20d14] text-[#f20d14]" : "text-[#f20d14]"}`} />
                </motion.button>
              </div>
            </div>

            <div className="absolute inset-x-0 top-[58%] z-10 flex items-center justify-between px-4">
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm" aria-label="Zoom image">
                <span className="text-xl leading-none">+</span>
              </button>
              <span className="rounded-full bg-black/38 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
                1/8
              </span>
            </div>

            <div className="relative z-20 -mt-10 rounded-t-[34px] bg-white px-5 pb-8 pt-16 text-[#13161d]">
              <div className="absolute left-5 top-[-42px] h-[88px] w-[88px] overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_12px_26px_rgba(9,14,24,0.14)]">
                <Image src={profile.profile_image_url} alt={profile.display_name} fill className="object-cover" />
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-[#35a936]" />
              </div>

              <h1 className="mt-0 text-[48px] font-semibold leading-[0.9] tracking-[-0.02em] text-[#0a0c12]">
                {profile.display_name}
              </h1>
              <p className="mt-1 text-[18px] font-medium text-[#626b78]">{profile.profession}</p>
              <p className="mt-2 flex items-center gap-1 text-[16px] text-[#161b23]">
                <Star className="h-4 w-4 fill-[#0f141d] text-[#0f141d]" /> {profile.rating} ({profile.reviews} reviews)
              </p>
              <p className="mt-1 flex items-center gap-1 text-[15px] text-[#5f6874]">
                <MapPin className="h-4 w-4" /> {primaryLocation}
              </p>
              <div className="mt-3">
                <AvailabilityStatusBadge ownerId={profile.id} ownerType="crew" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {services.slice(0, 5).map((service) => (
                  <span key={service} className="rounded-full bg-[#f4f6f8] px-4 py-2 text-[13px] font-medium text-[#1c1f25]">
                    {service}
                  </span>
                ))}
              </div>

              <SaveToPoolButton
                profileId={profile.id}
                profileName={profile.display_name}
                className="mt-5 h-12 w-full"
                variant="outline"
              />

              <p className="mt-6 text-[17px] leading-7 text-[#22262f]">{profile.bio}</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: profile.projects, label: "Projects" },
                  { value: profile.years, label: "Years Exp." },
                  { value: profile.responseRate, label: "Response" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#e4e9f1] bg-white px-2 py-4 text-center text-[#0c0f14] shadow-[0_10px_24px_rgba(9,14,24,0.03)]">
                    <p className="text-[39px] font-semibold leading-[0.9] tracking-[-0.02em]">{stat.value}</p>
                    <p className="mt-2 text-[12px] text-[#666f7b]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <ProfilePortfolioGallery
                userId={profile.id}
                items={portfolioItems}
                className="mt-6"
                previewCount={4}
                onHire={() => openHireSheet()}
              />

              <div className="mt-6">
                <AvailabilityCalendar
                  ownerId={profile.id}
                  ownerType="crew"
                  title="Live availability"
                  compact
                  onRequestDate={openHireSheet}
                />
              </div>

              <div className="h-2" />
            </div>
          </div>
        </section>

        <section className="no-scrollbar min-w-full snap-start overflow-y-auto pb-36">
          <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#edf1f6] bg-white px-5">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => router.back()} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <span className="h-10 flex-1" aria-hidden="true" />
            <div className="flex gap-2">
              <Share2 className="h-5 w-5" />
              <Bookmark className={`h-5 w-5 ${saved ? "fill-[#f20d14] text-[#f20d14]" : ""}`} />
            </div>
          </div>

          <div className="px-5 pt-5">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#f3f5f8]">
                <Image src={profile.profile_image_url} alt={profile.display_name} fill className="object-cover" />
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-[#35a936]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[26px] font-bold leading-tight">{profile.display_name}</h1>
                <p className="text-[14px] font-semibold text-[#f20d14]">{profile.profession}</p>
                <p className="mt-2 flex items-center gap-1 text-[13px] text-[#3f4650]">
                  <Star className="h-4 w-4 fill-[#f20d14] text-[#f20d14]" /> {profile.rating} ({profile.reviews} reviews)
                </p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[#626b78]">
                  <MapPin className="h-4 w-4" /> {profile.location}
                </p>
              </div>
            </div>

            <p className="mt-6 text-[15px] leading-6 text-[#20232b]">{profile.bio}</p>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                { icon: MessageCircle, label: "Message" },
                { icon: Phone, label: "Call" },
                { icon: Share2, label: "Share" },
                { icon: Bookmark, label: "Save" },
              ].map((action) => (
                <motion.button key={action.label} whileTap={{ scale: 0.94 }} className="min-h-[70px] rounded-2xl border border-[#e8edf5] bg-white text-[11px] font-medium">
                  <action.icon className="mx-auto mb-1 h-5 w-5" />
                  {action.label}
                </motion.button>
              ))}
            </div>

            <SaveToPoolButton
              profileId={profile.id}
              profileName={profile.display_name}
              className="mt-3 h-12 w-full"
              variant="outline"
            />

            <div className="mt-6 border-t border-[#e8edf5] pt-5">
              <p className="text-[14px] font-bold">About</p>
              {[
                { icon: BriefcaseBusiness, label: "Experience", value: `${profile.years} years` },
                { icon: CalendarDays, label: "Projects Completed", value: profile.projects },
                { icon: MessageCircle, label: "Response Rate", value: profile.responseRate },
                { icon: CalendarDays, label: "Member Since", value: profile.memberSince },
              ].map((row) => (
                <div key={row.label} className="mt-4 flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-3 text-[#20232b]"><row.icon className="h-4 w-4" /> {row.label}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#e8edf5] pt-5">
              <p className="text-[14px] font-bold">Services</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {services.map((service) => (
                  <span key={service} className="rounded-full bg-[#f4f6f8] px-4 py-2 text-[12px] font-semibold text-[#20242d]">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <ProfilePortfolioGallery
              userId={profile.id}
              items={portfolioItems}
              className="mt-6"
              previewCount={6}
              onHire={() => openHireSheet()}
            />

            <div className="mt-6 rounded-2xl border border-[#e8edf5] bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src="https://images.pexels.com/photos/3756678/pexels-photo-3756678.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Reviewer" fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">Anele S.</p>
                    <p className="text-[12px] text-[#6f7782]">2 weeks ago</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[13px] font-semibold"><Star className="h-4 w-4 fill-[#f20d14] text-[#f20d14]" /> 5.0</span>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-[#20232b]">
                Professional, creative, and easy to work with. The shots were clean and production-ready.
              </p>
            </div>

            <div className="mt-6">
              <AvailabilityCalendar
                ownerId={profile.id}
                ownerType="crew"
                title="Live availability"
                compact
                onRequestDate={openHireSheet}
              />
            </div>
          </div>

          <div className="h-8" />
        </section>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-white px-0 pb-0 pt-0 sm:bg-transparent sm:px-4 sm:pb-[max(14px,env(safe-area-inset-bottom))] sm:pt-3">
        <div className="pointer-events-auto rounded-t-[24px] border-t border-[#111318] bg-white px-4 py-3 shadow-[0_-10px_28px_rgba(0,0,0,0.08)] sm:rounded-[26px] sm:border sm:border-[#111318]">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[12px] text-[#717a86]">From</p>
              <p className="text-[44px] font-semibold leading-[0.9] tracking-[-0.02em] text-[#11151d]">
                {profile.pricing.replace("/hr", "")}
                <span className="text-[30px] font-medium text-[#11151d]"> /hr</span>
              </p>
            </div>
            <Button
              type="button"
              onClick={() => openHireSheet()}
              className="h-14 min-w-[170px] rounded-full bg-[#f20d14] text-[20px] font-semibold text-white hover:bg-[#d80a10]"
            >
              Hire {firstName}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="h-[max(12px,env(safe-area-inset-bottom))] bg-white sm:hidden" aria-hidden />
      </div>
      <HireRequestSheet
        open={hireSheetOpen}
        onOpenChange={setHireSheetOpen}
        talentId={profile.id}
        talentName={profile.display_name}
        talentType="crew"
        priceLabel={profile.pricing}
        initialDate={requestedDate}
      />
    </div>
  )
}
