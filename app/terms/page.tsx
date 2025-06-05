import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IQ</span>
            </div>
            <span className="text-xl font-bold text-white">IntentIQ</span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Terms of Service</CardTitle>
            <p className="text-slate-200">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6 text-slate-200">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using IntentIQ, you accept and agree to be bound by the terms and provision of this
                  agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
                <p>
                  IntentIQ is an AI-powered lead generation tool that monitors social media platforms for buyer intent
                  signals. We provide:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Real-time social media monitoring</li>
                  <li>AI-powered intent analysis</li>
                  <li>Lead generation dashboard</li>
                  <li>Export and integration capabilities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the service in compliance with all applicable laws</li>
                  <li>Not attempt to reverse engineer or hack our systems</li>
                  <li>Respect rate limits and usage quotas</li>
                  <li>Not use the service for spam or malicious activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Payment Terms</h2>
                <p>
                  Subscription fees are billed monthly in advance. All payments are processed securely through Stripe.
                  Refunds are subject to our refund policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Limitation of Liability</h2>
                <p>
                  IntentIQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                  resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we
                  believe violates these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Contact Information</h2>
                <p>For questions about these Terms of Service, please contact us at legal@intentiq.com</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
