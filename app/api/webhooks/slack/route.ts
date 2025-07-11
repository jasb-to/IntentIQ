import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, webhook_url, test_message } = body

    if (!user_id || !webhook_url) {
      return NextResponse.json(
        {
          error: "User ID and webhook URL are required",
        },
        { status: 400 },
      )
    }

    // Validate webhook URL format
    if (!webhook_url.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json(
        {
          error: "Invalid Slack webhook URL format",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // Update user settings with webhook URL
    const { error: updateError } = await supabase.from("user_settings").upsert(
      {
        user_id,
        slack_webhook_url: webhook_url,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (updateError) {
      throw updateError
    }

    // Send test message if requested
    if (test_message) {
      try {
        const response = await fetch(webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "🎯 IntentIQ Slack integration is working! You'll receive lead notifications here.",
            username: "IntentIQ",
            icon_emoji: ":dart:",
          }),
        })

        if (!response.ok) {
          return NextResponse.json(
            {
              error: "Failed to send test message to Slack",
            },
            { status: 400 },
          )
        }
      } catch (slackError) {
        return NextResponse.json(
          {
            error: "Failed to connect to Slack webhook",
          },
          { status: 400 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Slack webhook configured successfully",
    })
  } catch (error) {
    console.error("Slack webhook error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const user_id = url.searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from("user_settings")
      .update({
        slack_webhook_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Slack webhook removed successfully",
    })
  } catch (error) {
    console.error("Remove Slack webhook error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
