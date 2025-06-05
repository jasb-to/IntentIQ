"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export default function CookiePreferences() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: false,
    functional: true,
  })

  const handleSavePreferences = () => {
    // Save to localStorage or send to API
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences))
    alert("Cookie preferences saved!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IQ</span>
            </div>
            <span className="text-xl font-bold text-white">IntentIQ</span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Cookie Preferences</CardTitle>
            <p className="text-slate-200">Manage your cookie preferences and privacy settings</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6 text-slate-200">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">About Cookies</h2>
                <p>
                  We use cookies and similar technologies to provide, protect, and improve our services. You can control
                  which cookies you allow through the settings below.
                </p>
              </section>

              <div className="space-y-4">
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Necessary Cookies</h3>
                        <p className="text-sm text-slate-300">
                          Essential for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <Switch checked={preferences.necessary} disabled />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Analytics Cookies</h3>
                        <p className="text-sm text-slate-300">
                          Help us understand how visitors interact with our website.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Marketing Cookies</h3>
                        <p className="text-sm text-slate-300">
                          Used to deliver personalized advertisements and track campaign performance.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Functional Cookies</h3>
                        <p className="text-sm text-slate-300">
                          Enable enhanced functionality and personalization features.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.functional}
                        onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, functional: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Save Preferences
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPreferences({
                      necessary: true,
                      analytics: false,
                      marketing: false,
                      functional: false,
                    })
                  }
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPreferences({
                      necessary: true,
                      analytics: true,
                      marketing: true,
                      functional: true,
                    })
                  }
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
