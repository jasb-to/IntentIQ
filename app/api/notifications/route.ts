import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
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
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data are required" }, { status: 400 })
    }

    // Get user profile and settings
    const { data: profile } = await supabase.from("user_profiles").select("email, full_name").eq("id", user.id).single()

    const { data: settings } = await supabase
      .from("user_settings")
      .select("email_notifications, slack_webhook_url")
      .eq("user_id", user.id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    let emailSent = false
    let slackSent = false

    // Send email notification
    if (settings?.email_notifications !== false) {
      try {
        let subject = ""
        let htmlContent = ""

        switch (type) {
          case "high_intent_leads":
            subject = `🎯 ${data.count} High-Intent Leads Found!`
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">High-Intent Leads Discovered</h2>
                <p>Hi ${profile.full_name || "there"},</p>
                <p>We found <strong>${data.count} high-intent leads</strong> matching your keywords:</p>
                <ul>
                  ${data.keywords?.map((k: string) => `<li>${k}</li>`).join("") || ""}
                </ul>
                <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                  <h3>Top Lead Preview:</h3>
                  <p><strong>Platform:</strong> ${data.topLead?.platform}</p>
                  <p><strong>Content:</strong> ${data.topLead?.content?.substring(0, 200)}...</p>
                  <p><strong>Intent Score:</strong> ${data.topLead?.intent_score}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  View All Leads
                </a>
                <p>Happy hunting!</p>
                <p>The IntentIQ Team</p>
              </div>
            `
            break

          case "daily_summary":
            subject = `📊 Your Daily IntentIQ Summary`
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Daily Summary</h2>
                <p>Hi ${profile.full_name || "there"},</p>
                <p>Here's your IntentIQ activity for today:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                  <div style="padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                    <h3 style="margin: 0; color: #059669;">${data.searches || 0}</h3>
                    <p style="margin: 5px 0;">Searches</p>
                  </div>
                  <div style="padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                    <h3 style="margin: 0; color: #dc2626;">${data.highIntentLeads || 0}</h3>
                    <p style="margin: 5px 0;">High-Intent Leads</p>
                  </div>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  View Dashboard
                </a>
                <p>Keep up the great work!</p>
                <p>The IntentIQ Team</p>
              </div>
            `
            break

          default:
            subject = "IntentIQ Notification"
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">IntentIQ Update</h2>
                <p>Hi ${profile.full_name || "there"},</p>
                <p>You have a new update from IntentIQ.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  View Dashboard
                </a>
                <p>The IntentIQ Team</p>
              </div>
            `
        }

        await resend.emails.send({
          from: "IntentIQ <notifications@intentiq.ai>",
          to: [profile.email],
          subject,
          html: htmlContent,
        })

        emailSent = true
      } catch (emailError) {
        console.error("Email notification error:", emailError)
      }
    }

    // Send Slack notification
    if (settings?.slack_webhook_url) {
      try {
        let slackMessage = ""

        switch (type) {
          case "high_intent_leads":
            slackMessage = `🎯 *${data.count} High-Intent Leads Found!*\n\nKeywords: ${data.keywords?.join(", ")}\nTop lead from ${data.topLead?.platform}: "${data.topLead?.content?.substring(0, 100)}..."`
            break
          case "daily_summary":
            slackMessage = `📊 *Daily IntentIQ Summary*\n\n• ${data.searches || 0} searches performed\n• ${data.highIntentLeads || 0} high-intent leads found`
            break
          default:
            slackMessage = `🔔 IntentIQ notification: ${JSON.stringify(data)}`
        }

        const response = await fetch(settings.slack_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: slackMessage,
            username: "IntentIQ",
            icon_emoji: ":dart:",
          }),
        })

        if (response.ok) {
          slackSent = true
        }
      } catch (slackError) {
        console.error("Slack notification error:", slackError)
      }
    }

    return NextResponse.json({
      success: true,
      notifications_sent: {
        email: emailSent,
        slack: slackSent,
      },
    })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
