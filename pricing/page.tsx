import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: 29,
    features: [
      "100 keyword searches/month",
      "Reddit monitoring",
      "Basic AI intent scoring",
      "Email alerts",
      "CSV export",
    ],
  },
  {
    name: "Growth",
    price: 99,
    popular: true,
    features: [
      "1,000 keyword searches/month",
      "Reddit + Twitter monitoring",
      "Advanced GPT-4 intent scoring",
      "Real-time alerts",
      "CSV export",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 299,
    features: [
      "5,000 keyword searches/month",
      "All platform monitoring",
      "Advanced AI analysis",
      "Slack integration",
      "API access",
      "Custom integrations",
      "Priority support",
    ],
  },
]

export default function PricingPage() {
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
            href="/dashboard"
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
          >
            Try Demo
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm">
              Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Growth Plan
            </span>
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Start free, scale as you grow. All plans include our AI-powered intent scoring and real-time monitoring.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all ${
                plan.popular ? "ring-2 ring-purple-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">⭐</span>
                </div>
                <h3 className="text-white text-xl font-semibold">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mt-2">
                  ${plan.price}
                  <span className="text-lg font-normal text-slate-300">/month</span>
                </div>
              </div>

              <div className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-slate-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
