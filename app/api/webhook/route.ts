import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("📨 Webhook received")

    // Simple webhook handler for deployment
    const body = await request.text()
    console.log("Webhook body length:", body.length)

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
    })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ShadowStack webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
