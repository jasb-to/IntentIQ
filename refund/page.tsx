import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RefundPolicy() {
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
            <CardTitle className="text-3xl font-bold text-white">Refund Policy</CardTitle>
            <p className="text-slate-200">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6 text-slate-200">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. 14-Day Money-Back Guarantee</h2>
                <p>
                  We offer a 14-day money-back guarantee for all new subscriptions. If you're not satisfied with
                  IntentIQ within the first 14 days of your subscription, you can request a full refund.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Refund Eligibility</h2>
                <p>To be eligible for a refund, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Request the refund within 14 days of your initial subscription</li>
                  <li>Have used the service in good faith</li>
                  <li>Not have violated our Terms of Service</li>
                  <li>Contact our support team with your refund request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Refund Process</h2>
                <p>To request a refund:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Email our support team at support@intentiq.com</li>
                  <li>Include your account email and reason for refund</li>
                  <li>We'll process your request within 2-3 business days</li>
                  <li>Refunds are issued to your original payment method</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Partial Refunds</h2>
                <p>
                  We do not offer partial refunds for unused portions of your subscription period, except in cases where
                  we discontinue the service or there are significant service disruptions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Chargebacks</h2>
                <p>
                  If you initiate a chargeback instead of contacting us directly, your account will be immediately
                  suspended. We encourage you to contact our support team first to resolve any billing issues.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
                <p>
                  For refund requests or questions about this policy, please contact us at support@intentiq.com or
                  through our support chat.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
