"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { AlertTriangle, Shield, Eye, Clock, CheckCircle, ExternalLink } from "lucide-react"

interface Alert {
  id: string
  target_id: string
  severity: "critical" | "high" | "medium" | "low"
  source_channel: string
  message_text: string
  is_read: boolean
  is_blocked: boolean
  created_at: string
  monitoring_targets?: {
    target_type: string
    target_value: string
    target_name?: string
  }
}

export default function AlertsPage() {
  const router = useRouter()
  const { isSignedIn, user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all")

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }
    fetchAlerts()
  }, [isSignedIn, router])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select(`
          *,
          monitoring_targets (
            target_type,
            target_value,
            target_name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId)
        .eq("user_id", user?.id)

      if (error) throw error
      fetchAlerts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <Shield className="h-4 w-4" />
      case "medium":
      case "high":
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    switch (filter) {
      case "unread":
        return !alert.is_read
      case "critical":
        return alert.severity === "critical"
      default:
        return true
    }
  })

  if (!isSignedIn) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Security Alerts</h1>
            <p className="text-muted-foreground">Monitor and manage security alerts for your monitored assets</p>
          </div>

          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({alerts.filter((a) => !a.is_read).length})</TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({alerts.filter((a) => a.severity === "critical").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                    <p className="text-muted-foreground mb-6">
                      {filter === "all" ? "No security alerts have been detected yet" : `No ${filter} alerts found`}
                    </p>
                    <Button onClick={() => router.push("/dashboard")}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className={`transition-all hover:shadow-lg ${
                        !alert.is_read ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getSeverityColor(alert.severity)} flex items-center gap-1`}>
                              {getSeverityIcon(alert.severity)}
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {!alert.is_read && (
                              <Badge variant="outline" className="text-xs">
                                NEW
                              </Badge>
                            )}
                            {alert.is_blocked && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                <Shield className="h-3 w-3 mr-1" />
                                BLOCKED
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Target:</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {alert.monitoring_targets?.target_name || alert.monitoring_targets?.target_value}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {alert.monitoring_targets?.target_type}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Source:</p>
                          <p className="text-sm">{alert.source_channel}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Message:</p>
                          <p className="text-sm bg-muted p-3 rounded-md">{alert.message_text}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {alert.is_read ? (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Read
                              </span>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => markAsRead(alert.id)}>
                                Mark as Read
                              </Button>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
