"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Bell, Send, Mail, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  target_audience: "all" | "admins" | "users" | "subscribers"
  is_sent: boolean
  scheduled_for?: string
  created_at: string
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    target_audience: "all" as const,
    send_immediately: true,
    scheduled_for: "",
  })

  const [emailSettings, setEmailSettings] = useState({
    smtp_enabled: true,
    smtp_host: "smtp.resend.com",
    smtp_port: 587,
    from_email: "notifications@intentiq.com",
    from_name: "IntentIQ",
  })

  useEffect(() => {
    fetchNotifications()
    fetchEmailSettings()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_config")
        .select("config_key, config_value")
        .in("config_key", ["smtp_enabled", "smtp_host", "smtp_port", "from_email", "from_name"])

      if (error) throw error

      const settings =
        data?.reduce(
          (acc, item) => {
            acc[item.config_key] = item.config_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      setEmailSettings({
        smtp_enabled: settings.smtp_enabled === "true",
        smtp_host: settings.smtp_host || emailSettings.smtp_host,
        smtp_port: Number.parseInt(settings.smtp_port) || emailSettings.smtp_port,
        from_email: settings.from_email || emailSettings.from_email,
        from_name: settings.from_name || emailSettings.from_name,
      })
    } catch (error) {
      console.error("Error fetching email settings:", error)
    }
  }

  const sendNotification = async () => {
    setSending(true)
    try {
      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        target_audience: newNotification.target_audience,
        is_sent: newNotification.send_immediately,
        scheduled_for: newNotification.send_immediately ? null : newNotification.scheduled_for,
      }

      const { error } = await supabase.from("admin_notifications").insert(notificationData)

      if (error) throw error

      // If sending immediately, also send emails
      if (newNotification.send_immediately) {
        await sendEmailNotifications(notificationData)
      }

      toast({
        title: "Success",
        description: newNotification.send_immediately ? "Notification sent successfully" : "Notification scheduled",
      })

      // Reset form
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        target_audience: "all",
        send_immediately: true,
        scheduled_for: "",
      })

      fetchNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const sendEmailNotifications = async (notification: any) => {
    try {
      // Get target users based on audience
      let query = supabase.from("user_profiles").select("email, full_name")

      switch (notification.target_audience) {
        case "admins":
          query = query.eq("role", "admin")
          break
        case "subscribers":
          query = query.neq("subscription_tier", "none").eq("subscription_status", "active")
          break
        case "users":
          query = query.eq("role", "user")
          break
        // 'all' doesn't need additional filtering
      }

      const { data: users, error } = await query

      if (error) throw error

      // In a real implementation, you'd send emails via your email service
      console.log(`Would send email to ${users?.length} users:`, notification)
    } catch (error) {
      console.error("Error sending email notifications:", error)
    }
  }

  const saveEmailSettings = async () => {
    try {
      const updates = [
        { config_key: "smtp_enabled", config_value: emailSettings.smtp_enabled.toString() },
        { config_key: "smtp_host", config_value: emailSettings.smtp_host },
        { config_key: "smtp_port", config_value: emailSettings.smtp_port.toString() },
        { config_key: "from_email", config_value: emailSettings.from_email },
        { config_key: "from_name", config_value: emailSettings.from_name },
      ]

      for (const update of updates) {
        const { error } = await supabase.from("system_config").upsert({
          ...update,
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Email settings updated successfully",
      })
    } catch (error) {
      console.error("Error saving email settings:", error)
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Management</h1>
            <p className="text-muted-foreground">Send notifications and manage email settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send New Notification */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Notification
                </CardTitle>
                <CardDescription>Create and send notifications to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Notification message"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select
                      value={newNotification.target_audience}
                      onValueChange={(value: any) => setNewNotification({ ...newNotification, target_audience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                        <SelectItem value="users">Regular Users</SelectItem>
                        <SelectItem value="subscribers">Subscribers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_immediately"
                    checked={newNotification.send_immediately}
                    onCheckedChange={(checked) => setNewNotification({ ...newNotification, send_immediately: checked })}
                  />
                  <Label htmlFor="send_immediately">Send immediately</Label>
                </div>

                {!newNotification.send_immediately && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_for">Schedule for</Label>
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={newNotification.scheduled_for}
                      onChange={(e) => setNewNotification({ ...newNotification, scheduled_for: e.target.value })}
                    />
                  </div>
                )}

                <Button onClick={sendNotification} disabled={sending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : newNotification.send_immediately ? "Send Now" : "Schedule"}
                </Button>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>Configure email notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp_enabled"
                    checked={emailSettings.smtp_enabled}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, smtp_enabled: checked })}
                  />
                  <Label htmlFor="smtp_enabled">Enable email notifications</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                  />
                </div>

                <Button onClick={saveEmailSettings} variant="outline" className="w-full">
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notification History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>Recent notifications sent to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <h4 className="font-medium">{notification.title}</h4>
                      </div>
                      <Badge variant={notification.is_sent ? "default" : "secondary"}>
                        {notification.is_sent ? "Sent" : "Scheduled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Target: {notification.target_audience}</span>
                      <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
