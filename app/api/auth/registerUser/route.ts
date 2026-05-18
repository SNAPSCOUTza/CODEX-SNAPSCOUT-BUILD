import { NextResponse } from "next/server"
import { createAdminClient, isAdminClientAvailable } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    if (!isAdminClientAvailable()) {
      return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 })
    }
    const supabaseAdmin = createAdminClient()

    const { email, password, name, user_type } = await request.json()

    console.log("[v0] RegisterUser - Request data:", { email, name, user_type })

    // Validate input
    if (!email || !password || !name || !user_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: name,
        account_type: user_type,
        full_name: name,
      },
    })

    if (error) {
      console.error("[v0] RegisterUser - Error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log("[v0] RegisterUser - User created:", data.user.id)

    let { error: profileError } = await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: data.user.id,
        email,
        full_name: name,
        display_name: name,
        account_type: user_type,
        user_type,
        bio: "",
        profession: user_type === "content_creator" ? "Creative Professional" : user_type,
        is_profile_visible: true,
        availability: "available",
        availability_status: "available",
      },
      { onConflict: "user_id" },
    )

    if (profileError?.message?.toLowerCase().includes("account_type")) {
      const { error: fallbackError } = await supabaseAdmin.from("user_profiles").upsert(
        {
          user_id: data.user.id,
          email,
          full_name: name,
          display_name: name,
          account_type: null,
          user_type,
          bio: "",
          profession: "Creative Professional",
          is_profile_visible: true,
          availability: "available",
          availability_status: "available",
        },
        { onConflict: "user_id" },
      )
      profileError = fallbackError
    }

    if (profileError) {
      console.error("[v0] RegisterUser - Profile creation error:", profileError)
      // Don't fail the request if profile creation fails, user is already created
    } else {
      console.log("[v0] RegisterUser - Profile created for user:", data.user.id)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
