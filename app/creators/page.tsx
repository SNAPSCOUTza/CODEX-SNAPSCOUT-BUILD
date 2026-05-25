"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, MapPin, Star, Calendar, Award, Loader2, ImageIcon, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MessageButton } from "@/components/messaging/message-button"
import { SaveProfileButton } from "@/components/messaging/save-profile-button"
import { SaveToPoolButton } from "@/components/crew/SaveToPoolButton"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockCreators } from "@/lib/mock-data/creators-data"
import MobileShell from "@/components/mobile/mobile-shell"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"
import { HireRequestSheet } from "@/components/booking/hire-request-sheet"
import type { AvailabilityOwnerType } from "@/lib/availability"
import { AnimatedCount } from "@/components/ui/animated-count"
import { MotionRevealGroup, MotionRevealItem, MotionRevealSolo } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"

export default function CreatorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [creators, setCreators] = useState<any[]>([])
  const [hireRequestCreator, setHireRequestCreator] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id, user_id, full_name, display_name, username, email, profession, bio, location, city, province,
          profile_image_url, profile_picture, avatar_url, availability, availability_status, pricing,
          hourly_rate, daily_rate, project_rate, skills, social_links, portfolio_images,
          is_public, is_profile_visible, subscription_status, created_at
        `)
        .eq("is_profile_visible", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      const liveProfiles = (data || []).map((profile: any) => {
        const profileId = profile.user_id || profile.id
        const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
        const pricing =
          profile.pricing ||
          (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : "")

        return {
          id: profileId,
          user_id: profileId,
          display_name: profile.display_name || profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.display_name || profile.username || "Unknown",
          profession: profile.profession || "Creator",
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "",
          profile_picture: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          bio: profile.bio,
          availability_status: profile.availability_status || profile.availability || "Available",
          skills: profile.skills || [],
          specializations: profile.skills || [],
          is_public: profile.is_profile_visible ?? profile.is_public ?? true,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 100) + 20,
          pricing,
          portfolioImages: profile.portfolio_images || [],
          isLiveProfile: true, // Flag to identify live profiles
        }
      })

      // Live profiles appear first, then mock profiles
      const combinedProfiles = [...liveProfiles, ...mockCreators.map((c) => ({ ...c, isLiveProfile: false }))]

      setCreators(combinedProfiles)
      setUsingMockData(liveProfiles.length === 0)
    } catch (error: any) {
      console.error("[v0] Error fetching creators:", error?.message || error)
      setCreators(mockCreators.map((c) => ({ ...c, isLiveProfile: false })))
      setUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.specializations?.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
      creator.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterType || creator.profession?.toLowerCase() === filterType.toLowerCase()
    const matchesService =
      !serviceFilter ||
      (creator.specializations || creator.skills || []).some((service: string) =>
        service.toLowerCase() === serviceFilter.toLowerCase(),
      )
    return matchesSearch && matchesFilter && matchesService
  })

  const creatorServices = useMemo(() => {
    const services = new Set<string>()
    creators.forEach((creator) => {
      ;(creator.specializations || creator.skills || []).forEach((service: string) => {
        if (service) services.add(service)
      })
    })
    return Array.from(services).slice(0, 12)
  }, [creators])

  const getOwnerType = (profession?: string): AvailabilityOwnerType => {
    const value = profession?.toLowerCase() || ""
    if (value.includes("photo")) return "photographer"
    if (value.includes("video")) return "videographer"
    return "crew"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden">
        <MobileShell
          title="Browse Creatives"
          rightAction={
            <Button
              variant="outline"
              className="w-full border-[#e8e0d5] bg-white text-[#111318]"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          }
        >
          <MotionRevealGroup className="rounded-[28px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
            <MotionRevealItem className="flex items-center gap-2 rounded-2xl border border-[#e7e0d6] bg-white px-3 py-3">
              <Search className="h-4 w-4 text-[#73757d]" />
              <Input
                placeholder="Search creatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0"
              />
              <motion.button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                whileTap={{ scale: 0.92 }}
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#111318]" />
              </motion.button>
            </MotionRevealItem>

            <MotionRevealItem className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {[
                { label: "All", value: "" },
                { label: "Photographers", value: "photographer" },
                { label: "Videographers", value: "videographer" },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => setFilterType(item.value)}
                  whileTap={{ scale: 0.96 }}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    filterType === item.value
                      ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                      : "border-[#e7e0d6] bg-white text-[#20232b]"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </MotionRevealItem>

            <MotionRevealItem className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              <motion.button
                type="button"
                onClick={() => setServiceFilter("")}
                whileTap={{ scale: 0.96 }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                  serviceFilter === ""
                    ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                    : "border-[#e7e0d6] bg-white text-[#20232b]"
                }`}
              >
                All services
              </motion.button>
              {creatorServices.map((service: string) => (
                <motion.button
                  key={service}
                  type="button"
                  onClick={() => setServiceFilter(service)}
                  whileTap={{ scale: 0.96 }}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    serviceFilter === service
                      ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                      : "border-[#e7e0d6] bg-white text-[#20232b]"
                  }`}
                >
                  {service}
                </motion.button>
              ))}
            </MotionRevealItem>

            <div className="mt-4 space-y-4">
              {filteredCreators.map((creator, index) => (
                <StickyScrollCard key={creator.id} top="88px" delay={0.1 + index * 0.08}>
                <Card className="overflow-hidden rounded-[26px] border-[#ece4da] bg-white shadow-[0_16px_34px_rgba(0,0,0,0.05)]">
                  <CardContent className="p-3">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.38, ease: "easeOut" }}>
                      <Link href={`/creators/${creator.user_id}`} className="relative block h-[176px] w-full overflow-hidden rounded-[20px]">
                        <Image
                          src={(creator.portfolioImages && creator.portfolioImages[0]) || creator.profile_picture || "/placeholder.svg?height=176&width=330"}
                          alt={creator.display_name || creator.full_name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </motion.div>
                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[21px] font-semibold leading-none text-[#111318]">
                            {creator.display_name || creator.full_name}
                          </p>
                          <p className="mt-1 text-[13px] font-medium text-[#ef1218]">{creator.profession}</p>
                          <div className="mt-1 flex items-center gap-1 text-[12px] text-[#666b75]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{creator.city || "South Africa"}</span>
                          </div>
                          <div className="mt-2">
                            <AvailabilityStatusBadge ownerId={creator.user_id || creator.id} ownerType={getOwnerType(creator.profession)} />
                          </div>
                        </div>
                        <SaveProfileButton
                          profileId={creator.user_id}
                          profileName={creator.display_name || creator.full_name}
                          variant="ghost"
                          size="icon"
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl border border-[#eef1f6] bg-white px-2 py-2 text-center">
                          <p className="text-[18px] font-semibold leading-none text-[#111318]">
                            <AnimatedCount value={Math.round((creator.reviews || 40) + 80)} suffix="+" />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Projects</p>
                        </div>
                        <div className="rounded-2xl border border-[#eef1f6] bg-white px-2 py-2 text-center">
                          <p className="text-[18px] font-semibold leading-none text-[#111318]">
                            <AnimatedCount value={Math.max(2, Math.round((creator.rating || 4.8) - 0.5))} />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Years</p>
                        </div>
                        <div className="rounded-2xl border border-[#eef1f6] bg-white px-2 py-2 text-center">
                          <p className="text-[18px] font-semibold leading-none text-[#111318]">
                            <AnimatedCount value={Math.min(99, Math.round((creator.rating || 4.8) * 20))} suffix="%" />
                          </p>
                          <p className="mt-1 text-[11px] text-[#676b75]">Response</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(creator.specializations || []).slice(0, 4).map((tag: string) => (
                          <Badge key={tag} className="rounded-full border-0 bg-[#111318] px-3 py-1 text-[11px] font-medium text-white">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[12px] text-[#666b75]">From</p>
                          <p className="text-[34px] font-semibold leading-none text-[#111318]">{creator.pricing ? creator.pricing.split("/")[0] : "R950"}</p>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-2">
                          <MessageButton
                            recipientId={creator.user_id}
                            recipientName={creator.display_name || creator.full_name}
                            variant="outline"
                            size="icon"
                          />
                          <SaveToPoolButton
                            profileId={creator.user_id || creator.id}
                            profileName={creator.display_name || creator.full_name}
                            variant="outline"
                            size="icon"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.24 + index * 0.1 }}
                            className="w-[70%]"
                          >
                            <Button
                              type="button"
                              onClick={() => setHireRequestCreator(creator)}
                              className="h-12 w-full rounded-full bg-[#ef1218] text-[15px] font-semibold text-white hover:bg-[#d90d12]"
                            >
                              Hire
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </StickyScrollCard>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[14px] font-medium text-[#1a1d22]">No creators match this filter yet.</p>
                <Button variant="outline" className="mt-3 rounded-full border-[#e7e0d6] bg-white" onClick={() => setFilterType("")}>
                  Reset Filters
                </Button>
              </div>
            )}
          </MotionRevealGroup>

          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-black/35"
            >
              <motion.div
                initial={{ y: 40, opacity: 0.9 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#e8dfd3] bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[16px] font-semibold">Filter Creatives</p>
                  <motion.button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    whileTap={{ scale: 0.9, rotate: -8 }}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                  >
                    <X className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <div className="grid gap-2">
                  <Button
                    variant={filterType === "" ? "default" : "outline"}
                    className={
                      filterType === ""
                        ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                        : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                    }
                    onClick={() => {
                      setFilterType("")
                      setMobileFiltersOpen(false)
                    }}
                  >
                    All Creatives
                  </Button>
                  <Button
                    variant={filterType === "photographer" ? "default" : "outline"}
                    className={
                      filterType === "photographer"
                        ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                        : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                    }
                    onClick={() => {
                      setFilterType("photographer")
                      setMobileFiltersOpen(false)
                    }}
                  >
                    Photographers
                  </Button>
                  <Button
                    variant={filterType === "videographer" ? "default" : "outline"}
                    className={
                      filterType === "videographer"
                        ? "h-12 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
                        : "h-12 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
                    }
                    onClick={() => {
                      setFilterType("videographer")
                      setMobileFiltersOpen(false)
                    }}
                  >
                    Videographers
                  </Button>
                  <SelectServiceButtons
                    services={creatorServices}
                    selectedService={serviceFilter}
                    onSelectService={(service) => {
                      setServiceFilter(service)
                      setMobileFiltersOpen(false)
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </MobileShell>
      </div>

      <div className="hidden md:block">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hire Top <span className="text-primary-foreground/80">Videographers</span> &{" "}
              <span className="text-primary-foreground/80">Photographers</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Connect with South Africa's most talented visual creators for your next project
            </p>

            {/* Search Bar */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search by name, specialty, or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-foreground"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search Creators
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        {usingMockData && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2 text-warning-foreground">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">
              Showing mock data for testing. Real profiles will appear once users sign up.
            </span>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filters:</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={filterType === "" ? "default" : "outline"}
                onClick={() => setFilterType("")}
                className={`transition-all duration-200 ${
                  filterType === ""
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                All
              </Button>
              <Button
                variant={filterType === "photographer" ? "default" : "outline"}
                onClick={() => setFilterType("photographer")}
                className={`transition-all duration-200 ${
                  filterType === "photographer"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                Photographers
              </Button>
              <Button
                variant={filterType === "videographer" ? "default" : "outline"}
                onClick={() => setFilterType("videographer")}
                className={`transition-all duration-200 ${
                  filterType === "videographer"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                }`}
              >
                Videographers
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {filteredCreators.length} Creator{filteredCreators.length !== 1 ? "s" : ""} Found
          </h2>
          <div className="flex items-center space-x-4">
            <Link href="/marketplace">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View Available Projects
              </Button>
            </Link>
            <Link href="/marketplace/post-project">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Post a Project</Button>
            </Link>
          </div>
        </div>

        {/* Creator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator, index) => (
            <StickyScrollCard key={creator.id} top="116px" delay={0.08 + index * 0.06}>
            <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {creator.portfolioImages && creator.portfolioImages.length > 0 && (
                <div className="grid grid-cols-4 gap-0.5 h-24">
                  {creator.portfolioImages.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="relative overflow-hidden">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Portfolio ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0 w-20 h-20">
                    <Image
                      src={creator.profile_picture || "/placeholder.svg?height=80&width=80"}
                      alt={creator.display_name || creator.full_name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-full h-full"
                    />
                    {creator.is_public && (
                      <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                        <Award className="w-4 h-4 text-success-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Creator Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg truncate text-foreground">
                          {creator.display_name || creator.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{creator.profession}</p>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium text-foreground">
                          {creator.rating?.toFixed(1) || "4.5"}
                        </span>
                        <span className="text-xs text-muted-foreground">({creator.reviews || 0})</span>
                      </div>
                    </div>

                    {/* Location */}
                    {creator.city && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {creator.city}, {creator.province}
                        </span>
                      </div>
                    )}

                    {/* Specializations */}
                    {creator.specializations && creator.specializations.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {creator.specializations.slice(0, 3).map((spec: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {creator.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{creator.specializations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {creator.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{creator.bio}</p>}

                    {/* Rates and Availability */}
                    <div className="flex items-center justify-between mt-3 text-sm">
                      {creator.pricing && <span className="font-semibold text-success">{creator.pricing}</span>}
                      <AvailabilityStatusBadge ownerId={creator.user_id || creator.id} ownerType={getOwnerType(creator.profession)} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <SaveProfileButton
                        profileId={creator.user_id}
                        profileName={creator.display_name || creator.full_name}
                        variant="ghost"
                        size="icon"
                      />
                      <SaveToPoolButton
                        profileId={creator.user_id || creator.id}
                        profileName={creator.display_name || creator.full_name}
                        variant="outline"
                        size="icon"
                      />
                      <Link href={`/creators/${creator.user_id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-card text-card-foreground hover:bg-accent">
                          View Profile
                        </Button>
                      </Link>
                      <MessageButton
                        recipientId={creator.user_id}
                        recipientName={creator.display_name || creator.full_name}
                        variant="outline"
                        size="icon"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </StickyScrollCard>
          ))}
        </div>

        {/* No Results */}
        {filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No creators found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={() => setFilterType("")}>Clear Filters</Button>
          </div>
        )}
      </div>
      </div>
      {hireRequestCreator && (
        <HireRequestSheet
          open={!!hireRequestCreator}
          onOpenChange={(open) => {
            if (!open) setHireRequestCreator(null)
          }}
          talentId={hireRequestCreator.user_id || hireRequestCreator.id}
          talentName={hireRequestCreator.display_name || hireRequestCreator.full_name || "Creative"}
          talentType="creator"
          priceLabel={hireRequestCreator.pricing || "R950/hr"}
        />
      )}
    </div>
  )
}

function SelectServiceButtons({
  services,
  selectedService,
  onSelectService,
}: {
  services: string[]
  selectedService: string
  onSelectService: (service: string) => void
}) {
  if (!services.length) return null
  return (
    <div className="mt-1 space-y-2">
      <p className="px-1 text-[12px] font-semibold text-[#555d68]">Services</p>
      {services.slice(0, 10).map((service) => (
        <Button
          key={service}
          variant={selectedService === service ? "default" : "outline"}
          className={
            selectedService === service
              ? "h-11 rounded-full bg-[#f20d14] text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#d80a10]"
              : "h-11 rounded-full border-[#e7e0d6] bg-white shadow-sm transition-transform active:scale-[0.98]"
          }
          onClick={() => onSelectService(service)}
        >
          {service}
        </Button>
      ))}
    </div>
  )
}
