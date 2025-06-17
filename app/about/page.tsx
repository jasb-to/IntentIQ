import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Users, Zap, Lock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                ShadowStack
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              ShadowStack is a next-generation cybersecurity platform designed for fast-moving development teams who
              need real-time threat detection and monitoring for their digital assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Shield className="mr-3 text-red-400" />
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We believe that cybersecurity should be proactive, not reactive. ShadowStack monitors the dark corners
                of the internet where threats emerge, giving you the intelligence you need to protect your assets before
                they're compromised.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Zap className="mr-3 text-red-400" />
                Real-Time Protection
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Our AI-powered monitoring system scans public channels, forums, and dark web sources 24/7 to detect
                mentions of your domains, APIs, wallets, and other critical assets, alerting you instantly when threats
                are detected.
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">What We Monitor</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">Domains</h3>
                <p className="text-sm text-gray-400">Website and subdomain monitoring</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">APIs</h3>
                <p className="text-sm text-gray-400">API endpoint security tracking</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">Wallets</h3>
                <p className="text-sm text-gray-400">Cryptocurrency wallet monitoring</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-400">Email address breach detection</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Built for Modern Teams</h2>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
              ShadowStack integrates seamlessly into your existing security workflow, providing actionable intelligence
              without overwhelming your team with false positives. Our intuitive dashboard and real-time alerts help you
              stay ahead of emerging threats.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
