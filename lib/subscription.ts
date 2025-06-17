// Empty implementation with no Clerk imports
export type SubscriptionTier = "basic" | "pro" | "enterprise" | "none"

export interface TierDetails {
  name: string
  priceId?: string
  price: number
  currency: string
  features: string[]
  maxLimit: number
}

export interface CustomerSubscription {
  id: string
  tier: SubscriptionTier
  tierDetails: TierDetails
  status: string
  currentPeriodEnd: number
}

// Mock function that doesn't use Clerk
export async function getUserSubscription(): Promise<CustomerSubscription> {
  return {
    id: "demo-subscription",
    tier: "none",
    tierDetails: {
      name: "No Subscription",
      price: 0,
      currency: "$",
      features: [],
      maxLimit: 0,
    },
    status: "inactive",
    currentPeriodEnd: 0,
  }
}
