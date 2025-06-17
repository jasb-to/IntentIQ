import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Users, Award, Zap, CheckCircle, AlertTriangle, Eye } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">About ShadowStack</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to make advanced cybersecurity accessible to every organization, regardless of size or
              technical expertise.
            </p>
          </div>

          {/* Our Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ShadowStack was founded in 2023 by a team of cybersecurity experts who recognized a critical gap in
                  the market: while large enterprises had access to sophisticated security tools, smaller organizations
                  were left vulnerable.
                </p>
                <p>
                  Our founders had spent years working at major security firms and government agencies, witnessing
                  firsthand how the rapidly evolving threat landscape was outpacing the defensive capabilities of most
                  businesses.
                </p>
                <p>
                  We set out to build a solution that would democratize access to enterprise-grade security monitoring,
                  making it accessible, affordable, and easy to use for organizations of all sizes.
                </p>
              </div>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg" />
              <Image src="/placeholder.svg?height=600&width=800" alt="ShadowStack team" fill className="object-cover" />
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold mb-12 text-center">How ShadowStack Protects Your Business</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">1. Monitor Public Channels</h3>
                <p className="text-muted-foreground">
                  We continuously scan public Telegram channels, forums, and dark web sources for mentions of your
                  sensitive assets like wallet addresses, domains, and email addresses.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">2. Instant Threat Detection</h3>
                <p className="text-muted-foreground">
                  Our AI-powered system instantly identifies when your assets are mentioned in breach chatter,
                  ransomware discussions, or other malicious activities.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">3. Real-Time Alerts</h3>
                <p className="text-muted-foreground">
                  Get immediate email notifications and dashboard alerts the moment your assets are compromised, giving
                  you precious time to respond before damage occurs.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Getting Started is Simple</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">What You Need to Provide:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Cryptocurrency wallet addresses you want to monitor</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Domain names and subdomains</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Email addresses and company identifiers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>API endpoints and server identifiers</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">How It Helps Your Business:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Early warning of potential breaches before they impact customers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Protect your reputation by responding to threats quickly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Reduce incident response time from days to minutes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Comply with data breach notification requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Security First</h3>
                <p className="text-muted-foreground">
                  We never compromise on security. Every decision we make prioritizes the protection of our customers'
                  data and systems.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We believe everyone deserves access to top-tier security tools, regardless of technical expertise or
                  budget constraints.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in everything we do, from code quality to customer support and beyond.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously push the boundaries of what's possible in cybersecurity, staying ahead of emerging
                  threats.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-muted/30 rounded-lg p-8 mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">ShadowStack by the Numbers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're proud of the impact we've made in the cybersecurity landscape since our founding.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">5M+</p>
                <p className="text-muted-foreground">Threats Detected</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">1,000+</p>
                <p className="text-muted-foreground">Customers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">99.9%</p>
                <p className="text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Monitoring</p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Business?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join hundreds of businesses already using ShadowStack to stay ahead of cyber threats. Get started with our
              free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md text-foreground bg-background hover:bg-muted transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
