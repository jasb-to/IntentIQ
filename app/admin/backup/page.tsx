"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Database, Download, Upload, RefreshCw, Clock, Shield, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BackupRecord {
  id: string
  backup_type: "full" | "incremental" | "manual"
  status: "completed" | "in_progress" | "failed"
  file_size: number
  created_at: string
  completed_at?: string
  error_message?: string
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const { toast } = useToast()

  const [backupSettings, setBackupSettings] = useState({
    auto_backup_enabled: true,
    backup_frequency: "daily",
    retention_days: 30,
    include_user_data: true,
    include_system_config: true,
    include_audit_logs: true,
  })

  const [stats, setStats] = useState({
    totalBackups: 0,
    lastBackup: null as string | null,
    totalSize: 0,
    successRate: 0,
  })

  useEffect(() => {
    fetchBackups()
    fetchBackupSettings()
  }, [])

  const fetchBackups = async () => {
    try {
      // Mock backup data - in a real app, this would come from your backup system
      const mockBackups: BackupRecord[] = [
        {
          id: "1",
          backup_type: "full",
          status: "completed",
          file_size: 1024 * 1024 * 150, // 150MB
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          backup_type: "incremental",
          status: "completed",
          file_size: 1024 * 1024 * 25, // 25MB
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 12 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          backup_type: "manual",
          status: "in_progress",
          file_size: 0,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ]

      setBackups(mockBackups)
      calculateStats(mockBackups)
    } catch (error) {
      console.error("Error fetching backups:", error)
      toast({
        title: "Error",
        description: "Failed to fetch backup records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBackupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_config")
        .select("config_key, config_value")
        .in("config_key", [
          "auto_backup_enabled",
          "backup_frequency",
          "retention_days",
          "include_user_data",
          "include_system_config",
          "include_audit_logs",
        ])

      if (error) throw error

      const settings =
        data?.reduce(
          (acc, item) => {
            acc[item.config_key] = item.config_value
            return acc
          },
          {} as Record<string, string>,
        ) || {}

      setBackupSettings({
        auto_backup_enabled: settings.auto_backup_enabled === "true",
        backup_frequency: settings.backup_frequency || "daily",
        retention_days: Number.parseInt(settings.retention_days) || 30,
        include_user_data: settings.include_user_data !== "false",
        include_system_config: settings.include_system_config !== "false",
        include_audit_logs: settings.include_audit_logs !== "false",
      })
    } catch (error) {
      console.error("Error fetching backup settings:", error)
    }
  }

  const calculateStats = (backupData: BackupRecord[]) => {
    const completed = backupData.filter((b) => b.status === "completed")
    const totalSize = completed.reduce((sum, b) => sum + b.file_size, 0)
    const successRate = backupData.length > 0 ? (completed.length / backupData.length) * 100 : 0
    const lastBackup = completed.length > 0 ? completed[0].completed_at : null

    setStats({
      totalBackups: backupData.length,
      lastBackup,
      totalSize,
      successRate,
    })
  }

  const createBackup = async (type: "full" | "incremental" | "manual") => {
    setCreating(true)
    try {
      // In a real implementation, this would trigger your backup system
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        backup_type: type,
        status: "in_progress",
        file_size: 0,
        created_at: new Date().toISOString(),
      }

      setBackups([newBackup, ...backups])

      // Simulate backup completion
      setTimeout(() => {
        const completedBackup = {
          ...newBackup,
          status: "completed" as const,
          file_size: Math.floor(Math.random() * 200 * 1024 * 1024), // Random size up to 200MB
          completed_at: new Date().toISOString(),
        }

        setBackups((prev) => prev.map((b) => (b.id === newBackup.id ? completedBackup : b)))
        calculateStats([completedBackup, ...backups])

        toast({
          title: "Success",
          description: `${type} backup completed successfully`,
        })
      }, 3000)

      toast({
        title: "Backup Started",
        description: `${type} backup is now in progress`,
      })
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const saveBackupSettings = async () => {
    try {
      const updates = [
        { config_key: "auto_backup_enabled", config_value: backupSettings.auto_backup_enabled.toString() },
        { config_key: "backup_frequency", config_value: backupSettings.backup_frequency },
        { config_key: "retention_days", config_value: backupSettings.retention_days.toString() },
        { config_key: "include_user_data", config_value: backupSettings.include_user_data.toString() },
        { config_key: "include_system_config", config_value: backupSettings.include_system_config.toString() },
        { config_key: "include_audit_logs", config_value: backupSettings.include_audit_logs.toString() },
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
        description: "Backup settings updated successfully",
      })
    } catch (error) {
      console.error("Error saving backup settings:", error)
      toast({
        title: "Error",
        description: "Failed to save backup settings",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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
            <h1 className="text-3xl font-bold mb-2">Backup & Restore</h1>
            <p className="text-muted-foreground">Manage system backups and data recovery</p>
          </div>
          <Button variant="outline" onClick={fetchBackups}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleTimeString() : "No backups"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
              <p className="text-xs text-muted-foreground">Storage used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Backup reliability</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backup Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Create Backup
                </CardTitle>
                <CardDescription>Create a new backup of your system data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button onClick={() => createBackup("full")} disabled={creating} className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    Full Backup
                  </Button>
                  <Button
                    onClick={() => createBackup("incremental")}
                    disabled={creating}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Incremental Backup
                  </Button>
                  <Button
                    onClick={() => createBackup("manual")}
                    disabled={creating}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Manual Backup
                  </Button>
                </div>

                {creating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Creating backup...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>Configure automatic backup preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_backup"
                    checked={backupSettings.auto_backup_enabled}
                    onCheckedChange={(checked) =>
                      setBackupSettings({ ...backupSettings, auto_backup_enabled: checked })
                    }
                  />
                  <Label htmlFor="auto_backup">Enable automatic backups</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Backup Frequency</Label>
                  <Select
                    value={backupSettings.backup_frequency}
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, backup_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Retention Period (days)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={backupSettings.retention_days}
                    onChange={(e) =>
                      setBackupSettings({ ...backupSettings, retention_days: Number.parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Include in Backup:</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include_user_data"
                        checked={backupSettings.include_user_data}
                        onCheckedChange={(checked) =>
                          setBackupSettings({ ...backupSettings, include_user_data: checked })
                        }
                      />
                      <Label htmlFor="include_user_data">User Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include_system_config"
                        checked={backupSettings.include_system_config}
                        onCheckedChange={(checked) =>
                          setBackupSettings({ ...backupSettings, include_system_config: checked })
                        }
                      />
                      <Label htmlFor="include_system_config">System Configuration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include_audit_logs"
                        checked={backupSettings.include_audit_logs}
                        onCheckedChange={(checked) =>
                          setBackupSettings({ ...backupSettings, include_audit_logs: checked })
                        }
                      />
                      <Label htmlFor="include_audit_logs">Audit Logs</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={saveBackupSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Recent backup records and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium capitalize">{backup.backup_type} Backup</span>
                      </div>
                      {getStatusBadge(backup.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Created: {new Date(backup.created_at).toLocaleString()}</div>
                      {backup.completed_at && <div>Completed: {new Date(backup.completed_at).toLocaleString()}</div>}
                      {backup.file_size > 0 && <div>Size: {formatFileSize(backup.file_size)}</div>}
                      {backup.error_message && (
                        <div className="text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {backup.error_message}
                        </div>
                      )}
                    </div>
                    {backup.status === "completed" && (
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    )}
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
