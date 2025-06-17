"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { TrendingUp, Users, CreditCard, Target, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  userGrowth: { date: string; users: number; newUsers: number }[]
  revenueData: { date: string; revenue: number; subscribers: number }[]
  targetStats: { type: string; count: number }[]
  alertStats: { severity: string; count: number }[]
  topCompanies: { company: string; users: number; revenue: number }[]
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    targetStats: [],
    alertStats: [],
    topCompanies: [],
  })
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch user growth data
      const { data: users, error: usersError } = await supabase
        .from("user_profiles")
        .select("created_at, subscription_tier, subscription_status, company_name")

      if (usersError) throw usersError

      // Fetch targets data
      const { data: targets, error: targetsError } = await supabase
        .from("monitoring_targets")
        .select("target_type, created_at")

      if (targetsError) throw targetsError

      // Fetch alerts data
      const { data: alerts, error: alertsError } = await supabase.from("alerts").select("severity, created_at")

      if (alertsError) throw alertsError

      // Process data for charts
      const processedData = processAnalyticsData(users || [], targets || [], alerts || [])
      setData(processedData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (users: any[], targets: any[], alerts: any[]): AnalyticsData => {
    // Generate user growth data for the last 30 days
    const userGrowth = []
    const revenueData = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const usersUpToDate = users.filter((u) => new Date(u.created_at) <= date).length
      const newUsersOnDate = users.filter((u) => new Date(u.created_at).toDateString() === date.toDateString()).length

      const subscribersUpToDate = users.filter(
        (u) => new Date(u.created_at) <= date && u.subscription_tier !== "none" && u.subscription_status === "active",
      ).length

      userGrowth.push({
        date: dateStr,
        users: usersUpToDate,
        newUsers: newUsersOnDate,
      })

      revenueData.push({
        date: dateStr,
        revenue: subscribersUpToDate * 29, // Simplified calculation
        subscribers: subscribersUpToDate,
      })
    }

    // Process target stats
    const targetStats = targets.reduce((acc: any[], target) => {
      const existing = acc.find((item) => item.type === target.target_type)
      if (existing) {
        existing.count++
      } else {
        acc.push({ type: target.target_type, count: 1 })
      }
      return acc
    }, [])

    // Process alert stats
    const alertStats = alerts.reduce((acc: any[], alert) => {
      const existing = acc.find((item) => item.severity === alert.severity)
      if (existing) {
        existing.count++
      } else {
        acc.push({ severity: alert.severity, count: 1 })
      }
      return acc
    }, [])

    // Process top companies
    const companyStats = users.reduce((acc: any, user) => {
      if (user.company_name) {
        if (!acc[user.company_name]) {
          acc[user.company_name] = { users: 0, revenue: 0 }
        }
        acc[user.company_name].users++
        if (user.subscription_tier !== "none" && user.subscription_status === "active") {
          acc[user.company_name].revenue += 29
        }
      }
      return acc
    }, {})

    const topCompanies = Object.entries(companyStats)
      .map(([company, stats]: [string, any]) => ({
        company,
        users: stats.users,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      userGrowth,
      revenueData,
      targetStats,
      alertStats,
      topCompanies,
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalUsers = data.userGrowth[data.userGrowth.length - 1]?.users || 0
  const totalRevenue = data.revenueData[data.revenueData.length - 1]?.revenue || 0
  const totalTargets = data.targetStats.reduce((sum, stat) => sum + stat.count, 0)
  const totalAlerts = data.alertStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Detailed system analytics and performance metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{data.userGrowth.slice(-7).reduce((sum, day) => sum + day.newUsers, 0)} this week
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                {data.revenueData[data.revenueData.length - 1]?.subscribers || 0} active subscribers
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monitoring Targets</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTargets}</div>
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlerts}</div>
              <p className="text-xs text-muted-foreground">Security alerts generated</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Daily user registrations and total users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">User Growth Chart</p>
                  <p className="text-sm text-muted-foreground">{data.userGrowth.length} data points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly recurring revenue and subscriber count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Revenue Chart</p>
                  <p className="text-sm text-muted-foreground">£{totalRevenue} total revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Types */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Target Types</CardTitle>
              <CardDescription>Distribution of monitoring target types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.targetStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="capitalize">{stat.type}</span>
                    </div>
                    <Badge variant="outline">{stat.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Top Companies</CardTitle>
              <CardDescription>Companies by user count and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCompanies.slice(0, 5).map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{company.company}</p>
                      <p className="text-sm text-muted-foreground">{company.users} users</p>
                    </div>
                    <Badge variant="outline">£{company.revenue}</Badge>
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
