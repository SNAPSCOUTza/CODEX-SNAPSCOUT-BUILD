"use client"

import { useState, useEffect, useRef } from "react"
import { Heart, MessageCircle, MapPin, ExternalLink } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SavedProfile {
  user_id: string
  display_name: string
  full_name: string
  profile_picture: string
  city: string
  province: string
  account_type: string
  bio: string
  experience_level: string
  hourly_rate: string
  roles: string[]
  saved_at: string
}

export default function SavedProfilesPage() {
  const [profiles, setProfiles] = useState<SavedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "crew" | "creator" | "studio">("all")
  const initRef = useRef(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    loadSavedProfiles()
  }, [])

  const loadSavedProfiles = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setIsLoading(false)
        return
      }

      setCurrentUserId(session.user.id)

      const { data: favorites, error } = await supabase
        .from("user_favorites")
        .select("favorited_user_id, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching favorites:", error)
        setIsLoading(false)
        return
      }

      if (!favorites || favorites.length === 0) {
        setProfiles([])
        setIsLoading(false)
        return
      }

      const favoritedIds = favorites.map((f: any) => f.favorited_user_id)

      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select(`
          id, user_id, full_name, display_name, username, email, profession, bio, location, city, province,
          profile_image_url, profile_picture, avatar_url, availability, availability_status, pricing,
          hourly_rate, daily_rate, project_rate, skills, social_links, portfolio_images,
          is_public, is_profile_visible, subscription_status
        `)
        .in("user_id", favoritedIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        setIsLoading(false)
        return
      }

      // Merge the saved_at timestamp with profile data and transform to expected format
      const mergedProfiles = (profilesData || []).map((profile: any) => {
        const profileId = profile.user_id || profile.id
        const location = profile.location || [profile.city, profile.province].filter(Boolean).join(", ")
        const favorite = favorites.find((f: any) => f.favorited_user_id === profileId)
        return {
          user_id: profileId,
          display_name: profile.display_name || profile.full_name || profile.username || "Unknown",
          full_name: profile.full_name || profile.display_name || profile.username || "Unknown",
          profile_picture: profile.profile_image_url || profile.profile_picture || profile.avatar_url || "",
          city: profile.city || location?.split(",")[0]?.trim() || "",
          province: profile.province || location?.split(",")[1]?.trim() || "",
          account_type: profile.profession || "Professional",
          bio: profile.bio || "",
          experience_level: "",
          hourly_rate:
            profile.pricing ||
            (profile.hourly_rate ? `R${profile.hourly_rate}/hr` : profile.daily_rate ? `R${profile.daily_rate}/day` : ""),
          roles: profile.skills || [],
          saved_at: favorite?.created_at || "",
        }
      })

      setProfiles(mergedProfiles)
    } catch (error) {
      console.error("Error loading saved profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFavorite = async (profileId: string) => {
    if (!currentUserId) return

    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("favorited_user_id", profileId)

      if (error) throw error

      setProfiles((prev) => prev.filter((p) => p.user_id !== profileId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === "all") return true
    const accountType = profile.account_type?.toLowerCase() || ""
    if (filter === "crew") return accountType === "crew" || accountType === "film_crew"
    if (filter === "creator") return accountType === "creator" || accountType === "content_creator"
    if (filter === "studio") return accountType === "studio" || accountType === "store"
    return true
  })

  const getAccountTypeLabel = (type: string) => {
    const normalized = type?.toLowerCase() || ""
    if (normalized === "crew" || normalized === "film_crew") return "Film Crew"
    if (normalized === "creator" || normalized === "content_creator") return "Creator"
    if (normalized === "studio") return "Studio"
    if (normalized === "store") return "Store"
    return type || "Professional"
  }

  const getProfileLink = (profile: SavedProfile) => {
    const type = profile.account_type?.toLowerCase() || ""
    if (type === "studio") return `/studios/${profile.user_id}`
    if (type === "store") return `/stores/${profile.user_id}`
    return `/profile/${profile.user_id}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view saved profiles</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to save your favorite creators, crew members, and studios
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-primary fill-current" />
          <h1 className="text-3xl font-bold text-foreground">Saved Profiles</h1>
        </div>
        <p className="text-muted-foreground">Quick access to your favorite creators, crew members, and studios</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "crew", label: "Film Crew" },
          { value: "creator", label: "Creators" },
          { value: "studio", label: "Studios & Stores" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.value as typeof filter)}
            className={filter === tab.value ? "bg-primary text-primary-foreground" : ""}
          >
            {tab.label}
            {tab.value === "all" && ` (${profiles.length})`}
          </Button>
        ))}
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {profiles.length === 0 ? "No saved profiles yet" : "No profiles match this filter"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {profiles.length === 0
              ? "Start exploring and save profiles to keep them handy for future projects"
              : "Try selecting a different filter or browse more profiles"}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/find-crew"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Crew
            </Link>
            <Link
              href="/creators"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md border border-border bg-card text-foreground hover:bg-accent transition-colors"
            >
              Browse Creators
            </Link>
            <Link
              href="/studios"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md border border-border bg-card text-foreground hover:bg-accent transition-colors"
            >
              Browse Studios
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card
              key={profile.user_id}
              className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-border">
                      <AvatarImage src={profile.profile_picture || ""} alt={profile.display_name} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                        {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {profile.display_name || profile.full_name}
                      </h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {getAccountTypeLabel(profile.account_type)}
                      </Badge>
                      {profile.city && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {profile.city}
                            {profile.province ? `, ${profile.province}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{profile.bio}</p>}

                  {profile.roles && profile.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profile.roles.slice(0, 3).map((role, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {profile.roles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.roles.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {profile.hourly_rate && (
                    <div className="flex items-center gap-1 mt-3 text-sm font-medium text-foreground">
                      {profile.hourly_rate}
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-3 bg-muted/30 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link href={getProfileLink(profile)}>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/messages?recipient=${profile.user_id}`}>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <MessageCircle className="h-3 w-3" />
                        Message
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(profile.user_id)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
