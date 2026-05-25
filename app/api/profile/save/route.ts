import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const profileData = await request.json()
    console.log("[v0] Profile save request received for user:", profileData.id || profileData.user_id)

    // Verify the user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Profile save - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Authenticated user:", user.id)

    // Ensure the profile owner matches the authenticated user when ids are provided.
    const incomingOwnerId = profileData.user_id || profileData.id
    if (incomingOwnerId && incomingOwnerId !== user.id) {
      console.error("[v0] Profile save - owner mismatch:", incomingOwnerId, "vs", user.id)
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 })
    }

    const socialLinks = profileData.social_links || {}
    const profilePicture = profileData.profile_image_url || profileData.profile_picture || profileData.avatar_url || null
    const isVisible = profileData.is_profile_visible ?? profileData.is_public ?? true

    const dataToSave: any = {
      user_id: user.id,
      full_name: profileData.full_name || null,
      display_name: profileData.display_name || null,
      account_type: profileData.account_type || null,
      user_type: profileData.account_type || profileData.user_type || null,
      email: profileData.email || user.email,
      bio: profileData.bio || null,
      profession: profileData.profession || "Creative",
      location: profileData.location || profileData.city || null,
      city: profileData.city || profileData.location || null,
      profile_picture: profilePicture,
      availability: profileData.availability || "available",
      availability_status: profileData.availability_status || profileData.availability || "available",
      is_profile_visible: isVisible,
      instagram: socialLinks.instagram || profileData.instagram || null,
      linkedin: socialLinks.linkedin || profileData.linkedin || null,
      youtube: socialLinks.youtube || profileData.youtube || null,
      facebook: socialLinks.facebook || profileData.facebook || null,
      vimeo: socialLinks.vimeo || profileData.vimeo || null,
      imdb_profile: socialLinks.imdb || socialLinks.imdb_profile || profileData.imdb || profileData.imdb_profile || null,
      website: socialLinks.website || profileData.website || null,
      portfolio_images: profileData.portfolio_images || [],
      skills: profileData.skills || [],
      hourly_rate: profileData.hourly_rate || null,
      daily_rate: profileData.daily_rate || null,
      project_rate: profileData.project_rate || null,
      onboarding_data: profileData.onboarding_data || null,
      updated_at: new Date(),
    }

    console.log("[v0] Upserting profile with data:", JSON.stringify(dataToSave, null, 2))

    const data = await prisma.userProfile.upsert({
      where: { user_id: user.id },
      update: { ...dataToSave, updated_at: new Date() },
      create: dataToSave,
    })

    const savedProfile: any = data
    const normalized = savedProfile
      ? {
          ...savedProfile,
          id: savedProfile.id || savedProfile.user_id || user.id,
          user_id: savedProfile.user_id || user.id,
          avatar_url: savedProfile.profile_image_url || savedProfile.profile_picture || null,
          profile_picture: savedProfile.profile_image_url || savedProfile.profile_picture || null,
          profile_image_url: savedProfile.profile_image_url || savedProfile.profile_picture || null,
          username: savedProfile.username || savedProfile.display_name || savedProfile.full_name || null,
          is_public: savedProfile.is_public ?? savedProfile.is_profile_visible ?? true,
          is_profile_visible: savedProfile.is_profile_visible ?? savedProfile.is_public ?? true,
          subscription_status:
            savedProfile.subscription_status ||
            (savedProfile.account_type?.toLowerCase?.() === "scout" ? "active" : "inactive"),
        }
      : null

    console.log("[v0] Profile saved successfully:", normalized?.id)
    return NextResponse.json({ success: true, profile: normalized })
  } catch (error: any) {
    console.error("[v0] Profile save unexpected error:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
