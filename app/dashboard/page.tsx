"use client"

import { useState } from "react"
import Link from "next/link"

// Mock data for demo
const mockLeads = [
  {
    id: 1,
    platform: "Reddit",
    content: "Looking for a good CRM solution for my startup. Any recommendations?",
    author: "startup_founder_23",
    subreddit: "r/entrepreneur",
    intentScore: "HIGH",
    timestamp: "2 hours ago",
    url: "https://reddit.com/r/entrepreneur/comments/abc123",
  },
  {
    id: 2,
    platform: "Twitter",
    content: "Our current email marketing tool is too expensive. Need alternatives.",
    author: "@marketing_pro",
    intentScore: "MEDIUM",
    timestamp: "4 hours ago",
    url: "https://twitter.com/marketing_pro/status/123456",
  },
  {
    id: 3,
    platform: "Reddit",
    content: "Just got funding! Time to invest in proper sales tools.",
    author: "tech_ceo",
    subreddit: "r/startups",
    intentScore: "HIGH",
    timestamp: "6 hours ago",
    url: "https://reddit.com/r/startups/comments/def456",
  },
]

export default function Dashboard() {
  const [keyword, setKeyword] = useState("")
  const [leads, setLeads] = useState(mockLeads)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!keyword.trim()) return

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      // In real app, this would fetch from API
    }, 2000)
  }

  const getIntentColor = (score: string) => {
    switch (score) {
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
          <div className="flex items-center space-x-4">
            <Link href="/pricing" className="text-white hover:text-purple-300 transition-colors">
              Pricing
            </Link>
            <Link
              href="/"
              className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Lead Generation Dashboard</h1>
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Search for Leads</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter keywords (e.g., CRM, email marketing, sales tools)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-all"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-300">Total Leads</h3>
            <p className="text-2xl font-bold text-white">{leads.length}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-300">High Intent</h3>
            <p className="text-2xl font-bold text-red-300">{leads.filter((l) => l.intentScore === "HIGH").length}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-300">Medium Intent</h3>
            <p className="text-2xl font-bold text-yellow-300">
              {leads.filter((l) => l.intentScore === "MEDIUM").length}
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm text-gray-300">Platforms</h3>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white/10 border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Leads</h2>
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{lead.platform}</span>
                    {lead.subreddit && <span className="text-sm text-gray-400">• {lead.subreddit}</span>}
                    <span className="text-sm text-gray-400">• {lead.timestamp}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getIntentColor(lead.intentScore)}`}>
                    {lead.intentScore}
                  </span>
                </div>
                <p className="text-white mb-2">{lead.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">by {lead.author}</span>
                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    View Post →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
          <p className="text-purple-300">🚀 This is a demo with sample data. Sign up to start monitoring real leads!</p>
        </div>
      </div>
    </div>
  )
}
