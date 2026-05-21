export type StudioStoreItem = {
  id: number
  name: string
  type: "studio" | "store"
  location: string
  rating: number
  reviews: number
  image: string
  description: string
  services: string[]
  equipment: string[]
  amenities: string[]
  hourlyRate: string
  contact: {
    phone: string
    email: string
    website: string
  }
  verified: boolean
  availability: string
}

export const studiosStoresData: StudioStoreItem[] = [
  {
    id: 1,
    name: "Cape Town Film Studios",
    type: "studio",
    location: "Cape Town, Western Cape",
    rating: 4.8,
    reviews: 124,
    image: "/images/film-clapperboard.jpg",
    description: "Full-service film and television production studio with state-of-the-art equipment and experienced crew.",
    services: ["Film Production", "TV Production", "Commercial Shoots", "Equipment Rental"],
    equipment: ["RED Cameras", "Lighting Rigs", "Sound Equipment", "Editing Suites"],
    amenities: ["Natural Light", "Wi-Fi", "Parking", "Power"],
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
    amenities: ["Gear Insurance", "Wi-Fi", "Parking", "Backup Power"],
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
    amenities: ["Natural Light", "Editing Bay", "Parking", "Power"],
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

export const getStudioStoreById = (id: string | number) =>
  studiosStoresData.find((item) => String(item.id) === String(id))
