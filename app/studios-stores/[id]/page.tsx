"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock3, Globe, Heart, MapPin, Share2, Sparkles, Star, Wifi, Car, Zap } from "lucide-react"
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
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement | null>(null)

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
  const galleryImages = item.gallery?.length
    ? item.gallery
    : [
        item.image,
        "/images/modern-studio.png",
        "/images/studio-space.png",
        "/images/creator-equipment.png",
        "/images/studio-lighting.png",
        "/images/warehouse-location.png",
        "/images/camera-rental.png",
        "/images/rooftop-location.png",
      ]

  const openHours = item.operatingHours || (item.type === "store" ? "Mon - Sat · 08:00 - 18:00" : "Daily · 07:00 - 22:00")

  return (
    <MobileShell title="Studios & Stores">
      <section className="rounded-[34px] border border-[#e8edf5] bg-white p-3 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        <div className="relative overflow-hidden rounded-[30px]">
          <div
            ref={carouselRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(event) => {
              const target = event.currentTarget
              if (!target.clientWidth) return
              setActiveSlide(Math.round(target.scrollLeft / target.clientWidth))
            }}
          >
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-[330px] min-w-full snap-start">
                <Image src={image} alt={`${item.name} image ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>

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
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const width = carouselRef.current?.clientWidth || 0
                  carouselRef.current?.scrollTo({ left: width * index, behavior: "smooth" })
                  setActiveSlide(index)
                }}
                aria-label={`Go to photo ${index + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-all ${activeSlide === index ? "w-4 bg-white" : "bg-white/55"}`}
              />
            ))}
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

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-[#f7f9fc] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Address</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{item.fullAddress || item.location}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <div className="mt-3 flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Operating Hours</p>
                <p className="mt-1 text-[14px] font-medium text-[#111318]">{openHours}</p>
              </div>
            </div>
            <div className="mt-3 h-px bg-[#e3e8f0]" />
            <a href={item.contact.website} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-3 text-[#111318] transition hover:opacity-80">
              <Globe className="mt-0.5 h-4.5 w-4.5 text-[#4f5867]" />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Website</p>
                <p className="mt-1 text-[14px] font-medium">{item.contact.website.replace(/^https?:\/\//, "")}</p>
              </div>
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">About this space</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">{item.about || item.description}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Rates & packages</p>
              <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc] text-[#4f5867]">
                {item.spaceCount ? `${item.spaceCount} spaces` : "Single space"}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Hourly</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.hourlyRate.split(" - ")[0]}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Half day</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.halfDayRate || "On request"}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Full day</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.fullDayRate || "On request"}</p>
              </div>
              <div className="rounded-xl bg-[#f7f9fc] p-3">
                <p className="text-[11px] text-[#6d7480]">Peak / Off-peak</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111318]">{item.peakRate ? `${item.peakRate} · ${item.offPeakRate}` : "On request"}</p>
              </div>
            </div>
            {item.packages?.length ? (
              <div className="mt-3 space-y-2">
                {item.packages.map((pkg) => (
                  <div key={pkg.name} className="rounded-xl border border-[#edf1f7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-[#111318]">{pkg.name}</p>
                      <p className="text-[14px] font-semibold text-[#f20d14]">{pkg.price}</p>
                    </div>
                    <p className="mt-1 text-[13px] text-[#5b6371]">{pkg.description}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {item.gearInventory?.length ? (
            <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Gear inventory</p>
              <div className="mt-3 space-y-2">
                {item.gearInventory.map((gear) => (
                  <div key={gear.name} className="rounded-xl border border-[#edf1f7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-[#111318]">{gear.name}</p>
                      <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc] text-[#4f5867]">
                        {gear.availability}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-[#5b6371]">{gear.rate}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-[#e6ebf3] bg-white p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6d7480]">Booking terms</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#2b3340]">
              {item.termsSummary || "Deposit and rental terms are shared once a booking request is accepted."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-[#5b6371]">
              {item.depositPolicy ? <Badge variant="outline" className="rounded-full border-[#e6ebf3] bg-[#f7f9fc]">{item.depositPolicy}</Badge> : null}
              {item.rentalTermsLink ? (
                <a href={item.rentalTermsLink} target="_blank" rel="noreferrer" className="rounded-full border border-[#e6ebf3] bg-[#f7f9fc] px-3 py-1.5 hover:opacity-80">
                  View full terms
                </a>
              ) : null}
            </div>
            {item.rules?.length ? (
              <ul className="mt-3 space-y-1 text-[13px] text-[#5b6371]">
                {item.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#9aa3b2]" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            ) : null}
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
