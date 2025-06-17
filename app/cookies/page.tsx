"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  })

  const handleSave = () => {
    // In a real implementation, this would save to localStorage or a cookie
    alert("Cookie preferences saved!")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Cookie Preferences</h1>

        <div className="prose prose-invert max-w-none mb-8">
          <p>
            ShadowStack uses cookies and similar technologies to provide, protect, and improve our services. This page
            allows you to customize your cookie preferences for our website.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Cookie Preferences</CardTitle>
            <CardDescription>
              You can choose which categories of cookies you want to allow. Please note that necessary cookies cannot be
              disabled as they are required for the website to function properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="necessary" className="text-base font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
              </div>
              <Switch id="necessary" checked={preferences.necessary} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="functional" className="text-base font-medium">
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  These cookies enable personalized features and functionality.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-base font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  These cookies help us understand how visitors interact with our website.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing" className="text-base font-medium">
                  Marketing Cookies
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardFooter>
        </Card>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit a website. They are widely used
            to make websites work more efficiently and provide information to the website owners.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>ShadowStack uses cookies for the following purposes:</p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>
              <strong>Necessary:</strong> Authentication, security, and website functionality
            </li>
            <li>
              <strong>Functional:</strong> Remember your preferences and settings
            </li>
            <li>
              <strong>Analytics:</strong> Understand how visitors use our website
            </li>
            <li>
              <strong>Marketing:</strong> Display relevant advertisements and track their effectiveness
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third parties on our behalf. These third parties may include analytics providers,
            advertising networks, and social media platforms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p>
            In addition to the controls provided on this page, you can manage cookies through your browser settings.
            Please note that restricting cookies may impact the functionality of our website.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at:
            <br />
            <a href="mailto:privacy@shadowstack.com" className="text-primary hover:underline">
              privacy@shadowstack.com
            </a>
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
