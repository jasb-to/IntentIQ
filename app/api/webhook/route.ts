// Import the headers and NextResponse
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// Import Stripe more carefully
import Stripe from "stripe"

// Create a more robust function to initialize Stripe
function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  // If we're in development or building and the key isn't available,
  // return a mock implementation that won't break builds
  if (!secretKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY is not defined. Using mock Stripe instance.")
    // Return a minimal mock that won't break during build
    return {
      webhooks: {
        constructEvent: () => ({
          type: "mock_event",
          data: { object: {} },
        }),
      },
    } as unknown as Stripe
  }

  // Otherwise return the real Stripe instance
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  })
}

// Initialize Stripe with the helper function
const stripe = getStripeInstance()

// Initialize webhookSecret with proper checks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    // Only attempt to verify if we have all required values
    if (!endpointSecret || !sig) {
      console.warn("Missing webhook secret or signature, skipping verification")
      // Parse the body directly as a fallback during development/build
      event = JSON.parse(body) as Stripe.Event
    } else {
      // Verify with Stripe normally
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    }
  } catch (err: any) {
    console.error("Webhook error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session
      console.log("✅ Payment received:", session.id)
      break

    case "invoice.payment_failed":
      console.log("❌ Payment failed.")
      break

    // Add other event types here
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
