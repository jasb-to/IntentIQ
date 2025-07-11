import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

// Enhanced Reddit/Twitter API simulation with more realistic data
async function fetchSocialMediaPosts(keywords: string[], platforms: string[] = ["reddit", "twitter"]) {
  const redditPosts = [
    {
      id: "reddit_1",
      platform: "Reddit",
      content:
        "Looking for a good CRM solution for my startup. Any recommendations? We need something affordable but powerful for a team of 15.",
      author: "startup_founder_23",
      subreddit: "r/entrepreneur",
      url: "https://reddit.com/r/entrepreneur/comments/abc123",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      upvotes: 15,
      comments: 8,
      engagement_score: 23,
    },
    {
      id: "reddit_2",
      platform: "Reddit",
      content:
        "Just got funding! Time to invest in proper sales tools. What do you recommend for a B2B SaaS? Budget is around $10k/month.",
      author: "tech_ceo",
      subreddit: "r/startups",
      url: "https://reddit.com/r/startups/comments/def456",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      upvotes: 42,
      comments: 18,
      engagement_score: 60,
    },
    {
      id: "reddit_3",
      platform: "Reddit",
      content:
        "Our current lead generation process is manual and taking forever. Need to automate this ASAP. Any tool recommendations?",
      author: "sales_manager_pro",
      subreddit: "r/sales",
      url: "https://reddit.com/r/sales/comments/ghi789",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      upvotes: 28,
      comments: 12,
      engagement_score: 40,
    },
    {
      id: "reddit_4",
      platform: "Reddit",
      content: "Anyone using AI for prospecting? We're scaling fast and need better lead qualification tools.",
      author: "growth_hacker_2024",
      subreddit: "r/marketing",
      url: "https://reddit.com/r/marketing/comments/jkl012",
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      upvotes: 35,
      comments: 22,
      engagement_score: 57,
    },
  ]

  const twitterPosts = [
    {
      id: "twitter_1",
      platform: "Twitter",
      content:
        "Our current email marketing tool is too expensive. Need alternatives that won't break the bank but still deliver results. Budget: $500/month max.",
      author: "@marketing_pro",
      url: "https://twitter.com/marketing_pro/status/123456",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 23,
      retweets: 5,
      engagement_score: 28,
    },
    {
      id: "twitter_2",
      platform: "Twitter",
      content:
        "Anyone know a good lead generation tool? We're scaling fast and need to automate our prospecting. Currently doing everything manually 😅",
      author: "@growth_hacker",
      url: "https://twitter.com/growth_hacker/status/789012",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 31,
      retweets: 12,
      engagement_score: 43,
    },
    {
      id: "twitter_3",
      platform: "Twitter",
      content:
        "Just closed a $2M round! Time to invest in proper sales infrastructure. Looking for recommendations on CRM + automation stack.",
      author: "@saas_founder",
      url: "https://twitter.com/saas_founder/status/345678",
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      likes: 87,
      retweets: 24,
      engagement_score: 111,
    },
    {
      id: "twitter_4",
      platform: "Twitter",
      content:
        "Our sales team is drowning in manual tasks. Need a tool that can help with lead scoring and qualification. Any suggestions?",
      author: "@sales_ops_lead",
      url: "https://twitter.com/sales_ops_lead/status/901234",
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      likes: 19,
      retweets: 7,
      engagement_score: 26,
    },
  ]

  const allPosts = []
  if (platforms.includes("reddit")) allPosts.push(...redditPosts)
  if (platforms.includes("twitter")) allPosts.push(...twitterPosts)

  // Filter posts based on keywords
  const filteredPosts = allPosts.filter((post) =>
    keywords.some((keyword) => post.content.toLowerCase().includes(keyword.toLowerCase())),
  )

  return filteredPosts
}

