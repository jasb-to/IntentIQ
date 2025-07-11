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

    const url = new URL(request.url)
    const days = Number.parseInt(url.searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get search analytics
    const { data: searches } = await supabase
      .from("lead_searches")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())

    // Get saved leads analytics
    const { data: savedLeads } = await supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())

    // Calculate daily stats
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const daySearches = searches?.filter((s) => s.created_at.startsWith(dateStr)) || []

      const daySavedLeads = savedLeads?.filter((l) => l.created_at.startsWith(dateStr)) || []

      dailyStats.push({
        date: dateStr,
        searches: daySearches.length,
        leads_found: daySearches.reduce((sum, s) => sum + (s.results_count || 0), 0),
        high_intent_leads: daySearches.reduce((sum, s) => sum + (s.high_intent_count || 0), 0),
        leads_saved: daySavedLeads.length,
        leads_contacted: daySavedLeads.filter((l) => l.is_contacted).length,
      })
    }

    // Calculate totals
    const totalSearches = searches?.length || 0
    const totalLeadsFound = searches?.reduce((sum, s) => sum + (s.results_count || 0), 0) || 0
    const totalHighIntentLeads = searches?.reduce((sum, s) => sum + (s.high_intent_count || 0), 0) || 0
    const totalSavedLeads = savedLeads?.length || 0
    const totalContactedLeads = savedLeads?.filter((l) => l.is_contacted).length || 0

    // Platform breakdown
    const platformStats =
      searches?.reduce((acc: any, search) => {
        search.platforms?.forEach((platform: string) => {
          if (!acc[platform]) {
            acc[platform] = { searches: 0, leads: 0 }
          }
          acc[platform].searches++
          acc[platform].leads += search.results_count || 0
        })
        return acc
      }, {}) || {}

    // Intent score distribution
    const intentDistribution = {
      high: totalHighIntentLeads,
      medium: searches?.reduce((sum, s) => sum + (s.medium_intent_count || 0), 0) || 0,
      low: searches?.reduce((sum, s) => sum + (s.low_intent_count || 0), 0) || 0,
    }

    // Top keywords
    const keywordCounts: { [key: string]: number } = {}
    searches?.forEach((search) => {
      search.keywords?.forEach((keyword: string) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      })
    })

    const topKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          total_searches: totalSearches,
          total_leads_found: totalLeadsFound,
          total_high_intent_leads: totalHighIntentLeads,
          total_saved_leads: totalSavedLeads,
          total_contacted_leads: totalContactedLeads,
          conversion_rate: totalLeadsFound > 0 ? ((totalContactedLeads / totalLeadsFound) * 100).toFixed(1) : "0",
        },
        daily_stats: dailyStats,
        platform_breakdown: platformStats,
        intent_distribution: intentDistribution,
        top_keywords: topKeywords,
        period_days: days,
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
