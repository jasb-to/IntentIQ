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

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "7d" // 7d, 30d, 90d

    // Calculate date range
    const now = new Date()
    const daysBack = timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 7
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    console.log(`📊 Fetching analytics for user ${user.id} (${timeframe})`)

    // Fetch real data from database
    const [searchesResult, savedLeadsResult, keywordsResult] = await Promise.all([
      // Lead searches
      supabase
        .from("lead_searches")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false }),

      // Saved leads
      supabase
        .from("saved_leads")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString()),

      // User keywords
      supabase
        .from("user_keywords")
        .select("keyword")
        .eq("user_id", user.id)
        .eq("is_active", true),
    ])

    const searches = searchesResult.data || []
    const savedLeads = savedLeadsResult.data || []
    const keywords = keywordsResult.data || []

    // Calculate analytics
    const totalSearches = searches.length
    const totalLeads = searches.reduce((sum, search) => sum + (search.results_count || 0), 0)
    const highIntentLeads = searches.reduce((sum, search) => sum + (search.high_intent_count || 0), 0)
    const mediumIntentLeads = searches.reduce((sum, search) => sum + (search.medium_intent_count || 0), 0)
    const lowIntentLeads = searches.reduce((sum, search) => sum + (search.low_intent_count || 0), 0)
    const contactedLeads = savedLeads.filter((lead) => lead.is_contacted).length
    const conversionRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0

    // Calculate keyword frequency
    const keywordFrequency = new Map()
    searches.forEach((search) => {
      if (search.keywords) {
        search.keywords.forEach((keyword: string) => {
          keywordFrequency.set(keyword, (keywordFrequency.get(keyword) || 0) + 1)
        })
      }
    })

    const topKeywords = Array.from(keywordFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    // Calculate platform breakdown
    const platformBreakdown = new Map()
    searches.forEach((search) => {
      if (search.platforms) {
        search.platforms.forEach((platform: string) => {
          platformBreakdown.set(platform, (platformBreakdown.get(platform) || 0) + 1)
        })
      }
    })

    // Generate daily stats
    const dailyStats = []
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]

      const daySearches = searches.filter((search) => search.created_at.startsWith(dateStr))

      const dayLeads = daySearches.reduce((sum, search) => sum + (search.results_count || 0), 0)
      const dayHighIntent = daySearches.reduce((sum, search) => sum + (search.high_intent_count || 0), 0)

      dailyStats.push({
        date: dateStr,
        searches: daySearches.length,
        leads: dayLeads,
        highIntent: dayHighIntent,
      })
    }

    const analytics = {
      totalSearches,
      totalLeads,
      highIntentLeads,
      mediumIntentLeads,
      lowIntentLeads,
      savedLeads: savedLeads.length,
      contactedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topKeywords,
      platformBreakdown: Object.fromEntries(platformBreakdown),
      dailyStats,
      averageLeadsPerSearch: totalSearches > 0 ? Math.round((totalLeads / totalSearches) * 100) / 100 : 0,
      intentDistribution: {
        high: Math.round((highIntentLeads / Math.max(totalLeads, 1)) * 100),
        medium: Math.round((mediumIntentLeads / Math.max(totalLeads, 1)) * 100),
        low: Math.round((lowIntentLeads / Math.max(totalLeads, 1)) * 100),
      },
    }

    console.log("✅ Analytics calculated successfully")

    return NextResponse.json({
      analytics,
      timeframe,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Error fetching analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
