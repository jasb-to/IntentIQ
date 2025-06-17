"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Save, RefreshCw, FileText, Globe, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContentItem {
  id: string
  type: string
  title: string
  content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [landingPageContent, setLandingPageContent] = useState({
    hero_title: "IntentIQ - AI-Powered Lead Generation",
    hero_subtitle: "Discover high-intent prospects from social media conversations",
    hero_cta: "Start Free Trial",
    features_title: "Why Choose IntentIQ?",
    pricing_title: "Simple, Transparent Pricing",
    footer_text: "© 2024 IntentIQ. All rights reserved.",
  })

  const [emailTemplates, setEmailTemplates] = useState({
    welcome_subject: "Welcome to IntentIQ!",
    welcome_body: "Thank you for joining IntentIQ. Get started with your lead generation journey.",
    alert_subject: "New High-Intent Lead Detected",
    alert_body: "We've found a new high-intent prospect matching your criteria.",
  })

  const [systemMessages, setSystemMessages] = useState({
    maintenance_message: "System is currently under maintenance. Please check back later.",
    upgrade_prompt: "Upgrade to Pro to unlock unlimited lead generation.",
    trial_expired: "Your trial has expired. Upgrade to continue using IntentIQ.",
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      // In a real app, you'd fetch from a content management table
      // For now, we'll use the existing system_config table
      const { data, error } = await supabase.from("system_config").select("*")

      if (error) throw error

      // Parse existing config into content sections
      const configMap =
        data?.reduce(
          (acc, item) => {
            acc[item.config_key] = item.config_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      // Update state with existing values or defaults
      setLandingPageContent({
        hero_title: configMap.hero_title || landingPageContent.hero_title,
        hero_subtitle: configMap.hero_subtitle || landingPageContent.hero_subtitle,
        hero_cta: configMap.hero_cta || landingPageContent.hero_cta,
        features_title: configMap.features_title || landingPageContent.features_title,
        pricing_title: configMap.pricing_title || landingPageContent.pricing_title,
        footer_text: configMap.footer_text || landingPageContent.footer_text,
      })

      setEmailTemplates({
        welcome_subject: configMap.welcome_subject || emailTemplates.welcome_subject,
        welcome_body: configMap.welcome_body || emailTemplates.welcome_body,
        alert_subject: configMap.alert_subject || emailTemplates.alert_subject,
        alert_body: configMap.alert_body || emailTemplates.alert_body,
      })

      setSystemMessages({
        maintenance_message: configMap.maintenance_message || systemMessages.maintenance_message,
        upgrade_prompt: configMap.upgrade_prompt || systemMessages.upgrade_prompt,
        trial_expired: configMap.trial_expired || systemMessages.trial_expired,
      })
    } catch (error) {
      console.error("Error fetching content:", error)
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (section: string, data: Record<string, string>) => {
    setSaving(true)
    try {
      const updates = Object.entries(data).map(([key, value]) => ({
        config_key: key,
        config_value: value,
        config_type: "string",
        description: `${section} content`,
        updated_at: new Date().toISOString(),
      }))

      for (const update of updates) {
        const { error } = await supabase.from("system_config").upsert(update)
        if (error) throw error
      }

      toast({
        title: "Success",
        description: `${section} content updated successfully`,
      })
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Management</h1>
            <p className="text-muted-foreground">Manage website content, email templates, and system messages</p>
          </div>
          <Button variant="outline" onClick={fetchContent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="landing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="landing" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Landing Page
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Messages
            </TabsTrigger>
          </TabsList>

          {/* Landing Page Content */}
          <TabsContent value="landing">
            <Card>
              <CardHeader>
                <CardTitle>Landing Page Content</CardTitle>
                <CardDescription>Manage the main website content and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={landingPageContent.hero_title}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, hero_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={landingPageContent.hero_subtitle}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, hero_subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_cta">Hero Call-to-Action</Label>
                  <Input
                    id="hero_cta"
                    value={landingPageContent.hero_cta}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, hero_cta: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features_title">Features Section Title</Label>
                  <Input
                    id="features_title"
                    value={landingPageContent.features_title}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, features_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing_title">Pricing Section Title</Label>
                  <Input
                    id="pricing_title"
                    value={landingPageContent.pricing_title}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, pricing_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_text">Footer Text</Label>
                  <Input
                    id="footer_text"
                    value={landingPageContent.footer_text}
                    onChange={(e) => setLandingPageContent({ ...landingPageContent, footer_text: e.target.value })}
                  />
                </div>

                <Button onClick={() => saveContent("Landing Page", landingPageContent)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Landing Page Content"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage automated email templates and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Welcome Email</h3>
                  <div className="space-y-2">
                    <Label htmlFor="welcome_subject">Subject Line</Label>
                    <Input
                      id="welcome_subject"
                      value={emailTemplates.welcome_subject}
                      onChange={(e) => setEmailTemplates({ ...emailTemplates, welcome_subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="welcome_body">Email Body</Label>
                    <Textarea
                      id="welcome_body"
                      rows={4}
                      value={emailTemplates.welcome_body}
                      onChange={(e) => setEmailTemplates({ ...emailTemplates, welcome_body: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Alert Email</h3>
                  <div className="space-y-2">
                    <Label htmlFor="alert_subject">Subject Line</Label>
                    <Input
                      id="alert_subject"
                      value={emailTemplates.alert_subject}
                      onChange={(e) => setEmailTemplates({ ...emailTemplates, alert_subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert_body">Email Body</Label>
                    <Textarea
                      id="alert_body"
                      rows={4}
                      value={emailTemplates.alert_body}
                      onChange={(e) => setEmailTemplates({ ...emailTemplates, alert_body: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={() => saveContent("Email Templates", emailTemplates)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Email Templates"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Messages */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Messages</CardTitle>
                <CardDescription>Manage system-wide messages and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance_message"
                    value={systemMessages.maintenance_message}
                    onChange={(e) => setSystemMessages({ ...systemMessages, maintenance_message: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upgrade_prompt">Upgrade Prompt</Label>
                  <Textarea
                    id="upgrade_prompt"
                    value={systemMessages.upgrade_prompt}
                    onChange={(e) => setSystemMessages({ ...systemMessages, upgrade_prompt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial_expired">Trial Expired Message</Label>
                  <Textarea
                    id="trial_expired"
                    value={systemMessages.trial_expired}
                    onChange={(e) => setSystemMessages({ ...systemMessages, trial_expired: e.target.value })}
                  />
                </div>

                <Button onClick={() => saveContent("System Messages", systemMessages)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save System Messages"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
