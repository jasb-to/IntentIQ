"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Bell, Webhook, User, Save } from "lucide-react"

interface NotificationPreferences {
  email_alerts: boolean
  min_severity_for_email: "critical" | "high" | "medium" | "low"
  webhook_alerts: boolean
}

interface UserProfile {
  full_name?: string
  company_name?: string
  subscription_tier: string
  subscription_status: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { isSignedIn, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    company_name: "",
    subscription_tier: "none",
    subscription_status: "inactive",
  })

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_alerts: true,
    min_severity_for_email: "medium",
    webhook_alerts: false,
  })

  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }
    fetchSettings()
  }, [isSignedIn, router])

  const fetchSettings = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch notification preferences
      const { data: notifData, error: notifError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .single()

      if (notifError && notifError.code !== "PGRST116") {
        throw notifError
      }

      if (notifData) {
        setNotifications({
          email_alerts: notifData.email_alerts,
          min_severity_for_email: notifData.min_severity_for_email,
          webhook_alerts: notifData.webhook_alerts,
        })
      }

      // Fetch webhook integration
      const { data: webhookData, error: webhookError } = await supabase
        .from("user_integrations")
        .select("config")
        .eq("user_id", user?.id)
        .eq("integration_type", "webhook")
        .single()

      if (webhookData?.config?.url) {
        setWebhookUrl(webhookData.config.url)
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user?.id,
        email: user?.email,
        full_name: profile.full_name,
        company_name: profile.company_name,
        subscription_tier: profile.subscription_tier,
        subscription_status: profile.subscription_status,
      })

      if (error) throw error
      toast({ title: "Success", description: "Profile updated successfully" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user?.id,
        ...notifications,
      })

      if (error) throw error
      toast({ title: "Success", description: "Notification preferences updated" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveWebhook = async () => {
    setSaving(true)
    try {
      if (webhookUrl) {
        const { error } = await supabase.from("user_integrations").upsert({
          user_id: user?.id,
          integration_type: "webhook",
          config: { url: webhookUrl },
          is_active: notifications.webhook_alerts,
        })

        if (error) throw error
      }

      toast({ title: "Success", description: "Webhook settings updated" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and notification settings</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={profile.company_name || ""}
                        onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                  </div>

                  <Button onClick={saveProfile} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure how and when you receive security alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive security alerts via email</p>
                    </div>
                    <Switch
                      checked={notifications.email_alerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email_alerts: checked })}
                    />
                  </div>

                  {notifications.email_alerts && (
                    <div className="space-y-2">
                      <Label htmlFor="min_severity">Minimum Severity for Email</Label>
                      <Select
                        value={notifications.min_severity_for_email}
                        onValueChange={(value: any) =>
                          setNotifications({ ...notifications, min_severity_for_email: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low and above</SelectItem>
                          <SelectItem value="medium">Medium and above</SelectItem>
                          <SelectItem value="high">High and above</SelectItem>
                          <SelectItem value="critical">Critical only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Webhook Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send alerts to your webhook endpoint</p>
                    </div>
                    <Switch
                      checked={notifications.webhook_alerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, webhook_alerts: checked })}
                    />
                  </div>

                  <Button onClick={saveNotifications} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Notifications"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook Integration
                  </CardTitle>
                  <CardDescription>Configure webhook endpoints to receive real-time alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-app.com/webhook/shadowstack"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send POST requests to this URL when alerts are triggered
                    </p>
                  </div>

                  <Button onClick={saveWebhook} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Webhook"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
