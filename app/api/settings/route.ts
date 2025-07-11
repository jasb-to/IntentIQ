import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`⚙️ Fetching settings for user ${user.id}`)

    // Fetch user profile and settings
    const [profileResult, settingsResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", user.id).single(),

      supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
    ])

    const profile = profileResult.data
    const settings = settingsResult.data

    return NextResponse.json({
      profile: profile || {
        id: user.id,
        email: user.email,
        full_name: null,
        company_name: null,
        subscription_tier: "free",
        subscription_status: "active",
      },
      settings: settings || {
        email_notifications: true,
        slack_webhook_url: null,
        monitoring_frequency: 60,
        max_leads_per_search: 50,
        platforms: ["reddit", "twitter"],
      },
    })
  } catch (error: any) {
    console.error("❌ Error fetching settings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch settings",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data: updateData } = body

    if (!type || !updateData) {
      return NextResponse.json(
        {
          error: "type and data are required",
        },
        { status: 400 },
      )
    }

    console.log(`⚙️ Updating ${type} for user ${user.id}`)

    if (type === "profile") {
      // Update user profile
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert([
          {
            id: user.id,
            email: user.email,
            ...updateData,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
        throw error
      }

      return NextResponse.json({
        profile: data,
        message: "Profile updated successfully",
      })
    }

    if (type === "settings") {
      // Update user settings
      const { data, error } = await supabase
        .from("user_settings")
        .upsert([
          {
            user_id: user.id,
            ...updateData,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error updating settings:", error)
        throw error
      }

      return NextResponse.json({
        settings: data,
        message: "Settings updated successfully",
      })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error: any) {
    console.error("❌ Error updating settings:", error)
    return NextResponse.json(
      {
        error: "Failed to update settings",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
