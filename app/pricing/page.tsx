import Link from "next/link"

export default function Pricing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
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
            href="/dashboard"
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
          >
            Try Demo
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-6 text-center">Pricing Plans</h1>
        <p className="text-center text-gray-300 mb-12">Choose the plan that fits your lead generation needs</p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
          {/* Starter Plan */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold">Starter</h2>
            <p className="text-3xl font-bold mt-2">
              $29<span className="text-sm font-normal">/month</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ 100 keyword searches/month</li>
              <li>✓ Reddit monitoring</li>
              <li>✓ Basic AI intent scoring</li>
              <li>✓ Email alerts</li>
              <li>✓ CSV export</li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mt-6">Get Started</button>
          </div>

          {/* Growth Plan */}
          <div className="bg-white/10 border border-purple-500/50 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs">Most Popular</span>
            </div>
            <h2 className="text-2xl font-bold">Growth</h2>
            <p className="text-3xl font-bold mt-2">
              $99<span className="text-sm font-normal">/month</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ 1,000 keyword searches/month</li>
              <li>✓ Reddit + Twitter monitoring</li>
              <li>✓ Advanced GPT-4 intent scoring</li>
              <li>✓ Real-time alerts</li>
              <li>✓ CSV export</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mt-6">Get Started</button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-3xl font-bold mt-2">
              $299<span className="text-sm font-normal">/month</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ 5,000 keyword searches/month</li>
              <li>✓ All platform monitoring</li>
              <li>✓ Advanced AI analysis</li>
              <li>✓ Slack integration</li>
              <li>✓ API access</li>
              <li>✓ Custom integrations</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mt-6">Get Started</button>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="border border-white/20 hover:bg-white/10 px-6 py-3 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
