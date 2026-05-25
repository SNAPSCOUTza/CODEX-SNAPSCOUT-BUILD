import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function normalizeProfile(profile: any, user: { id: string; email?: string | null }) {
  if (!profile) return null

  const avatar = profile.profile_image_url || profile.profile_picture || profile.avatar_url || null
  return {
    ...profile,
    id: profile.id || profile.user_id || user.id,
    user_id: profile.user_id || user.id,
    username: profile.username || profile.display_name || profile.full_name || null,
    full_name: profile.full_name || null,
    display_name: profile.display_name || profile.full_name || null,
    avatar_url: avatar,
    profile_picture: avatar,
    profile_image_url: avatar,
    email: profile.email || user.email || null,
    location: profile.location || profile.city || null,
    is_profile_visible: profile.is_profile_visible ?? profile.is_public ?? true,
    is_public: profile.is_public ?? profile.is_profile_visible ?? true,
    subscription_status:
      profile.subscription_status || (profile.account_type?.toLowerCase?.() === "scout" ? "active" : "inactive"),
  }
}

export async function GET(request: Request) {
  try {
    console.log("[v0] Profile load request received")
    console.log("[v0] Request URL:", request.url)
    console.log("[v0] Request headers:", Object.fromEntries(request.headers.entries()))

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
      console.error("[v0] Profile load - auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Loading profile for user:", user.id)

    const profile = await prisma.userProfile.findUnique({
      where: { user_id: user.id },
    })

    console.log("[v0] Profile loaded:", profile ? "found" : "null")

    return NextResponse.json({
      success: true,
      profile: normalizeProfile(profile, { id: user.id, email: user.email }),
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error("[v0] Profile load unexpected error:", error.message, error.stack)
    return NextResponse.json({ error: "Failed to load profile: " + error.message }, { status: 500 })
  }
}
