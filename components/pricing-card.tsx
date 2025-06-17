"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface TierDetails {
  name: string
  priceId?: string
  price: number
  currency: string
  features: string[]
  maxLimit: number
}

type SubscriptionTier = "basic" | "pro" | "enterprise" | "none"

interface CustomerSubscription {
  id: string
  tier: SubscriptionTier
  tierDetails: TierDetails
  status: string
  currentPeriodEnd: number
}

interface PricingCardProps {
  tier: SubscriptionTier
  tierDetails: TierDetails
  isCurrentTier?: boolean
  subscription: CustomerSubscription | null
  isYearly?: boolean
}

export function PricingCard({
  tier,
  tierDetails,
  isCurrentTier = false,
  subscription,
  isYearly = false,
}: PricingCardProps) {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscription = async () => {
    if (!isSignedIn) {
      router.push("/sign-up")
      return
    }

    if (isCurrentTier) {
      router.push("/dashboard")
      return
    }

    try {
      setIsLoading(true)
      // For demo purposes, just redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply 20% discount for yearly subscriptions
  const displayPrice = isYearly ? (tierDetails.price * 0.8 * 12).toFixed(2) : tierDetails.price.toFixed(2)

  const tierColorClasses = {
    basic: "border-green-500/20 hover:border-green-500/40",
    pro: "border-blue-500/20 hover:border-blue-500/40",
    enterprise: "border-purple-500/20 hover:border-purple-500/40",
    none: "",
  }

  const tierBgClasses = {
    basic: "bg-green-500/10 text-green-500",
    pro: "bg-blue-500/10 text-blue-500",
    enterprise: "bg-purple-500/10 text-purple-500",
    none: "bg-gray-500/10 text-gray-500",
  }

  return (
    <div className={`rounded-xl border bg-card shadow-lg transition-all hover:shadow-xl ${tierColorClasses[tier]}`}>
      <div className="flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{tierDetails.name}</h3>
          <div className={`px-3 py-1 text-xs rounded-full ${tierBgClasses[tier]}`}>
            {tier === "basic" ? "Starter" : tier === "pro" ? "Popular" : "Premium"}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-end">
            <span className="text-3xl font-bold">
              {tierDetails.currency}
              {displayPrice}
            </span>
            <span className="text-muted-foreground ml-1">{isYearly ? "/year" : "/month"}</span>
          </div>
          {isYearly && <p className="text-xs text-muted-foreground mt-1">20% discount applied</p>}
        </div>
        <ul className="mb-6 space-y-2">
          {tierDetails.features.map((feature) => (
            <li key={feature} className="flex items-center text-sm">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Button
            className="w-full"
            onClick={handleSubscription}
            disabled={isLoading}
            variant={isCurrentTier ? "outline" : "default"}
          >
            {isLoading
              ? "Loading..."
              : isCurrentTier
                ? "Current Plan"
                : subscription?.tier === "none"
                  ? "Subscribe"
                  : "Switch Plan"}
          </Button>
        </div>
      </div>
    </div>
  )
}
