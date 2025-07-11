import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { type, data } = body

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 })
    }

    console.log(`📧 Sending ${type} notification for user ${user.id}`)

    // Get user profile for email
    const { data: profile } = await supabase.from("user_profiles").select("email, full_name").eq("id", user.id).single()

    const userEmail = profile?.email || user.email
    const userName = profile?.full_name || "there"

    if (type === "lead_alert") {
      const { leads, keywords } = data

      if (!leads || leads.length === 0) {
        return NextResponse.json({ error: "No leads to notify about" }, { status: 400 })
      }

      const highIntentLeads = leads.filter((lead: any) => lead.intentScore === "HIGH")

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎯 New High-Intent Leads Found!</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Hi ${userName},</p>
            <p>We found <strong>${leads.length} new leads</strong> matching your keywords: <em>${keywords.join(", ")}</em></p>
            
            ${
              highIntentLeads.length > 0
                ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-top: 0;">🔥 High-Intent Leads (${highIntentLeads.length})</h3>
                ${highIntentLeads
                  .slice(0, 3)
                  .map(
                    (lead: any) => `
                  <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <p style="margin: 0; font-weight: bold;">${lead.platform} - ${lead.author}</p>
                    <p style="margin: 5px 0; color: #666;">${lead.content.substring(0, 150)}...</p>
                    <a href="${lead.url}" style="color: #667eea; text-decoration: none;">View Post →</a>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block;">
                View All Leads
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Happy hunting!<br>
              The IntentIQ Team
            </p>
          </div>
        </div>
      `

      const { error: emailError } = await resend.emails.send({
        from: "IntentIQ <noreply@intentiq.com>",
        to: [userEmail!],
        subject: `🎯 ${highIntentLeads.length} High-Intent Leads Found!`,
        html: emailHtml,
      })

      if (emailError) {
        console.error("Email send error:", emailError)
        throw emailError
      }

      return NextResponse.json({
        message: "Lead alert sent successfully",
        sent_to: userEmail,
        leads_count: leads.length,
        high_intent_count: highIntentLeads.length,
      })
    }

    if (type === "welcome") {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to IntentIQ! 🎯</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hi ${userName},</p>
            <p>Welcome to IntentIQ! We're excited to help you discover high-intent leads from social media conversations.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">🚀 Get Started:</h3>
              <ol style="color: #666;">
                <li>Add your target keywords in the dashboard</li>
                <li>Set up your monitoring preferences</li>
                <li>Start discovering leads with buying intent</li>
                <li>Connect with prospects at the right moment</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #666;">
              If you have any questions, just reply to this email. We're here to help!
            </p>
            
            <p style="color: #666;">
              Best regards,<br>
              The IntentIQ Team
            </p>
          </div>
        </div>
      `

      const { error: emailError } = await resend.emails.send({
        from: "IntentIQ <welcome@intentiq.com>",
        to: [userEmail!],
        subject: "Welcome to IntentIQ - Start Finding High-Intent Leads! 🎯",
        html: emailHtml,
      })

      if (emailError) {
        console.error("Welcome email error:", emailError)
        throw emailError
      }

      return NextResponse.json({
        message: "Welcome email sent successfully",
        sent_to: userEmail,
      })
    }

    return NextResponse.json({ error: "Invalid notification type" }, { status: 400 })
  } catch (error: any) {
    console.error("❌ Error sending notification:", error)
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
