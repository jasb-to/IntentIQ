import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        await handleSuccessfulPayment(session)
        break

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object
        await handleSubscriptionChange(subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(session: any) {
  const { userId, planId } = session.metadata

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscription: {
        upsert: {
          create: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            planId,
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
          update: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            planId,
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  })
}

async function handleSubscriptionChange(subscription: any) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  })
}
