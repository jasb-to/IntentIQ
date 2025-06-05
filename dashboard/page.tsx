"use client"

import { useState } from "react"
import Link from "next/link"

const mockPosts = [
  {
    id: "1",
    platform: "reddit",
    content: "Looking for the best CRM software for my startup. Need something affordable but powerful.",
    url: "https://reddit.com/r/entrepreneur/example",
    timestamp: new Date(),
    intent: "HIGH",
    explanation: "Actively seeking CRM recommendations with specific requirements",
    author: "startup_founder",
    subreddit: "entrepreneur",
  },
  {
    id: "2",
    platform: "reddit",
    content: "Has anyone tried Salesforce? Wondering if it's worth the cost for a small team.",
    url: "https://reddit.com/r/sales/example",
    timestamp: new Date(Date.now() - 3600000),
    intent: "MEDIUM",
    explanation: "Researching specific solution, showing purchase consideration",
    author: "sales_manager",
    subreddit: "sales",
  },
]

export default function Dashboard() {
  const [keywords, setKeywords] = useState("")
  const [posts, setPosts] = useState(mockPosts)
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1000)
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "HIGH":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "LOW":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const stats = {
    total: posts.length,
    high: posts.filter((p) => p.intent === "HIGH").length,
    medium: posts.filter((p) => p.intent === "MEDIUM").length,
    low: posts.filter((p) => p.intent === "LOW").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-xl font-bold text-white">IntentIQ</span>
          </Link>
          <Link
            href="/pricing"
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
          >
            Upgrade Plan
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Lead Discovery
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter keywords (e.g., CRM, sales software, lead generation)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "⟳" : "Search"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-300 flex items-center justify-center">
              <span className="mr-1">🎯</span>
              Total Leads
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.high}</div>
            <div className="text-sm text-slate-300 flex items-center justify-center">
              <span className="mr-1">📈</span>
              High Intent
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-sm text-slate-300 flex items-center justify-center">
              <span className="mr-1">👥</span>
              Medium Intent
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.low}</div>
            <div className="text-sm text-slate-300 flex items-center justify-center">
              <span className="mr-1">🕒</span>
              Low Intent
            </div>
          </div>
        </div>

        {/* Lead Feed */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Live Lead Feed</h2>
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
              {posts.length} leads found
            </span>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔴</span>
                    <span className="border border-white/20 text-white px-2 py-1 rounded text-xs">{post.platform}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${getIntentColor(post.intent)}`}>
                      {post.intent} INTENT
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    <span>🕒</span>
                    {post.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                <p className="text-white mb-3 leading-relaxed">{post.content}</p>

                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-200 italic">
                    <strong>AI Analysis:</strong> {post.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-300">
                    <span>By: {post.author}</span>
                    <span>r/{post.subreddit}</span>
                  </div>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white/20 text-white hover:bg-white/10 px-3 py-1 rounded text-sm transition-all inline-flex items-center"
                  >
                    View Post
                    <span className="ml-1">↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
