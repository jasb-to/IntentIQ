import { NextResponse } from "next/server"

// Simplified webhook route that doesn't use Stripe during build
export async function POST(req: Request) {
  try {
    console.log("Webhook received")

    // For now, just return success
    // We'll implement Stripe webhook handling after deployment
    return NextResponse.json(
      {
        received: true,
        message: "Webhook endpoint ready - Stripe integration pending",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Webhook error:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    status: "Webhook endpoint is active",
    message: "POST to this endpoint to receive webhooks",
  })
}
