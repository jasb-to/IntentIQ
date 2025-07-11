import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhook_url, leads, keywords, user_email } = body

    if (!webhook_url || !leads) {
      return NextResponse.json(
        {
          error: "webhook_url and leads are required",
        },
        { status: 400 },
      )
    }

    console.log(`📢 Sending Slack notification for ${leads.length} leads`)

    const highIntentLeads = leads.filter((lead: any) => lead.intentScore === "HIGH")
    const mediumIntentLeads = leads.filter((lead: any) => lead.intentScore === "MEDIUM")

    const slackMessage = {
      text: `🎯 IntentIQ: New Leads Found!`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎯 New High-Intent Leads Discovered!",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Found *${leads.length} new leads* matching keywords: \`${keywords.join(", ")}\``,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*🔥 High Intent:* ${highIntentLeads.length}`,
            },
            {
              type: "mrkdwn",
              text: `*⚡ Medium Intent:* ${mediumIntentLeads.length}`,
            },
          ],
        },
      ],
    }

    // Add top high-intent leads to the message
    if (highIntentLeads.length > 0) {
      slackMessage.blocks.push({
        type: "divider",
      })

      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*🔥 Top High-Intent Leads:*",
        },
      })

      highIntentLeads.slice(0, 3).forEach((lead: any) => {
        slackMessage.blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${lead.platform}* - ${lead.author}\n${lead.content.substring(0, 150)}...\n<${lead.url}|View Post>`,
          },
        })
      })
    }

    // Add action button
    slackMessage.blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View All Leads",
          },
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          style: "primary",
        },
      ],
    })

    // Send to Slack
    const slackResponse = await fetch(webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackMessage),
    })

    if (!slackResponse.ok) {
      throw new Error(`Slack webhook failed: ${slackResponse.statusText}`)
    }

    console.log("✅ Slack notification sent successfully")

    return NextResponse.json({
      message: "Slack notification sent successfully",
      leads_count: leads.length,
      high_intent_count: highIntentLeads.length,
    })
  } catch (error: any) {
    console.error("❌ Error sending Slack notification:", error)
    return NextResponse.json(
      {
        error: "Failed to send Slack notification",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
