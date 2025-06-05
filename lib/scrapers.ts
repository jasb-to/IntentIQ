import type { Post } from "@/types"
import { analyzeIntent } from "./openai"

export async function fetchRedditPosts(keywords: string[]): Promise<Partial<Post>[]> {
  const posts: Partial<Post>[] = []

  for (const keyword of keywords) {
    try {
      const response = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=10&sort=new`,
        {
          headers: {
            "User-Agent": "IntentIQ/1.0 Lead Generation Tool",
          },
        },
      )

      if (!response.ok) continue

      const data = await response.json()
      const redditPosts = data.data?.children || []

      for (const item of redditPosts) {
        const post = item.data
        if (post.selftext || post.title) {
          posts.push({
            id: `reddit_${post.id}`,
            platform: "reddit",
            content: `${post.title} ${post.selftext}`.trim(),
            url: `https://reddit.com${post.permalink}`,
            timestamp: new Date(post.created_utc * 1000),
            author: post.author,
            subreddit: post.subreddit,
          })
        }
      }
    } catch (error) {
      console.error(`Error fetching Reddit posts for "${keyword}":`, error)
    }
  }

  return posts
}

export async function fetchTwitterPosts(keywords: string[]): Promise<Partial<Post>[]> {
  // Note: Twitter API requires authentication, this is a placeholder
  // In production, you'd use Twitter API v2 with proper authentication
  const posts: Partial<Post>[] = []

  // For now, return empty array - implement with proper Twitter API
  console.log("Twitter monitoring requires API setup for keywords:", keywords)

  return posts
}

export async function analyzePosts(posts: Partial<Post>[]): Promise<Post[]> {
  const analyzedPosts: Post[] = []

  // Process in batches to avoid rate limits
  const batchSize = 3
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize)

    const batchPromises = batch.map(async (post) => {
      if (!post.content || !post.id) return null

      const analysis = await analyzeIntent(post.content)

      return {
        ...post,
        intent: analysis.intent,
        explanation: analysis.explanation,
      } as Post
    })

    const batchResults = await Promise.all(batchPromises)
    analyzedPosts.push(...(batchResults.filter(Boolean) as Post[]))

    // Add delay between batches
    if (i + batchSize < posts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return analyzedPosts
}
