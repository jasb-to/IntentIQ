"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isSignedIn, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isSignedIn || !user) {
        router.push("/sign-in")
        return
      }

      try {
        // First check if user_profiles table exists and has the role column
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("role, permissions, email")
          .eq("id", user.id)
          .single()

        if (error) {
          // If table doesn't exist or user doesn't have profile, check email directly
          if (user.email === "jaspalbilkhu@gmail.com") {
            setIsAdmin(true)
            setError("Admin access granted by email. Database setup may be needed.")
          } else {
            setError("Admin access denied. Contact administrator.")
          }
        } else if (profile?.role === "admin" || user.email === "jaspalbilkhu@gmail.com") {
          setIsAdmin(true)
        } else {
          setError("Admin access denied. Insufficient permissions.")
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        // Fallback: allow access for the specific admin email
        if (user.email === "jaspalbilkhu@gmail.com") {
          setIsAdmin(true)
          setError("Admin access granted by email. Database setup may be needed.")
        } else {
          setError("Error checking admin access. Please try again.")
        }
      } finally {
        setCheckingAdmin(false)
      }
    }

    if (!loading) {
      checkAdminAccess()
    }
  }, [isSignedIn, user, loading, router])

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking admin access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Access Denied</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push("/sign-in")}>Sign In Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 m-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        {children}
      </div>
      <Footer />
    </div>
  )
}
