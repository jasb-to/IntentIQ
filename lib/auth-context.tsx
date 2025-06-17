"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, company?: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("🔐 Getting initial session...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Error getting session:", error)
          setLoading(false)
          return
        }

        console.log("✅ Session retrieved:", session ? "Found" : "None")
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log("👤 User is signed in:", session.user.email)
          await ensureUserProfile(session.user)
        }
      } catch (error) {
        console.error("❌ Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email)
        await ensureUserProfile(session.user)
      }

      if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if user profile exists
      const { data: profile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ Error fetching user profile:", fetchError)
        return
      }

      if (!profile) {
        console.log("📝 Creating user profile...")
        const { error: insertError } = await supabase.from("user_profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          company_name: user.user_metadata?.company_name || null,
          subscription_tier: "none",
          subscription_status: "inactive",
          role: "user",
        })

        if (insertError) {
          console.error("❌ Error creating user profile:", insertError)
        } else {
          console.log("✅ User profile created successfully")
        }
      }
    } catch (error) {
      console.error("❌ Error in ensureUserProfile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("❌ Sign in error:", error)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error("No user data returned")
      }

      console.log("✅ Sign in successful:", data.user.email)
      return data
    } catch (error: any) {
      console.error("❌ Sign in failed:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, company?: string) => {
    try {
      console.log("📝 Attempting sign up for:", email)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: company || null,
          },
        },
      })

      if (error) {
        console.error("❌ Sign up error:", error)
        throw new Error(error.message)
      }

      console.log("✅ Sign up successful:", data.user?.email)
      return data
    } catch (error: any) {
      console.error("❌ Sign up failed:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("👋 Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Sign out error:", error)
        throw error
      }
      console.log("✅ Sign out successful")
    } catch (error: any) {
      console.error("❌ Sign out failed:", error)
      throw error
    }
  }

  const value = {
    user,
    session,
    isSignedIn: !!user,
    signIn,
    signUp,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
