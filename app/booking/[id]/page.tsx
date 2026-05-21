"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CalendarDays, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { mockCrewMembers } from "@/lib/mock-data/crew-data"
import { mockCreators } from "@/lib/mock-data/portfolio-data"

export default function BookingRequestPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(true)

  const talent = useMemo(() => {
    const crew = mockCrewMembers.find((member) => member.id === params.id || member.user_id === params.id)
    if (crew) {
      return {
        id: crew.user_id || crew.id,
        name: crew.display_name,
        role: crew.profession,
        location: `${crew.city}, ${crew.province}`,
        image: crew.recent_work || crew.profile_picture || "/placeholder.svg",
        avatar: crew.profile_picture || "/placeholder.svg",
        rating: crew.rating,
        type: "crew" as const,
        price: "R950/hr",
        profilePath: `/crew/${crew.id}`,
      }
    }

    const creator = mockCreators.find((item) => item.id === params.id)
    if (creator) {
      return {
        id: creator.id,
        name: creator.name,
        role: creator.profession,
        location: creator.location,
        image: creator.portfolioItems?.[0]?.thumbnail || creator.avatar || "/placeholder.svg",
        avatar: creator.avatar || "/placeholder.svg",
        rating: creator.rating,
        type: "creator" as const,
        price: "R950/hr",
        profilePath: `/creators/${creator.id}`,
      }
    }

    return {
      id: params.id,
      name: "SnapScout creative",
      role: "Creative",
      location: "South Africa",
      image: "/placeholder.svg",
      avatar: "/placeholder-user.jpg",
      rating: 4.9,
      type: "creator" as const,
      price: "R950/hr",
      profilePath: "/creators",
    }
  }, [params.id])

  const requestedDate = searchParams.get("date") || undefined

  return (
    <div className="min-h-[100dvh] bg-white px-4 py-5 text-[#0b0b0d]">
      <div className="mx-auto max-w-[430px]">
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => router.push(talent.profilePath)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#e1e7f1] bg-white shadow-sm"
            aria-label="Back to profile"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <p className="text-[15px] font-bold">Hire Request</p>
          <div className="h-11 w-11" />
        </div>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#e8edf5] bg-white shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
          <div className="relative h-[330px] w-full overflow-hidden">
            <Image src={talent.image} alt={talent.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff2b31]">{talent.role}</p>
              <h1 className="mt-1 text-[36px] font-black leading-none">{talent.name}</h1>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-sm">
                <Image src={talent.avatar} alt={talent.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[20px] font-bold">{talent.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[#667085]">
                  <MapPin className="h-4 w-4" />
                  {talent.location}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[#f6f7fb] px-3 py-3 text-center">
                <Star className="mx-auto h-4 w-4 fill-[#f20d14] text-[#f20d14]" />
                <p className="mt-1 font-mono text-[16px] font-bold">{talent.rating}</p>
              </div>
              <div className="rounded-2xl bg-[#f6f7fb] px-3 py-3 text-center">
                <CalendarDays className="mx-auto h-4 w-4 text-[#f20d14]" />
                <p className="mt-1 text-[12px] font-semibold">{requestedDate ? "Date set" : "Pick date"}</p>
              </div>
              <div className="rounded-2xl bg-[#f6f7fb] px-3 py-3 text-center">
                <p className="font-mono text-[18px] font-black">{talent.price.replace("/hr", "")}</p>
                <p className="text-[11px] text-[#667085]">per hour</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="mt-5 h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d9070d]"
            >
              Continue hire request
            </Button>
          </div>
        </section>
      </div>

      <HireRequestSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) router.push(talent.profilePath)
        }}
        talentId={talent.id}
        talentName={talent.name}
        talentType={talent.type}
        priceLabel={talent.price}
        initialDate={requestedDate}
      />
    </div>
  )
}
