import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export const PRICING_PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    currency: "usd",
    interval: "month",
    features: [
      "100 keyword searches/month",
      "Reddit + Twitter monitoring",
      "Basic AI intent scoring",
      "Email alerts",
      "CSV export",
    ],
  },
  growth: {
    name: "Growth",
    price: 99,
    currency: "usd",
    interval: "month",
    features: [
      "1,000 keyword searches/month",
      "Reddit + Twitter monitoring",
      "Advanced GPT-4 intent scoring",
      "Real-time alerts",
      "CSV export",
      "Priority support",
    ],
  },
  pro: {
    name: "Pro",
    price: 299,
    currency: "usd",
    interval: "month",
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
}
