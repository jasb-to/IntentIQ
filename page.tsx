import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-xl font-bold text-white">IntentIQ</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pricing" className="text-white hover:text-purple-300 transition-colors">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-4">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm">
            AI-Powered Lead Generation
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Turn Social Media Into
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            Sales Opportunities
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          IntentIQ monitors Reddit and Twitter in real-time, identifies high-intent buyers using AI, and delivers
          qualified leads directly to your sales team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center"
          >
            Try Demo
            <span className="ml-2">→</span>
          </Link>
          <Link
            href="/pricing"
            className="border border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Sales Teams Choose IntentIQ</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Advanced AI technology meets intuitive design to revolutionize your lead generation process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Intent Scoring</h3>
            <p className="text-slate-200">
              Our GPT-4 powered system analyzes every post to identify HIGH, MEDIUM, and LOW buyer intent with 95%
              accuracy.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-Time Monitoring</h3>
            <p className="text-slate-200">
              Monitor Reddit and Twitter 24/7 with live updates every minute. Never miss a hot lead again.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Filtering</h3>
            <p className="text-slate-200">
              Advanced keyword matching and context analysis ensures you only see the most relevant opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to 10x Your Lead Generation?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of sales teams already using IntentIQ to identify and convert high-intent prospects.
          </p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all inline-flex items-center justify-center"
          >
            Try Demo Now
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 IntentIQ. All rights reserved. Built with AI for the future of sales.</p>
        </div>
      </footer>
    </div>
  )
}
