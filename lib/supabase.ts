import { createClient } from "@supabase/supabase-js"

// Environment variables - using the available ones from the environment
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://ufmysxronjaohovgoecc.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbXlzeHJvbmphb2hvdmdvZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMDI0NzcsImV4cCI6MjAzMzg3ODQ3N30.Nh-hJRYGnQgxvdUEWwNgJN-kxTKyZXP5aQvmRsF-8QE"

// Remove the error throwing condition and replace with:
console.log("🔧 Supabase URL:", supabaseUrl)
console.log("🔧 Supabase Anon Key:", supabaseAnonKey ? "✅ Present" : "❌ Missing")

// Client-side Supabase client (uses anon key + user JWT)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
})

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("❌ Supabase connection error:", error)
  } else {
    console.log("✅ Supabase connected successfully")
  }
})

// Server-side Supabase client - ONLY for server-side API routes
export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing")
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server operations")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  subscription_tier: "free" | "starter" | "pro" | "enterprise"
  subscription_status: "active" | "inactive" | "past_due" | "canceled"
  subscription_id?: string
  current_period_end?: string
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

export interface UserKeyword {
  id: string
  user_id: string
  keyword: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeadSearch {
  id: string
  user_id: string
  keywords: string[]
  platforms: string[]
  results_count: number
  high_intent_count: number
  medium_intent_count: number
  low_intent_count: number
  search_duration_ms?: number
  created_at: string
}

export interface SavedLead {
  id: string
  user_id: string
  platform: string
  external_id: string
  content: string
  author?: string
  url?: string
  intent_score: "HIGH" | "MEDIUM" | "LOW"
  confidence?: number
  keywords?: string[]
  signals?: string[]
  metadata?: Record<string, any>
  is_contacted: boolean
  contacted_at?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  slack_webhook_url?: string
  monitoring_frequency: number
  max_leads_per_search: number
  platforms: string[]
  min_intent_score: "HIGH" | "MEDIUM" | "LOW"
  auto_save_high_intent: boolean
  created_at: string
  updated_at: string
}

export interface MonitoringJob {
  id: string
  user_id: string
  keywords: string[]
  platforms: string[]
  is_active: boolean
  last_run_at?: string
  next_run_at?: string
  frequency_minutes: number
  created_at: string
  updated_at: string
}

export interface SubscriptionLimits {
  tier: string
  max_keywords: number
  max_searches_per_day: number
  max_saved_leads: number
  api_rate_limit: number
  features: string[]
}
