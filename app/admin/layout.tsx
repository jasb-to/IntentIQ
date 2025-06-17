"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isSignedIn, user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        // For now, check if email is the admin email
        const isAdminUser = user?.email === "jaspalbilkhu@gmail.com"

        if (!isAdminUser) {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/dashboard")
      } finally {
        setChecking(false)
      }
    }

    checkAdminStatus()
  }, [isSignedIn, user, loading, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </div>
  )
}
