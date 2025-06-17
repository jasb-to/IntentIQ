"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemConfig {
  paywall_enabled: boolean
  max_targets_free: number
  max_targets_basic: number
  max_targets_pro: number
  max_targets_enterprise: number
  telegram_scan_interval: number
  email_alerts_enabled: boolean
  maintenance_mode: boolean
  maintenance_message: string
}

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    paywall_enabled: true,
    max_targets_free: 3,
    max_targets_basic: 10,
    max_targets_pro: 50,
    max_targets_enterprise: 999,
    telegram_scan_interval: 300,
    email_alerts_enabled: true,
    maintenance_mode: false,
    maintenance_message: "System is currently under maintenance. Please check back later.",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSystemConfig()
  }, [])

  const fetchSystemConfig = async () => {
    try {
      const { data, error } = await supabase.from("system_config").select("config_key, config_value")

      if (error) throw error

      const configMap =
        data?.reduce(
          (acc, item) => {
            acc[item.config_key] = item.config_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      setConfig({
        paywall_enabled: configMap.paywall_enabled === "true",
        max_targets_free: Number.parseInt(configMap.max_targets_free) || 3,
        max_targets_basic: Number.parseInt(configMap.max_targets_basic) || 10,
        max_targets_pro: Number.parseInt(configMap.max_targets_pro) || 50,
        max_targets_enterprise: Number.parseInt(configMap.max_targets_enterprise) || 999,
        telegram_scan_interval: Number.parseInt(configMap.telegram_scan_interval) || 300,
        email_alerts_enabled: configMap.email_alerts_enabled === "true",
        maintenance_mode: configMap.maintenance_mode === "true",
        maintenance_message:
          configMap.maintenance_message || "System is currently under maintenance. Please check back later.",
      })
    } catch (error) {
      console.error("Error fetching system config:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSystemConfig = async () => {
    setSaving(true)
    try {
      const updates = [
        { config_key: "paywall_enabled", config_value: config.paywall_enabled.toString() },
        { config_key: "max_targets_free", config_value: config.max_targets_free.toString() },
        { config_key: "max_targets_basic", config_value: config.max_targets_basic.toString() },
        { config_key: "max_targets_pro", config_value: config.max_targets_pro.toString() },
        { config_key: "max_targets_enterprise", config_value: config.max_targets_enterprise.toString() },
        { config_key: "telegram_scan_interval", config_value: config.telegram_scan_interval.toString() },
        { config_key: "email_alerts_enabled", config_value: config.email_alerts_enabled.toString() },
        { config_key: "maintenance_mode", config_value: config.maintenance_mode.toString() },
        { config_key: "maintenance_message", config_value: config.maintenance_message },
      ]

      for (const update of updates) {
        const { error } = await supabase.from("system_config").upsert({
          ...update,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Log admin action
      await supabase.rpc("log_admin_action", {
        p_action: "update_system_settings",
        p_resource_type: "system_config",
        p_details: config,
      })

      toast({
        title: "Success",
        description: "System configuration updated successfully",
      })
    } catch (error) {
      console.error("Error saving system config:", error)
      toast({
        title: "Error",
        description: "Failed to save system configuration",
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
              {Array.from({ length: 5 }).map((_, i) => (
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
            <h1 className="text-3xl font-bold mb-2">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and features</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={fetchSystemConfig}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={saveSystemConfig} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Paywall</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable payment requirements for premium features
                  </div>
                </div>
                <Switch
                  checked={config.paywall_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, paywall_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Alerts</Label>
                  <div className="text-sm text-muted-foreground">Enable system-wide email alert functionality</div>
                </div>
                <Switch
                  checked={config.email_alerts_enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, email_alerts_enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram_interval">Telegram Scan Interval (seconds)</Label>
                <Input
                  id="telegram_interval"
                  type="number"
                  value={config.telegram_scan_interval}
                  onChange={(e) => setConfig({ ...config, telegram_scan_interval: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  placeholder="System is currently under maintenance. Please check back later."
                  value={config.maintenance_message}
                  onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable maintenance mode to prevent access to the system
                  </div>
                </div>
                <Switch
                  checked={config.maintenance_mode}
                  onCheckedChange={(checked) => setConfig({ ...config, maintenance_mode: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_targets_free">Max Targets (Free)</Label>
                <Input
                  id="max_targets_free"
                  type="number"
                  value={config.max_targets_free}
                  onChange={(e) => setConfig({ ...config, max_targets_free: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_targets_basic">Max Targets (Basic)</Label>
                <Input
                  id="max_targets_basic"
                  type="number"
                  value={config.max_targets_basic}
                  onChange={(e) => setConfig({ ...config, max_targets_basic: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_targets_pro">Max Targets (Pro)</Label>
                <Input
                  id="max_targets_pro"
                  type="number"
                  value={config.max_targets_pro}
                  onChange={(e) => setConfig({ ...config, max_targets_pro: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_targets_enterprise">Max Targets (Enterprise)</Label>
                <Input
                  id="max_targets_enterprise"
                  type="number"
                  value={config.max_targets_enterprise}
                  onChange={(e) => setConfig({ ...config, max_targets_enterprise: Number.parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
