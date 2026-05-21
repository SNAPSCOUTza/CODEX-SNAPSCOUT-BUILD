import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabaseAdmin = isAdminClientAvailable() ? createAdminClient() : null

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

    const dataToSave = {
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
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Upserting profile with data:", JSON.stringify(dataToSave, null, 2))

    const profileClient = supabaseAdmin ?? supabase

    let { data, error } = await profileClient
      .from("user_profiles")
      .upsert(dataToSave, { onConflict: "user_id" })
      .select()
      .single()

    // Graceful fallback for legacy account_type constraints.
    if (error?.message?.toLowerCase().includes("account_type")) {
      const retryPayload = { ...dataToSave, account_type: null }
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    // Graceful fallback for databases that do not yet have availability_status.
    if (error?.message?.toLowerCase().includes("availability_status")) {
      const { availability_status, ...retryPayload } = dataToSave
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    // Graceful fallback for databases that do not yet have new social portfolio columns.
    if (error?.message?.toLowerCase().includes("facebook") || error?.message?.toLowerCase().includes("vimeo") || error?.message?.toLowerCase().includes("imdb_profile")) {
      const { facebook, vimeo, imdb_profile, ...retryPayload } = dataToSave
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error("[v0] Profile save error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const normalized = data
      ? {
          ...data,
          id: data.id || data.user_id || user.id,
          user_id: data.user_id || user.id,
          avatar_url: data.profile_image_url || data.profile_picture || null,
          profile_picture: data.profile_image_url || data.profile_picture || null,
          profile_image_url: data.profile_image_url || data.profile_picture || null,
          username: data.username || data.display_name || data.full_name || null,
          is_public: data.is_public ?? data.is_profile_visible ?? true,
          is_profile_visible: data.is_profile_visible ?? data.is_public ?? true,
          subscription_status:
            data.subscription_status || (data.account_type?.toLowerCase?.() === "scout" ? "active" : "inactive"),
        }
      : null

    console.log("[v0] Profile saved successfully:", normalized?.id)
    return NextResponse.json({ success: true, profile: normalized })
  } catch (error: any) {
    console.error("[v0] Profile save unexpected error:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
