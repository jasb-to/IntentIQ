import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Brain, Zap, Target, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 text-white">
              Turn Social Media Into
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Sales Opportunities
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              IntentIQ monitors Reddit and Twitter in real-time, identifies high-intent buyers using AI, and delivers
              qualified leads directly to your sales team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                asChild
              >
                <Link href="/dashboard">
                  Try Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Why Sales Teams Choose IntentIQ</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced AI technology meets intuitive design to revolutionize your lead generation process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">AI Intent Scoring</CardTitle>
                <CardDescription className="text-gray-300">
                  Our GPT-4 powered system analyzes every post to identify HIGH, MEDIUM, and LOW buyer intent with 95%
                  accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Real-Time Monitoring</CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor Reddit and Twitter 24/7 with live updates every minute. Never miss a hot lead again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Smart Filtering</CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced keyword matching and context analysis ensures you only see the most relevant opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Ready to 10x Your Lead Generation?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of sales teams already using IntentIQ to identify and convert high-intent prospects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                asChild
              >
                <Link href="/dashboard">
                  Try Demo Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
                asChild
              >
                <Link href="/contact">Schedule Demo</Link>
              </Button>
            </div>
          </div>
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
