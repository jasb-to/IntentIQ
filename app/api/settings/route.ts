import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authorization.replace("Bearer ", ""))

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: settings, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // Not found error
      throw error
    }

    // Return default settings if none exist
    const defaultSettings = {
      user_id: user.id,
      email_notifications: true,
      slack_webhook_url: null,
      monitoring_frequency: 60,
      max_leads_per_search: 50,
      platforms: ["reddit", "twitter"],
      min_intent_score: "MEDIUM",
      auto_save_high_intent: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings,
    })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authorization.replace("Bearer ", ""))

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      email_notifications,
      slack_webhook_url,
      monitoring_frequency,
      max_leads_per_search,
      platforms,
      min_intent_score,
      auto_save_high_intent,
    } = body

    const updateData: any = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (email_notifications !== undefined) updateData.email_notifications = email_notifications
    if (slack_webhook_url !== undefined) updateData.slack_webhook_url = slack_webhook_url
    if (monitoring_frequency !== undefined) updateData.monitoring_frequency = monitoring_frequency
    if (max_leads_per_search !== undefined) updateData.max_leads_per_search = max_leads_per_search
    if (platforms !== undefined) updateData.platforms = platforms
    if (min_intent_score !== undefined) updateData.min_intent_score = min_intent_score
    if (auto_save_high_intent !== undefined) updateData.auto_save_high_intent = auto_save_high_intent

    const { data: updatedSettings, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          ...updateData,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
