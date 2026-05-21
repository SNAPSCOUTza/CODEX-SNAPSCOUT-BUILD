import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabaseAdmin = isAdminClientAvailable() ? createAdminClient() : null

    const profileData = await request.json()
    console.log("[v0] Profile update request received")

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
      console.error("[v0] Profile update - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Authenticated user:", user.id)

    const incomingOwnerId = profileData.user_id || profileData.id
    if (incomingOwnerId && incomingOwnerId !== user.id) {
      console.error("[v0] Profile update - ID mismatch")
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 })
    }

    const socialLinks = profileData.social_links || {}
    const profilePicture = profileData.profile_image_url || profileData.profile_picture || profileData.avatar_url || null

    const updateData: any = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    // Map all possible profile fields
    const profileFields = [
      "full_name",
      "display_name",
      "account_type",
      "email",
      "bio",
      "profession",
      "location",
      "profile_image_url",
      "availability",
      "is_public",
      "pricing",
      "skills",
      "portfolio_images",
      "hourly_rate",
      "daily_rate",
      "project_rate",
    ]

    profileFields.forEach((field) => {
      if (field in profileData && profileData[field] !== undefined) {
        if (["skills", "portfolio_images", "social_links"].includes(field)) {
          if (typeof profileData[field] === "string") {
            try {
              updateData[field] = JSON.parse(profileData[field])
            } catch {
              updateData[field] = profileData[field]
            }
          } else {
            updateData[field] = profileData[field]
          }
        } else {
          updateData[field] = profileData[field]
        }
      }
    })

    console.log("[v0] Updating profile with fields:", Object.keys(updateData))

    updateData.profile_picture = profilePicture
    updateData.user_type = profileData.account_type || profileData.user_type || null
    updateData.is_profile_visible = profileData.is_profile_visible ?? profileData.is_public ?? true
    updateData.availability_status = profileData.availability_status || profileData.availability || "available"
    updateData.instagram = socialLinks.instagram || profileData.instagram || null
    updateData.linkedin = socialLinks.linkedin || profileData.linkedin || null
    updateData.youtube = socialLinks.youtube || profileData.youtube || null
    updateData.facebook = socialLinks.facebook || profileData.facebook || null
    updateData.vimeo = socialLinks.vimeo || profileData.vimeo || null
    updateData.imdb_profile = socialLinks.imdb || socialLinks.imdb_profile || profileData.imdb || profileData.imdb_profile || null
    updateData.website = socialLinks.website || profileData.website || null
    updateData.city = profileData.city || profileData.location || null

    const profileClient = supabaseAdmin ?? supabase

    let { data, error } = await profileClient
      .from("user_profiles")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()

    if (error?.message?.toLowerCase().includes("account_type")) {
      const retry = await profileClient
        .from("user_profiles")
        .upsert({ ...updateData, account_type: null }, { onConflict: "user_id" })
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error?.message?.toLowerCase().includes("availability_status")) {
      const { availability_status, ...retryPayload } = updateData
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    if (error?.message?.toLowerCase().includes("facebook") || error?.message?.toLowerCase().includes("vimeo") || error?.message?.toLowerCase().includes("imdb_profile")) {
      const { facebook, vimeo, imdb_profile, ...retryPayload } = updateData
      const retry = await profileClient.from("user_profiles").upsert(retryPayload, { onConflict: "user_id" }).select().single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error("[v0] Profile update error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Profile updated successfully")
    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error("[v0] Profile update unexpected error:", error.message)
    return NextResponse.json({ error: "Failed to update profile: " + error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabaseAdmin = isAdminClientAvailable() ? createAdminClient() : null

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileClient = supabaseAdmin ?? supabase
    const { data: profile, error } = await profileClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Profile fetch error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("[v0] Profile fetch unexpected error:", error.message)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
