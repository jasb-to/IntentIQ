"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { Shield, Download, RefreshCw, Search, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  id: string
  user_id: string
  user_email?: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterResource, setFilterResource] = useState("all")
  const [dateRange, setDateRange] = useState("7d")
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueUsers: 0,
    criticalActions: 0,
    todayLogs: 0,
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [dateRange])

  useEffect(() => {
    filterLogs()
  }, [auditLogs, searchTerm, filterAction, filterResource])

  const fetchAuditLogs = async () => {
    try {
      // Calculate date filter
      const daysAgo = Number.parseInt(dateRange.replace("d", ""))
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          user_profiles!inner(email)
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000)

      if (error) throw error

      const processedLogs =
        logs?.map((log: any) => ({
          ...log,
          user_email: log.user_profiles?.email || "Unknown",
        })) || []

      setAuditLogs(processedLogs)
      calculateStats(processedLogs)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: AuditLog[]) => {
    const today = new Date().toDateString()
    const todayLogs = logs.filter((log) => new Date(log.created_at).toDateString() === today).length
    const uniqueUsers = new Set(logs.map((log) => log.user_id)).size
    const criticalActions = logs.filter((log) =>
      ["delete_user", "update_system_config", "deactivate_user", "admin_login"].includes(log.action),
    ).length

    setStats({
      totalLogs: logs.length,
      uniqueUsers,
      criticalActions,
      todayLogs,
    })
  }

  const filterLogs = () => {
    let filtered = auditLogs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction)
    }

    if (filterResource !== "all") {
      filtered = filtered.filter((log) => log.resource_type === filterResource)
    }

    setFilteredLogs(filtered)
  }

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Resource Type", "Resource ID", "IP Address"],
      ...filteredLogs.map((log) => [
        new Date(log.created_at).toISOString(),
        log.user_email || "Unknown",
        log.action,
        log.resource_type || "",
        log.resource_id || "",
        log.ip_address || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getActionBadge = (action: string) => {
    const criticalActions = ["delete_user", "update_system_config", "deactivate_user"]
    const warningActions = ["admin_login", "password_reset", "role_change"]

    if (criticalActions.includes(action)) {
      return <Badge variant="destructive">Critical</Badge>
    }
    if (warningActions.includes(action)) {
      return <Badge variant="secondary">Warning</Badge>
    }
    return <Badge variant="outline">Info</Badge>
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
            <p className="text-muted-foreground">Monitor system activity and security events</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAuditLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <p className="text-xs text-muted-foreground">Last {dateRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Unique users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Actions</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.criticalActions}</div>
              <p className="text-xs text-muted-foreground">High-risk activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayLogs}</div>
              <p className="text-xs text-muted-foreground">Actions today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create_user">Create User</SelectItem>
                  <SelectItem value="update_user">Update User</SelectItem>
                  <SelectItem value="delete_user">Delete User</SelectItem>
                  <SelectItem value="update_system_config">System Config</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterResource} onValueChange={setFilterResource}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system_config">System Config</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail ({filteredLogs.length})</CardTitle>
            <CardDescription>Detailed log of all system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(log.created_at).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{log.user_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.action.replace(/_/g, " ")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm capitalize">{log.resource_type || "N/A"}</div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{log.ip_address || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
