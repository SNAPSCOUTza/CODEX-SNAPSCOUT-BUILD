"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Bookmark, MapPin, MessageCircle, Phone, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/auth"
import { AvailabilityCalendar } from "@/components/availability/availability-calendar"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"

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
}

export default function CrewProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<CrewProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", params.id).eq("is_public", true).single()
      setProfile(data || null)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div className="min-h-screen grid place-items-center">Loading profile...</div>
  if (!profile) return <div className="min-h-screen grid place-items-center">Profile not found.</div>

  const hero = profile.portfolio_images?.[0] || profile.profile_image_url || "/placeholder.jpg"
  const services = profile.skills?.length ? profile.skills.slice(0, 6) : ["Portrait", "Commercial", "Lifestyle"]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffcf7]">
      <div className="w-full md:hidden pb-28">
        <div className="w-full">
          <div className="relative h-[310px] w-full overflow-hidden rounded-b-[34px]">
            <Image src={hero} alt={profile.display_name} fill className="object-cover" />
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

          <div className="relative -mt-9 w-full rounded-t-[34px] bg-[#fffcf7] px-5 pb-7 pt-0">
            <div className="relative -mt-9 h-24 w-24 overflow-hidden rounded-full border-4 border-[#fffcf7] shadow-sm">
              <Image src={profile.profile_image_url || "/placeholder-user.jpg"} alt={profile.display_name} fill className="object-cover" />
            </div>
            <h1 className="mt-3 text-[44px] leading-[0.94] font-semibold text-black">{profile.display_name}</h1>
            <div className="mt-1 text-sm font-semibold text-red-600">{profile.profession}</div>
            <div className="mt-3 flex items-center gap-3 text-[15px] text-neutral-700">
              <span className="inline-flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-red-500 text-red-500" /> 4.9</span>
              <span>(132 reviews)</span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-neutral-600"><MapPin className="h-4 w-4" />{profile.location}</div>
            <div className="mt-3">
              <AvailabilityStatusBadge ownerId={profile.id} ownerType="crew" />
            </div>
            <p className="mt-5 text-[17px] leading-7 text-neutral-800">{profile.bio || "Experienced creative professional ready to collaborate on your next production."}</p>

            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[
                { icon: MessageCircle, label: "Message", onClick: () => router.push(`/messages?user=${params.id}`) },
                { icon: Phone, label: "Call" },
                { icon: Share2, label: "Share" },
                { icon: Bookmark, label: "Save", onClick: () => setSaved((v) => !v) },
              ].map((item) => (
                <motion.button key={item.label} whileTap={{ scale: 0.94 }} onClick={item.onClick} className="min-h-[68px] rounded-2xl border border-neutral-200 bg-white py-3 text-xs shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                  <item.icon className="mx-auto h-5 w-5 mb-1" />
                  {item.label}
                </motion.button>
              ))}
            </div>

            <h3 className="mt-7 text-lg font-semibold">Services</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <span key={service} className="rounded-full bg-[#f2efe8] px-4 py-2 text-sm font-medium">{service}</span>
              ))}
            </div>

            <h3 className="mt-7 text-lg font-semibold">Portfolio</h3>
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {(profile.portfolio_images || []).slice(0, 4).map((item, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={item || "/placeholder.jpg"} alt={`Portfolio ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>

            <div className="mt-7">
              <AvailabilityCalendar ownerId={profile.id} ownerType="crew" title="Live availability" compact />
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 w-full border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-neutral-500">From</div>
              <div className="text-3xl font-semibold leading-none">{profile.pricing || "R950/hr"}</div>
            </div>
            <Button onClick={() => router.push(`/messages?user=${params.id}`)} className="h-14 min-w-[180px] rounded-full bg-red-600 text-lg hover:bg-red-700 active:scale-[0.98]">
              Hire {profile.display_name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block min-h-screen bg-white p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">{profile.display_name}</h1>
          <p className="mt-2 text-neutral-600">{profile.profession}</p>
          <p className="mt-4">{profile.bio}</p>
          <div className="mt-8">
            <AvailabilityCalendar ownerId={profile.id} ownerType="crew" title="Live availability" />
          </div>
        </div>
      </div>
    </div>
  )
}
