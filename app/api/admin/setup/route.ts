import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Only allow setup for the specific admin email
    if (email !== "jaspalbilkhu@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = createServerClient()

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create or update the user profile with admin role
    const { error: profileError } = await supabase.from("user_profiles").upsert({
      id: authData.user.id,
      email: authData.user.email,
      full_name: "Admin User",
      role: "admin",
      permissions: ["all"],
      subscription_tier: "enterprise",
      subscription_status: "active",
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Don't fail if profile creation fails - the user is still created
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
