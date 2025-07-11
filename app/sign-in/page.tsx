"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const message = searchParams.get("message")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("🔐 Signing in with:", formData.email)
      await signIn(formData.email, formData.password)

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      })

      // Small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (error: any) {
      console.error("❌ Sign in error:", error)

      let errorMessage = "Failed to sign in"

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password"
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account"
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Too many attempts. Please try again later"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login function
  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      console.log("🎭 Demo login attempt")
      await signIn("demo@intentiq.com", "demo12345")

      toast({
        title: "Welcome to the demo!",
        description: "You've been signed in with the demo account.",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (error: any) {
      console.error("❌ Demo login error:", error)
      toast({
        title: "Demo Login Failed",
        description: "The demo account may not be set up yet. Please try creating a regular account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-16 px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>

          {message && (
            <div className="px-6">
              <Alert>
                <AlertDescription className="text-white">{message}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@intentiq.com"
                  onChange={handleChange}
                  value={formData.email}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Link href="#" className="text-sm text-purple-300 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={formData.password}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Demo...
                    </>
                  ) : (
                    "Try Demo Account"
                  )}
                </Button>
              </div>

              <p className="mt-4 text-center text-sm text-gray-300">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-purple-300 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
