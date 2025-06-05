import { type NextRequest, NextResponse } from "next/server"
import { fetchRedditPosts, fetchTwitterPosts, analyzePosts } from "@/lib/scrapers"
import type { FetchPostsResponse } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json()

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Keywords array is required",
        posts: [],
      } as FetchPostsResponse)
    }

    // Fetch posts from both platforms
    const [redditPosts, twitterPosts] = await Promise.all([fetchRedditPosts(keywords), fetchTwitterPosts(keywords)])

    // Combine and analyze posts
    const allPosts = [...redditPosts, ...twitterPosts]
    const analyzedPosts = await analyzePosts(allPosts)

    // Sort by timestamp (newest first)
    analyzedPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return NextResponse.json({
      success: true,
      posts: analyzedPosts.slice(0, 20), // Limit to 20 most recent
    } as FetchPostsResponse)
  } catch (error) {
    console.error("Error in fetchPosts API:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch posts",
      posts: [],
    } as FetchPostsResponse)
  }
}
