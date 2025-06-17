"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users, Shield, Settings, AlertTriangle, TestTube, Activity } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  paidUsers: number
  freeUsers: number
  totalTargets: number
  totalAlerts: number
  criticalAlerts: number
  systemHealth: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    freeUsers: 0,
    totalTargets: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    systemHealth: "operational",
  })
  const [loading, setLoading] = useState(true)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [paywallEnabled, setPaywallEnabled] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)

  useEffect(() => {
    loadStats()
    loadSystemConfig()
  }, [])

  const loadStats = async () => {
    try {
      // Load real user data
      const { data: users, error: usersError } = await supabase
        .from("user_profiles")
        .select("id, subscription_status, subscription_tier, last_login, created_at")

      // Load real targets data
      const { data: targets, error: targetsError } = await supabase
        .from("monitoring_targets")
        .select("id, user_id, is_active")

      // Load real alerts data
      const { data: alerts, error: alertsError } = await supabase.from("alerts").select("id, severity, created_at")

      if (usersError || targetsError || alertsError) {
        console.error("Database errors:", { usersError, targetsError, alertsError })
        setSetupNeeded(true)
        return
      }

      // Calculate real stats
      const totalUsers = users?.length || 0
      const paidUsers =
        users?.filter((u) => u.subscription_tier !== "none" && u.subscription_status === "active").length || 0

      const activeUsers =
        users?.filter((u) => {
          if (!u.last_login) return false
          const lastLogin = new Date(u.last_login)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return lastLogin > thirtyDaysAgo
        }).length || 0

      const criticalAlerts = alerts?.filter((a) => a.severity === "critical").length || 0

      setStats({
        totalUsers,
        activeUsers,
        paidUsers,
        freeUsers: totalUsers - paidUsers,
        totalTargets: targets?.length || 0,
        totalAlerts: alerts?.length || 0,
        criticalAlerts,
        systemHealth: "operational",
      })

      setSetupNeeded(false)
    } catch (error) {
      console.error("Error loading admin stats:", error)
      setSetupNeeded(true)
    } finally {
      setLoading(false)
    }
  }

  const loadSystemConfig = async () => {
    try {
      const { data: configs, error } = await supabase
        .from("system_config")
        .select("config_key, config_value")
        .in("config_key", ["paywall_enabled", "maintenance_mode"])

      if (error) {
        console.error("Error loading system config:", error)
        return
      }

      configs?.forEach((config) => {
        if (config.config_key === "paywall_enabled") {
          setPaywallEnabled(config.config_value === "true")
        }
        if (config.config_key === "maintenance_mode") {
          setMaintenanceMode(config.config_value === "true")
        }
      })
    } catch (error) {
      console.error("Error loading system config:", error)
    }
  }

  const updateSystemConfig = async (key: string, value: boolean) => {
    setConfigLoading(true)
    try {
      const { error } = await supabase
        .from("system_config")
        .update({
          config_value: value.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("config_key", key)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_audit_logs").insert({
        admin_user_id: user?.id,
        action: "update_system_config",
        resource_type: "system_config",
        resource_id: key,
        details: { old_value: !value, new_value: value },
      })

      toast({
        title: "Success",
        description: `${key.replace("_", " ")} updated successfully`,
      })

      // Update local state
      if (key === "paywall_enabled") setPaywallEnabled(value)
      if (key === "maintenance_mode") setMaintenanceMode(value)
    } catch (error) {
      console.error("Error updating system config:", error)
      toast({
        title: "Error",
        description: "Failed to update system configuration",
        variant: "destructive",
      })
    } finally {
      setConfigLoading(false)
    }
  }

  const setupAdminAccount = async () => {
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "jaspalbilkhu@gmail.com",
          password: "ShadowStack2024!Admin#Secure",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Admin account setup complete! Refreshing...",
        })
        setTimeout(() => window.location.reload(), 1000)
      } else {
        toast({
          title: "Error",
          description: "Setup failed: " + result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Setup error:", error)
      toast({
        title: "Error",
        description: "Setup failed. Check console for details.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <Badge variant={setupNeeded ? "destructive" : "default"}>
          {setupNeeded ? "Setup Required" : "System Operational"}
        </Badge>
      </div>

      {setupNeeded && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription className="text-yellow-700">
              The admin system needs to be set up. Click the button below to initialize your admin account and database
              tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={setupAdminAccount} className="bg-yellow-600 hover:bg-yellow-700">
              Setup Admin Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Controls */}
      <Card className="mb-8 border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            System Controls
          </CardTitle>
          <CardDescription>Toggle system-wide features and test modes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="paywall-toggle" className="font-medium">
                  Paywall
                </Label>
                <p className="text-sm text-muted-foreground">Enable/disable payment requirements for testing</p>
              </div>
              <Switch
                id="paywall-toggle"
                checked={paywallEnabled}
                onCheckedChange={(checked) => updateSystemConfig("paywall_enabled", checked)}
                disabled={configLoading}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="maintenance-toggle" className="font-medium">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
              </div>
              <Switch
                id="maintenance-toggle"
                checked={maintenanceMode}
                onCheckedChange={(checked) => updateSystemConfig("maintenance_mode", checked)}
                disabled={configLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} active this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.freeUsers} free users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Targets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTargets}</div>
            <p className="text-xs text-muted-foreground">Total assets monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">{stats.totalAlerts} total alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => (window.location.href = "/admin/users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users ({stats.totalUsers})
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => (window.location.href = "/admin/analytics")}
            >
              <Activity className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => (window.location.href = "/admin/system")}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Environment:</span>
                <Badge variant="outline">Production</Badge>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <Badge variant="outline">Supabase</Badge>
              </div>
              <div className="flex justify-between">
                <span>Paywall:</span>
                <Badge variant={paywallEnabled ? "default" : "secondary"}>
                  {paywallEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Admin Email:</span>
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
