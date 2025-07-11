import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"

// Mock AI intent analysis - replace with actual AI service
function analyzeIntent(content: string, keywords: string[]) {
  const contentLower = content.toLowerCase()
  const keywordMatches = keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase()))

  // Simple scoring based on keyword matches and buying signals
  const buyingSignals = [
    "looking for",
    "need help",
    "recommendations",
    "best tool",
    "pricing",
    "cost",
    "budget",
    "buy",
    "purchase",
    "solution",
  ]

  const signalMatches = buyingSignals.filter((signal) => contentLower.includes(signal))

  let score: "HIGH" | "MEDIUM" | "LOW" = "LOW"
  let confidence = 0.3

  if (keywordMatches.length >= 2 && signalMatches.length >= 2) {
    score = "HIGH"
    confidence = 0.85
  } else if (keywordMatches.length >= 1 && signalMatches.length >= 1) {
    score = "MEDIUM"
    confidence = 0.65
  }

  return {
    intent_score: score,
    confidence,
    keywords: keywordMatches,
    signals: signalMatches,
  }
}

// Mock social media data - replace with actual API integrations
function mockSocialMediaSearch(keywords: string[], platforms: string[]) {
  const mockPosts = [
    {
      id: "reddit_1",
      platform: "reddit",
      content: "Looking for the best lead generation tool for my SaaS startup. Any recommendations?",
      author: "startup_founder_23",
      url: "https://reddit.com/r/entrepreneur/post1",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "twitter_1",
      platform: "twitter",
      content: "Need help finding qualified leads for our B2B software. Current tools are too expensive.",
      author: "saas_marketer",
      url: "https://twitter.com/saas_marketer/status/123",
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "reddit_2",
      platform: "reddit",
      content: "What lead generation software do you use? Budget is around $100/month.",
      author: "marketing_pro",
      url: "https://reddit.com/r/marketing/post2",
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return mockPosts.filter(
    (post) =>
      platforms.includes(post.platform) &&
      keywords.some((keyword) => post.content.toLowerCase().includes(keyword.toLowerCase())),
  )
}

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
    const { keywords, platforms = ["reddit", "twitter"] } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "Keywords are required" }, { status: 400 })
    }

    // Check user's subscription limits
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const limits = {
      free: { max_keywords: 3, max_searches_per_day: 5 },
      starter: { max_keywords: 10, max_searches_per_day: 25 },
      pro: { max_keywords: 50, max_searches_per_day: 100 },
      enterprise: { max_keywords: 200, max_searches_per_day: 500 },
    }

    const userLimits = limits[profile?.subscription_tier as keyof typeof limits] || limits.free

    if (keywords.length > userLimits.max_keywords) {
      return NextResponse.json(
        {
          error: `Too many keywords. Limit: ${userLimits.max_keywords}`,
        },
        { status: 400 },
      )
    }

    // Check daily search limit
    const today = new Date().toISOString().split("T")[0]
    const { count } = await supabase
      .from("lead_searches")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00.000Z`)

    if ((count || 0) >= userLimits.max_searches_per_day) {
      return NextResponse.json(
        {
          error: `Daily search limit reached. Limit: ${userLimits.max_searches_per_day}`,
        },
        { status: 429 },
      )
    }

    const startTime = Date.now()

    // Search social media platforms
    const rawResults = mockSocialMediaSearch(keywords, platforms)

    // Analyze intent for each result
    const analyzedResults = rawResults.map((post) => {
      const analysis = analyzeIntent(post.content, keywords)
      return {
        ...post,
        ...analysis,
        external_id: post.id,
        metadata: {
          platform_data: post,
        },
      }
    })

    const searchDuration = Date.now() - startTime

    // Count results by intent score
    const highIntentCount = analyzedResults.filter((r) => r.intent_score === "HIGH").length
    const mediumIntentCount = analyzedResults.filter((r) => r.intent_score === "MEDIUM").length
    const lowIntentCount = analyzedResults.filter((r) => r.intent_score === "LOW").length

    // Save search record
    const { data: searchRecord } = await supabase
      .from("lead_searches")
      .insert({
        user_id: user.id,
        keywords,
        platforms,
        results_count: analyzedResults.length,
        high_intent_count: highIntentCount,
        medium_intent_count: mediumIntentCount,
        low_intent_count: lowIntentCount,
        search_duration_ms: searchDuration,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Auto-save high intent leads if enabled
    const { data: settings } = await supabase
      .from("user_settings")
      .select("auto_save_high_intent")
      .eq("user_id", user.id)
      .single()

    if (settings?.auto_save_high_intent) {
      const highIntentLeads = analyzedResults.filter((r) => r.intent_score === "HIGH")

      for (const lead of highIntentLeads) {
        await supabase.from("saved_leads").upsert(
          {
            user_id: user.id,
            platform: lead.platform,
            external_id: lead.external_id,
            content: lead.content,
            author: lead.author,
            url: lead.url,
            intent_score: lead.intent_score,
            confidence: lead.confidence,
            keywords: lead.keywords,
            signals: lead.signals,
            metadata: lead.metadata,
            is_contacted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,external_id",
          },
        )
      }
    }

    return NextResponse.json({
      success: true,
      search_id: searchRecord?.id,
      results: analyzedResults,
      summary: {
        total: analyzedResults.length,
        high_intent: highIntentCount,
        medium_intent: mediumIntentCount,
        low_intent: lowIntentCount,
        search_duration_ms: searchDuration,
      },
    })
  } catch (error) {
    console.error("Lead search error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

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
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    const { data: searches, error } = await supabase
      .from("lead_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      searches: searches || [],
    })
  } catch (error) {
    console.error("Get searches error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
