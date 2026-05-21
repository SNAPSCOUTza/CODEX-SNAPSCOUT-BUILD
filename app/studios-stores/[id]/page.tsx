"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MapPin, Share2, Sparkles, Star, Wifi, Car, Zap } from "lucide-react"
import MobileShell from "@/components/mobile/mobile-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import { getStudioStoreById } from "@/lib/mock-data/studios-stores-data"

const amenityIcons = [Sparkles, Wifi, Car, Zap]

export default function StudioStoreDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [bookingOpen, setBookingOpen] = useState(false)

  const item = useMemo(() => getStudioStoreById(params.id), [params.id])

  if (!item) {
    return (
      <MobileShell title="Studio Details">
        <div className="rounded-[24px] border border-[#e8edf5] bg-white p-5 text-center">
          <p className="text-[16px] font-semibold text-[#101318]">Studio or store not found.</p>
          <Button asChild className="mt-4 rounded-full bg-[#f20d14] text-white hover:bg-[#d80a10]">
            <Link href="/studios-stores">Back to Studios & Stores</Link>
          </Button>
        </div>
      </MobileShell>
    )
  }

  const city = item.location.split(",")[0]?.toUpperCase() || "SOUTH AFRICA"
  const startingRate = item.hourlyRate.split(" - ")[0] || item.hourlyRate
  const bookingOptions = Array.from(
    new Set([
      ...item.services,
      ...(item.type === "store"
        ? ["Camera rental", "Lens rental", "Full kit rental", "Multiple-day rental"]
        : ["Studio booking", "Photo shoot", "Video shoot", "Full-day studio hire"]),
      "Other",
    ]),
  )

  return (
    <MobileShell title="Studios & Stores">
      <section className="rounded-[34px] border border-[#e8edf5] bg-white p-3 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        <div className="relative h-[330px] overflow-hidden rounded-[30px]">
          <Image src={item.image} alt={item.name} fill className="object-cover" />

          <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#111318]" aria-label="Share listing">
                <Share2 className="h-5 w-5" />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#f20d14]" aria-label="Save listing">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 pb-2 pt-5">
          <p className="text-[12px] font-bold tracking-[0.14em] text-[#f20d14]">{city}</p>
          <h1 className="mt-2 text-[43px] font-semibold leading-tight text-[#111318]">{item.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <MapPin className="mr-1.5 h-4 w-4" /> {item.location}
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              <Star className="mr-1.5 h-4 w-4 fill-[#111318] text-[#111318]" /> {item.rating} ({item.reviews})
            </Badge>
            <Badge variant="outline" className="h-10 rounded-full border-[#e6ebf3] bg-white px-4 text-[13px] text-[#111318]">
              {item.availability}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {item.amenities.slice(0, 4).map((amenity, index) => {
              const Icon = amenityIcons[index % amenityIcons.length]
              return (
                <div key={amenity} className="rounded-2xl bg-[#f7f9fc] p-3 text-[#111318]">
                  <Icon className="h-4.5 w-4.5" />
                  <p className="mt-2 text-[13px] font-medium leading-tight">{amenity}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] text-[#6c7380]">From</p>
              <p className="text-[42px] font-semibold leading-none text-[#111318]">{item.hourlyRate.split(" - ")[0]}</p>
              <p className="text-[15px] text-[#111318]/80">/hr</p>
            </div>
            <Button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="h-14 rounded-full bg-[#f20d14] px-10 text-[18px] font-semibold text-white hover:bg-[#d80a10]"
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>
      <HireRequestSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        talentId={String(item.id)}
        talentName={item.name}
        talentType={item.type}
        priceLabel={`${startingRate}/hr`}
        bookingTypeOptions={bookingOptions}
        bookingTypeLabel={item.type === "store" ? "What are you renting?" : "What are you booking?"}
        bookingTypePlaceholder={item.type === "store" ? "Select rental type" : "Select studio booking type"}
        durationLabel={item.type === "store" ? "How long do you need the rental?" : "How long do you need the space?"}
        briefPlaceholder={
          item.type === "store"
            ? "Example: camera kit rental, two days, lights, pickup time, Johannesburg..."
            : "Example: studio booking, all day, natural light, parking, changing room, Cape Town..."
        }
      />
    </MobileShell>
  )
}
