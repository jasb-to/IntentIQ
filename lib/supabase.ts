import { createClient } from "@supabase/supabase-js"

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ufmysxronjaohovgoecc.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbXlzeHJvbmphb2hvdmdvZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMDI0NzcsImV4cCI6MjAzMzg3ODQ3N30.Nh-hJRYGnQgxvdUEWwNgJN-kxTKyZXP5aQvmRsF-8QE"

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
  subscription_tier: "none" | "basic" | "pro" | "enterprise"
  subscription_status: "active" | "inactive" | "past_due" | "canceled"
  subscription_id?: string
  current_period_end?: string
  role?: "user" | "admin"
  permissions?: string[]
  created_at: string
}

export interface MonitoringTarget {
  id: string
  user_id: string
  target_type: "wallet" | "domain" | "email" | "api"
  target_value: string
  target_name?: string
  target_description?: string
  is_active: boolean
  created_at: string
}

export interface Alert {
  id: string
  user_id: string
  target_id: string
  severity: "critical" | "high" | "medium" | "low"
  source_channel: string
  message_text: string
  is_read: boolean
  is_blocked: boolean
  created_at: string
}

export interface UserIntegration {
  id: string
  user_id: string
  integration_type: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface NotificationPreferences {
  user_id: string
  email_alerts: boolean
  min_severity_for_email: "critical" | "high" | "medium" | "low"
  webhook_alerts: boolean
  created_at: string
}
