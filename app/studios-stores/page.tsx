"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Star, Camera, Phone, Mail, Globe, SlidersHorizontal, X } from "lucide-react"
import Image from "next/image"
import MobileShell from "@/components/mobile/mobile-shell"
import { motion } from "framer-motion"
import { AvailabilityStatusBadge } from "@/components/availability/availability-status-badge"

export default function StudiosStoresPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Mock data for studios and stores
  const studiosStores = [
    {
      id: 1,
      name: "Cape Town Film Studios",
      type: "studio",
      location: "Cape Town, Western Cape",
      rating: 4.8,
      reviews: 124,
      image: "/images/film-clapperboard.jpg",
      description:
        "Full-service film and television production studio with state-of-the-art equipment and experienced crew.",
      services: ["Film Production", "TV Production", "Commercial Shoots", "Equipment Rental"],
      equipment: ["RED Cameras", "Lighting Rigs", "Sound Equipment", "Editing Suites"],
      hourlyRate: "R2,500 - R5,000",
      contact: {
        phone: "+27 21 123 4567",
        email: "info@capetownfilmstudios.co.za",
        website: "www.capetownfilmstudios.co.za",
      },
      verified: true,
      availability: "Available",
    },
    {
      id: 2,
      name: "Johannesburg Camera Rentals",
      type: "store",
      location: "Johannesburg, Gauteng",
      rating: 4.6,
      reviews: 89,
      image: "/images/camera-viewfinder.jpg",
      description: "Premier camera and equipment rental house serving the Johannesburg film community.",
      services: ["Camera Rental", "Lens Rental", "Lighting Equipment", "Audio Gear"],
      equipment: ["ARRI Cameras", "Canon Cinema", "Sony FX Series", "Zeiss Lenses"],
      hourlyRate: "R500 - R2,000",
      contact: {
        phone: "+27 11 987 6543",
        email: "rentals@jhbcamera.co.za",
        website: "www.jhbcamerarentals.co.za",
      },
      verified: true,
      availability: "Available",
    },
    {
      id: 3,
      name: "Durban Production House",
      type: "studio",
      location: "Durban, KwaZulu-Natal",
      rating: 4.7,
      reviews: 67,
      image: "/images/videography-camera.jpg",
      description: "Creative production studio specializing in commercials, music videos, and corporate content.",
      services: ["Commercial Production", "Music Videos", "Corporate Videos", "Post-Production"],
      equipment: ["Blackmagic Cameras", "DaVinci Resolve", "Pro Tools", "Green Screen"],
      hourlyRate: "R1,800 - R3,500",
      contact: {
        phone: "+27 31 456 7890",
        email: "hello@durbanproduction.co.za",
        website: "www.durbanproduction.co.za",
      },
      verified: false,
      availability: "Booked",
    },
  ]

  const filteredStudiosStores = studiosStores.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.services.some((service) => service.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLocation = selectedLocation === "all" || item.location.includes(selectedLocation)
    const matchesType = selectedType === "all" || item.type === selectedType

    return matchesSearch && matchesLocation && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:hidden">
        <MobileShell
          title="Studios & Stores"
          rightAction={
            <Button
              variant="outline"
              className="w-full border-[#e8e0d5] bg-white text-[#111318]"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Open Filters
            </Button>
          }
        >
          <div className="rounded-[28px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 rounded-2xl border border-[#e7e0d6] bg-[#fffcf7] px-3 py-3">
              <Search className="h-4 w-4 text-[#73757d]" />
              <Input
                placeholder="Search studios, stores, services..."
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
            </div>

            <div className="mt-3 flex gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Studios", value: "studio" },
                { label: "Stores", value: "store" },
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setSelectedType(chip.value)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                    selectedType === chip.value
                      ? "border-[#0d0f13] bg-[#0d0f13] text-white"
                      : "border-[#e7e0d6] bg-white text-[#20232b]"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {filteredStudiosStores.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-[22px] border-[#eee6db] bg-[#fffdf9]">
                  <CardContent className="p-0">
                    <div className="relative h-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#111318]">
                        {item.type === "studio" ? "Studio" : "Equipment Store"}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[16px] font-semibold text-[#0d0f13]">{item.name}</p>
                          <div className="mt-1 flex items-center gap-1 text-[12px] text-[#666b75]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.location}</span>
                          </div>
                          <div className="mt-2">
                            <AvailabilityStatusBadge ownerId={String(item.id)} ownerType={item.type === "studio" ? "studio" : "store"} />
                          </div>
                        </div>
                        {item.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current text-[#0d0f13]" />
                          <span className="font-semibold">{item.rating}</span>
                          <span className="text-[#666b75]">({item.reviews})</span>
                        </div>
                        <span className="font-semibold text-[#0d0f13]">{item.hourlyRate}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] text-[#666b75]">{item.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.services.slice(0, 2).map((service, idx) => (
                          <Badge key={`${item.id}-service-${idx}`} variant="secondary" className="text-[10px]">
                            {service}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a href={`tel:${item.contact.phone}`}>
                          <Button variant="outline" className="h-9 w-full rounded-full border-[#e7e0d6] bg-white text-[12px]">
                            <Phone className="mr-1 h-3.5 w-3.5" />
                            Call
                          </Button>
                        </a>
                        <a href={`mailto:${item.contact.email}`}>
                          <Button className="h-9 w-full rounded-full bg-[#f20d14] text-[12px] text-white hover:bg-[#d80a10]">
                            Contact
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStudiosStores.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[14px] font-medium text-[#1a1d22]">No studios matched this search.</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full border-[#e7e0d6] bg-white"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedLocation("all")
                    setSelectedType("all")
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
          </div>

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
                className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#e8dfd3] bg-[#fffaf4] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[16px] font-semibold">Filters</p>
                  <motion.button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                    aria-label="Close filters"
                    whileTap={{ scale: 0.9, rotate: -8 }}
                  >
                    <X className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Type</p>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="studio">Studios</SelectItem>
                        <SelectItem value="store">Equipment Stores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Location</p>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Cape Town">Cape Town</SelectItem>
                        <SelectItem value="Johannesburg">Johannesburg</SelectItem>
                        <SelectItem value="Durban">Durban</SelectItem>
                        <SelectItem value="Pretoria">Pretoria</SelectItem>
                        <SelectItem value="Port Elizabeth">Port Elizabeth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#f20d14] text-white hover:bg-[#d80a10]" onClick={() => setMobileFiltersOpen(false)}>
                    Apply
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </MobileShell>
      </div>

      <div className="hidden md:block">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Studios & Stores</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find professional studios and equipment rental stores for your next project
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search studios, stores, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Cape Town">Cape Town</SelectItem>
                  <SelectItem value="Johannesburg">Johannesburg</SelectItem>
                  <SelectItem value="Durban">Durban</SelectItem>
                  <SelectItem value="Pretoria">Pretoria</SelectItem>
                  <SelectItem value="Port Elizabeth">Port Elizabeth</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="studio">Studios</SelectItem>
                  <SelectItem value="store">Equipment Stores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">Showing {filteredStudiosStores.length} results</p>
        </div>

        <div className="grid gap-6">
          {filteredStudiosStores.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant={item.type === "studio" ? "default" : "secondary"}
                        className="text-white border-none"
                      >
                        {item.type === "studio" ? "Studio" : "Equipment Store"}
                      </Badge>
                    </div>
                    {item.verified && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="success" className="text-white border-none">
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{item.name}</CardTitle>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{item.rating}</span>
                        <span className="text-gray-600 ml-1">({item.reviews} reviews)</span>
                        <Badge
                          variant={item.availability === "Available" ? "success" : "secondary"}
                          className="ml-3 text-white border-none"
                        >
                          {item.availability}
                        </Badge>
                      </div>
                      <AvailabilityStatusBadge ownerId={String(item.id)} ownerType={item.type === "studio" ? "studio" : "store"} />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">{item.hourlyRate}</p>
                      <p className="text-sm text-gray-600">per hour</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{item.description}</p>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Equipment:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.equipment.map((equipment, index) => (
                        <Badge key={index} variant="secondary">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{item.contact.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{item.contact.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <span>{item.contact.website}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700" size="sm">
                        Contact Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredStudiosStores.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
