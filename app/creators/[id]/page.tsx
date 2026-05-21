"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Bookmark, MapPin, MessageCircle, Phone, Share2, Star } from "lucide-react"
import { mockCreators } from "@/lib/mock-data/portfolio-data"
import { Button } from "@/components/ui/button"
import { EnhancedProfileHeader } from "@/components/profile/enhanced-profile-header"
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs"
import { getPlatformCounts, filterByPlatform } from "@/lib/mock-data/portfolio-data"
import { AvailabilityCalendar } from "@/components/availability/availability-calendar"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { SaveToPoolButton } from "@/components/crew/SaveToPoolButton"
import { ProfilePortfolioGallery } from "@/components/portfolio/profile-portfolio-gallery"
import type { AvailabilityOwnerType } from "@/lib/availability"

export default function CreatorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [saved, setSaved] = useState(false)
  const [hireSheetOpen, setHireSheetOpen] = useState(false)
  const [requestedDate, setRequestedDate] = useState<string | undefined>()
  const creator = mockCreators.find((c) => c.id === params.id) || mockCreators[0]

  const platforms = useMemo(() => getPlatformCounts(creator.portfolioItems), [creator.portfolioItems])
  const filteredItems = useMemo(() => filterByPlatform(creator.portfolioItems, activeTab), [creator.portfolioItems, activeTab])

  const hero = creator.portfolioItems?.[0]?.thumbnail || creator.avatar || "/placeholder.jpg"
  const price = "R950/hr"
  const services = ["Portrait", "Fashion", "Lifestyle", "Commercial", "Events"]
  const ownerType: AvailabilityOwnerType = creator.profession.toLowerCase().includes("video")
    ? "videographer"
    : creator.profession.toLowerCase().includes("photo")
      ? "photographer"
      : "crew"

  const openHireSheet = (date?: string) => {
    setRequestedDate(date)
    setHireSheetOpen(true)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <div className="w-full md:hidden pb-28">
        <div className="w-full">
          <div className="relative h-[310px] w-full overflow-hidden rounded-b-[34px]">
            <Image src={hero} alt={creator.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => router.back()} className="grid h-12 w-12 place-items-center rounded-full bg-white/95 shadow-sm">
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.92 }} className="grid h-12 w-12 place-items-center rounded-full bg-white/95 shadow-sm">
                  <Share2 className="h-5 w-5" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.92 }} onClick={() => setSaved((v) => !v)} className="grid h-12 w-12 place-items-center rounded-full bg-white/95 shadow-sm">
                  <Bookmark className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="relative -mt-10 w-full rounded-t-[34px] bg-white px-5 pb-7 pt-16">
            <div className="absolute left-5 top-[-42px] h-[88px] w-[88px] overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_12px_26px_rgba(9,14,24,0.14)]">
              <Image src={creator.avatar || "/placeholder-user.jpg"} alt={creator.name} fill className="object-cover" />
            </div>

            <div className="flex items-start justify-end">
              <div className="rounded-full bg-[#f4f6f8] px-3 py-1 text-xs font-semibold text-[#f20d14]">
                {creator.profession}
              </div>
            </div>

            <h1 className="mt-2 text-[44px] leading-[0.94] font-semibold text-black">{creator.name}</h1>
            <div className="mt-3 flex items-center gap-3 text-[15px] text-neutral-700">
              <span className="inline-flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-red-500 text-red-500" /> {creator.rating}</span>
              <span>({creator.reviews} reviews)</span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-neutral-600"><MapPin className="h-4 w-4" />{creator.location}</div>
            <div className="mt-3">
              <AvailabilityStatusBadge ownerId={creator.id} ownerType={ownerType} />
            </div>

            <p className="mt-5 text-[17px] leading-7 text-neutral-800">{creator.bio}</p>

            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[
                { icon: MessageCircle, label: "Message" },
                { icon: Phone, label: "Call" },
                { icon: Share2, label: "Share" },
                { icon: Bookmark, label: "Save" },
              ].map((item) => (
                <motion.button key={item.label} whileTap={{ scale: 0.94 }} className="min-h-[68px] rounded-2xl border border-neutral-200 bg-white py-3 text-xs shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                  <item.icon className="mx-auto h-5 w-5 mb-1" />
                  {item.label}
                </motion.button>
              ))}
            </div>

            <SaveToPoolButton profileId={creator.id} profileName={creator.name} className="mt-3 h-12 w-full" variant="outline" />

            <h3 className="mt-7 text-lg font-semibold">Services</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <span key={service} className="rounded-full bg-[#f4f6f8] px-4 py-2 text-sm font-medium text-[#1c1f25]">{service}</span>
              ))}
            </div>

            <ProfilePortfolioGallery
              userId={creator.id}
              items={creator.portfolioItems}
              className="mt-7"
              previewCount={4}
              onHire={() => openHireSheet()}
            />

            <div className="mt-7">
              <AvailabilityCalendar
                ownerId={creator.id}
                ownerType={ownerType}
                title="Live availability"
                compact
                onRequestDate={openHireSheet}
              />
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 w-full border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-neutral-500">From</div>
              <div className="text-3xl font-semibold leading-none">{price}</div>
            </div>
            <Button
              onClick={() => openHireSheet()}
              className="h-14 min-w-[180px] rounded-full bg-red-600 text-lg hover:bg-red-700 active:scale-[0.98]"
            >
              Hire {creator.name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <EnhancedProfileHeader
            name={creator.name}
            profession={creator.profession}
            location={creator.location}
            bio={creator.bio}
            avatar={creator.avatar}
            rating={creator.rating}
            reviews={creator.reviews}
            portfolioCount={creator.portfolioCount}
            isOwnProfile={false}
            onHire={() => openHireSheet()}
            onMessage={() => router.push(`/messages?recipient=${params.id}`)}
            onSave={() => setSaved((v) => !v)}
            onShare={() => navigator.clipboard.writeText(window.location.href)}
            isSaved={saved}
          />
          <div className="mt-8">
            <PortfolioTabs platforms={platforms} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-4">
              <PortfolioGrid items={filteredItems} onHire={() => openHireSheet()} />
            </div>
          </div>
          <div className="mt-8">
            <SaveToPoolButton profileId={creator.id} profileName={creator.name} className="mb-4 h-12 rounded-full" variant="outline" />
            <AvailabilityCalendar
              ownerId={creator.id}
              ownerType={ownerType}
              title="Live availability"
              onRequestDate={openHireSheet}
            />
          </div>
        </div>
      </div>
      <HireRequestSheet
        open={hireSheetOpen}
        onOpenChange={setHireSheetOpen}
        talentId={creator.id}
        talentName={creator.name}
        talentType="creator"
        priceLabel={price}
        initialDate={requestedDate}
      />
    </div>
  )
}
