export interface Post {
  id: string
  platform: "reddit" | "twitter"
  content: string
  url: string
  timestamp: Date
  intent: "HIGH" | "MEDIUM" | "LOW"
  explanation: string
  author?: string
  subreddit?: string
}

export interface IntentAnalysis {
  intent: "HIGH" | "MEDIUM" | "LOW"
  explanation: string
}

export interface FetchPostsResponse {
  posts: Post[]
  success: boolean
  error?: string
}

export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  subscription?: Subscription
}

export interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodEnd: Date
}