// Enhanced AI-powered intent scoring with more sophisticated analysis
async function analyzeIntent(content: string): Promise<{
  score: "HIGH" | "MEDIUM" | "LOW"
  confidence: number
  signals: string[]
}> {
  const highIntentKeywords = [
    "need",
    "looking for",
    "recommend",
    "buy",
    "purchase",
    "invest",
    "budget",
    "price",
    "cost",
    "funding",
    "closed round",
    "just got",
    "ready to",
    "time to",
  ]

  const mediumIntentKeywords = [
    "considering",
    "thinking about",
    "exploring",
    "research",
    "compare",
    "alternative",
    "suggestions",
    "advice",
    "help",
    "anyone using",
  ]

  const urgencyKeywords = [
    "ASAP",
    "urgent",
    "quickly",
    "fast",
    "immediately",
    "now",
    "drowning",
    "manual",
    "scaling",
    "growing",
  ]

  const budgetKeywords = ["$", "budget", "cost", "price", "expensive", "affordable", "cheap", "investment"]

  const contentLower = content.toLowerCase()

  const highIntentMatches = highIntentKeywords.filter((keyword) => contentLower.includes(keyword))
  const mediumIntentMatches = mediumIntentKeywords.filter((keyword) => contentLower.includes(keyword))
  const urgencyMatches = urgencyKeywords.filter((keyword) => contentLower.includes(keyword))
  const budgetMatches = budgetKeywords.filter((keyword) => contentLower.includes(keyword))

  let score: "HIGH" | "MEDIUM" | "LOW" = "LOW"
  let confidence = 0
  const signals: string[] = []

  // Calculate intent score
  const highIntentScore = highIntentMatches.length * 3
  const mediumIntentScore = mediumIntentMatches.length * 2
  const urgencyScore = urgencyMatches.length * 2
  const budgetScore = budgetMatches.length * 1.5

  const totalScore = highIntentScore + mediumIntentScore + urgencyScore + budgetScore

  if (totalScore >= 6 || highIntentMatches.length >= 2) {
    score = "HIGH"
    confidence = Math.min(90, 60 + totalScore * 5)
  } else if (totalScore >= 3 || highIntentMatches.length >= 1 || mediumIntentMatches.length >= 2) {
    score = "MEDIUM"
    confidence = Math.min(75, 40 + totalScore * 7)
  } else {
    score = "LOW"
    confidence = Math.min(50, 20 + totalScore * 10)
  }

  // Add signals
  if (highIntentMatches.length > 0) signals.push(`High intent keywords: ${highIntentMatches.join(", ")}`)
  if (urgencyMatches.length > 0) signals.push(`Urgency indicators: ${urgencyMatches.join(", ")}`)
  if (budgetMatches.length > 0) signals.push(`Budget mentioned: ${budgetMatches.join(", ")}`)
  if (mediumIntentMatches.length > 0) signals.push(`Research phase: ${mediumIntentMatches.join(", ")}`)

  return { score, confidence, signals }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keywordsParam = searchParams.get("keywords")
    const keywords = keywordsParam
      ? keywordsParam.split(",").map((k) => k.trim())
      : ["CRM", "email marketing", "sales tools"]
    const platforms = searchParams.get("platforms")?.split(",") || ["reddit", "twitter"]
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log("🔍 Searching for leads:", { keywords, platforms, limit, userId: user.id })

    // Fetch posts from social media
    const posts = await fetchSocialMediaPosts(keywords, platforms)

    // Analyze intent for each post
    const leadsWithIntent = await Promise.all(
      posts.map(async (post) => {
        const intentAnalysis = await analyzeIntent(post.content)
        return {
          ...post,
          intentScore: intentAnalysis.score,
          confidence: intentAnalysis.confidence,
          signals: intentAnalysis.signals,
          keywords: keywords.filter((keyword) => post.content.toLowerCase().includes(keyword.toLowerCase())),
          relevanceScore: Math.floor(Math.random() * 30) + 70, // Mock relevance score
        }
      }),
    )

    // Sort by intent score, confidence, and engagement
    const sortedLeads = leadsWithIntent.sort((a, b) => {
      const intentOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }

      // Primary sort: intent score
      if (intentOrder[a.intentScore] !== intentOrder[b.intentScore]) {
        return intentOrder[b.intentScore] - intentOrder[a.intentScore]
      }

      // Secondary sort: confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence
      }

      // Tertiary sort: engagement score
      return (b.engagement_score || 0) - (a.engagement_score || 0)
    })

    const limitedLeads = sortedLeads.slice(0, limit)

    // Save search to database
    const { error: insertError } = await supabase.from("lead_searches").insert([
      {
        user_id: user.id,
        keywords,
        platforms,
        results_count: limitedLeads.length,
        high_intent_count: limitedLeads.filter((l) => l.intentScore === "HIGH").length,
        medium_intent_count: limitedLeads.filter((l) => l.intentScore === "MEDIUM").length,
        low_intent_count: limitedLeads.filter((l) => l.intentScore === "LOW").length,
      },
    ])

    if (insertError) {
      console.error("Error saving search:", insertError)
    }

    console.log(`✅ Found ${limitedLeads.length} leads for user ${user.id}`)

    return NextResponse.json({
      leads: limitedLeads,
      total: limitedLeads.length,
      keywords,
      platforms,
      stats: {
        high: limitedLeads.filter((l) => l.intentScore === "HIGH").length,
        medium: limitedLeads.filter((l) => l.intentScore === "MEDIUM").length,
        low: limitedLeads.filter((l) => l.intentScore === "LOW").length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Error fetching leads:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch leads",
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
    const { lead_id, action, notes } = body

    if (!lead_id || !action) {
      return NextResponse.json({ error: "lead_id and action are required" }, { status: 400 })
    }

    console.log(`📝 User ${user.id} performing action: ${action} on lead: ${lead_id}`)

    if (action === "save") {
      // Save lead to user's saved leads
      const { error } = await supabase.from("saved_leads").upsert([
        {
          user_id: user.id,
          external_id: lead_id,
          notes: notes || null,
          is_contacted: false,
        },
      ])

      if (error) {
        console.error("Error saving lead:", error)
        throw error
      }

      return NextResponse.json({ message: "Lead saved successfully" })
    }

    if (action === "contact") {
      // Mark lead as contacted
      const { error } = await supabase
        .from("saved_leads")
        .update({ is_contacted: true, contacted_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("external_id", lead_id)

      if (error) {
        console.error("Error updating lead:", error)
        throw error
      }

      return NextResponse.json({ message: "Lead marked as contacted" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("❌ Error in lead action:", error)
    return NextResponse.json(
      {
        error: "Failed to process lead action",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
