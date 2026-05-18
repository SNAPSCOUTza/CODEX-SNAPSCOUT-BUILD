"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Camera,
  Briefcase,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Settings,
  CreditCard,
  LogOut,
  Eye,
  EyeOff,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, signOut } from "@/lib/auth"
import { SubscriptionCard } from "@/components/dashboard/subscription-card"
import { calculateProfileCompleteness } from "@/lib/profile-utils"
import { AvailabilityManager } from "@/components/availability/availability-manager"
import type { AvailabilityOwnerType } from "@/lib/availability"

interface UserProfile {
  id?: string
  full_name: string
  display_name?: string
  account_type?: string
  email?: string
  bio: string
  profession: string
  location: string
  profile_image_url: string
  availability: string
  is_public: boolean
  social_links: {
    instagram?: string
    linkedin?: string
    youtube?: string
    website?: string
    twitter?: string
    vimeo?: string
  }
  portfolio_images: string[]
  skills?: any
  pricing?: string
  subscription_status?: string
}

interface UserSubscription {
  status: string
  next_payment_date?: string
}

const SOUTH_AFRICA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

const PROVINCE_CITIES: Record<string, string[]> = {
  "Eastern Cape": ["Port Elizabeth", "East London", "Makhanda", "Bhisho", "Mthatha"],
  "Free State": ["Bloemfontein", "Welkom", "Bethlehem", "Kroonstad", "Sasolburg"],
  Gauteng: ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand", "Centurion"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ballito"],
  Limpopo: ["Polokwane", "Tzaneen", "Thohoyandou", "Musina", "Mokopane"],
  Mpumalanga: ["Mbombela", "Witbank", "Secunda", "Middelburg", "Ermelo"],
  "North West": ["Rustenburg", "Mahikeng", "Klerksdorp", "Potchefstroom", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Knysna", "Worcester"],
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: "creator", label: "Creator / Freelancer" },
  { value: "scout", label: "Scout / Client" },
  { value: "studio", label: "Studio Owner" },
  { value: "store", label: "Equipment Store" },
]

function isEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unsaved">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)

  const initialProfileRef = useRef<UserProfile | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [profileData, setProfileData] = useState<UserProfile>({
    full_name: "",
    bio: "",
    profession: "",
    location: "",
    profile_image_url: "",
    availability: "available",
    is_public: false,
    social_links: {},
    portfolio_images: [],
  })
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [activeSection, setActiveSection] = useState("profile")
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)
  const [passwordResetError, setPasswordResetError] = useState("")

  const [profileCompleteness, setProfileCompleteness] = useState(0)

  const dashboardOwnerType: AvailabilityOwnerType =
    profileData.account_type === "studio"
      ? "studio"
      : profileData.account_type === "store"
        ? "store"
        : profileData.profession?.toLowerCase().includes("photo")
          ? "photographer"
          : profileData.profession?.toLowerCase().includes("video")
            ? "videographer"
            : "crew"

  const hasUnsavedChanges = useCallback(() => {
    if (!initialProfileRef.current) return false

    const currentProfile = {
      ...profileData,
      location: selectedProvince && selectedCity ? `${selectedCity}, ${selectedProvince}` : profileData.location,
    }

    return !isEqual(currentProfile, initialProfileRef.current)
  }, [profileData, selectedProvince, selectedCity])

  useEffect(() => {
    if (initialProfileRef.current && hasUnsavedChanges()) {
      setSaveStatus("unsaved")
    }
  }, [profileData, selectedProvince, selectedCity, hasUnsavedChanges])

  const loadProfile = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile/load", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const result = await response.json()

      if (!response.ok || result.error) {
        console.error("[v0] Dashboard: Error loading profile:", result.error)
        console.error("[v0] Dashboard: Response status:", response.status)
        setLoading(false)
        return
      }

      if (result.profile) {
        const profile = result.profile
        const newProfileData = {
          full_name: profile.full_name || "",
          display_name: profile.display_name || "",
          account_type: profile.account_type || "creator",
          bio: profile.bio || "",
          profession: profile.profession || "",
          location: profile.location || "",
          profile_image_url: profile.profile_image_url || "",
          availability: profile.availability || "available",
          pricing: profile.pricing || "",
          is_public: profile.is_public ?? true,
          skills: profile.skills || [],
          social_links: profile.social_links || {
            website: "",
            instagram: "",
            twitter: "",
            linkedin: "",
            youtube: "",
            vimeo: "",
          },
          portfolio_images: profile.portfolio_images || [],
          subscription_status: profile.subscription_status || "free",
        }

        setProfileData(newProfileData)
        initialProfileRef.current = newProfileData

        const completeness = calculateProfileCompleteness(profile)
        setProfileCompleteness(completeness)

        // Parse location if it contains city, province format
        if (profile.location && profile.location.includes(",")) {
          const [city, province] = profile.location.split(",").map((s: string) => s.trim())
          setSelectedCity(city)
          setSelectedProvince(province)
        }
      }
    } catch (error) {
      console.error("[v0] Dashboard: Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true)

      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      await loadProfile(currentUser.id)

      // Fetch subscription
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("status, next_payment_date")
        .eq("user_id", currentUser.id)
        .maybeSingle()

      if (subData) {
        setSubscription(subData)
      }
    }

    initializeDashboard()
  }, [router])

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  const handleImageUpload = (file: File, field: "profile_image_url" | "portfolio_images") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      if (field === "profile_image_url") {
        handleInputChange("profile_image_url", base64)
      } else {
        const updatedImages = [...profileData.portfolio_images, base64]
        handleInputChange("portfolio_images", updatedImages)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user) {
      setSaveError("You must be logged in to save your profile")
      setSaveStatus("error")
      return
    }

    // Check if there are actual changes
    if (!hasUnsavedChanges()) {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      return
    }

    setSaveStatus("saving")
    setSaveError(null)

    try {
      const location = selectedProvince && selectedCity ? `${selectedCity}, ${selectedProvince}` : profileData.location

      const profileToSave = {
        id: user.id,
        full_name: profileData.full_name,
        display_name: profileData.display_name,
        account_type: profileData.account_type,
        email: user.email,
        bio: profileData.bio,
        profession: profileData.profession || "Creative",
        location,
        profile_image_url: profileData.profile_image_url,
        availability: profileData.availability,
        is_public: profileData.is_public,
        social_links: profileData.social_links,
        portfolio_images: profileData.portfolio_images,
        pricing: profileData.pricing,
        skills: profileData.skills,
        updated_at: new Date().toISOString(),
      }

      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileToSave),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        console.error("[v0] Dashboard: Save error:", result.error)
        setSaveError(result.error || "Failed to save profile")
        setSaveStatus("error")
      } else {
        initialProfileRef.current = {
          ...profileData,
          location,
        }
        setSaveStatus("saved")

        const completeness = calculateProfileCompleteness(result.profile)
        setProfileCompleteness(completeness)

        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    } catch (error: any) {
      console.error("[v0] Dashboard: Unexpected error:", error)
      setSaveError("Could not connect to database")
      setSaveStatus("error")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const removePortfolioImage = (index: number) => {
    const updatedImages = profileData.portfolio_images.filter((_, i) => i !== index)
    handleInputChange("portfolio_images", updatedImages)
  }

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return

    setPasswordResetLoading(true)
    setPasswordResetError("")
    setPasswordResetSent(false)

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setPasswordResetSent(true)
    } catch (err) {
      setPasswordResetError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setPasswordResetLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )
      case "saved":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">All changes saved</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{saveError || "Error saving"}</span>
          </div>
        )
      case "unsaved":
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unsaved changes</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <SaveStatusIndicator />
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveProfile}
                disabled={saveStatus === "saving"}
                variant={saveStatus === "unsaved" ? "default" : "outline"}
                className={saveStatus === "unsaved" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {/* Profile Preview */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profile_image_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                        {profileData.display_name?.charAt(0) ||
                          profileData.full_name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1 bg-red-500 rounded-full cursor-pointer hover:bg-red-600">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, "profile_image_url")
                        }}
                      />
                    </label>
                  </div>
                  <h2 className="mt-4 font-semibold text-gray-900">
                    {profileData.display_name || profileData.full_name || "Your Name"}
                  </h2>
                  <p className="text-sm text-gray-500">{profileData.profession || "Your Profession"}</p>
                  {profileData.account_type && (
                    <Badge variant="outline" className="mt-2 mr-2 capitalize">
                      {ACCOUNT_TYPE_OPTIONS.find((opt) => opt.value === profileData.account_type)?.label ||
                        profileData.account_type}
                    </Badge>
                  )}
                  <Badge variant={profileData.is_public ? "default" : "secondary"} className="mt-2">
                    {profileData.is_public ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" /> Hidden
                      </>
                    )}
                  </Badge>
                  {/* Profile Completeness */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Profile Completeness: {profileCompleteness}%</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {[
                    { id: "profile", icon: User, label: "Profile" },
                    { id: "portfolio", icon: Briefcase, label: "Portfolio" },
                    { id: "settings", icon: Settings, label: "Settings" },
                    { id: "subscription", icon: CreditCard, label: "Subscription" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeSection === item.id ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {user?.id && (
              <AvailabilityManager ownerId={user.id} ownerType={dashboardOwnerType} />
            )}

            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile details to help clients find you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Display Name and Account Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={profileData.display_name || ""}
                        onChange={(e) => handleInputChange("display_name", e.target.value)}
                        placeholder="How you want to be known"
                      />
                      <p className="text-xs text-gray-500 mt-1">This name will be shown on your public profile</p>
                    </div>
                    <div>
                      <Label htmlFor="account_type">Account Type</Label>
                      <Select
                        value={profileData.account_type || "creator"}
                        onValueChange={(value) => handleInputChange("account_type", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ACCOUNT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">Determines how you appear in search results</p>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        id="profession"
                        value={profileData.profession}
                        onChange={(e) => handleInputChange("profession", e.target.value)}
                        placeholder="e.g. Cinematographer, Sound Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Brief description of your skills and experience..."
                      rows={4}
                    />
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Province</Label>
                      <Select
                        value={selectedProvince}
                        onValueChange={(value) => {
                          setSelectedProvince(value)
                          setSelectedCity("")
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {SOUTH_AFRICA_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>City</Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {selectedProvince &&
                            PROVINCE_CITIES[selectedProvince]?.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Availability</Label>
                      <Select
                        value={profileData.availability}
                        onValueChange={(value) => handleInputChange("availability", value)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-500">Make your profile visible to clients</p>
                      </div>
                      <Switch
                        checked={profileData.is_public}
                        onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <Label className="mb-4 block">Social Links</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.instagram || ""}
                          onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                          placeholder="Instagram username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.linkedin || ""}
                          onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                          placeholder="LinkedIn profile URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.youtube || ""}
                          onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                          placeholder="YouTube channel URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <Input
                          value={profileData.social_links.website || ""}
                          onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                          placeholder="Website URL"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "portfolio" && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Showcase your best work to attract clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profileData.portfolio_images.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePortfolioImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, "portfolio_images")
                        }}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Section */}
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Password Reset Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Password & Security</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Need to change your password? We'll send a secure reset link to your email address.
                    </p>

                    {passwordResetSent && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>Password reset email sent! Check your inbox for the reset link.</span>
                      </div>
                    )}

                    {passwordResetError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{passwordResetError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Button
                        variant="default"
                        onClick={() => router.push("/dashboard/change-password")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                      <span className="text-gray-400 text-sm">or</span>
                      <Button
                        variant="outline"
                        onClick={handleRequestPasswordReset}
                        disabled={passwordResetLoading || passwordResetSent}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                      >
                        {passwordResetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : passwordResetSent ? (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Email Sent
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Reset via Email
                          </>
                        )}
                      </Button>
                      {passwordResetSent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPasswordResetSent(false)}
                          className="text-gray-500"
                        >
                          Send Again
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "subscription" && (
              <SubscriptionCard
                subscription={subscription as any}
                userEmail={user?.email || ""}
                onSubscriptionChange={() => {
                  // Refresh subscription data
                  window.location.reload()
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
