"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { CreditCard, DollarSign, TrendingUp, Users, RefreshCw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BillingData {
  id: string
  user_email: string
  user_name: string
  subscription_tier: string
  subscription_status: string
  amount: number
  currency: string
  billing_cycle: string
  next_billing_date: string
  created_at: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export default function BillingManagement() {
  const [billingData, setBillingData] = useState<BillingData[]>([])
  const [filteredData, setFilteredData] = useState<BillingData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTier, setFilterTier] = useState("all")
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    avgRevenuePerUser: 0,
  })

  useEffect(() => {
    fetchBillingData()
  }, [])

  useEffect(() => {
    filterData()
  }, [billingData, searchTerm, filterStatus, filterTier])

  const fetchBillingData = async () => {
    try {
      const { data: users, error } = await supabase.from("user_profiles").select("*").neq("subscription_tier", "none")

      if (error) throw error

      // Transform user data to billing format
      const billing =
        users?.map((user) => ({
          id: user.id,
          user_email: user.email,
          user_name: user.full_name || "N/A",
          subscription_tier: user.subscription_tier,
          subscription_status: user.subscription_status,
          amount: getTierPrice(user.subscription_tier),
          currency: "GBP",
          billing_cycle: "monthly",
          next_billing_date: getNextBillingDate(user.created_at),
          created_at: user.created_at,
          stripe_customer_id: user.stripe_customer_id,
          stripe_subscription_id: user.stripe_subscription_id,
        })) || []

      setBillingData(billing)
      calculateStats(billing)
    } catch (error) {
      console.error("Error fetching billing data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch billing data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTierPrice = (tier: string) => {
    const prices = { basic: 29, pro: 99, enterprise: 299 }
    return prices[tier as keyof typeof prices] || 0
  }

  const getNextBillingDate = (createdAt: string) => {
    const date = new Date(createdAt)
    date.setMonth(date.getMonth() + 1)
    return date.toISOString()
  }

  const calculateStats = (data: BillingData[]) => {
    const activeSubscriptions = data.filter((d) => d.subscription_status === "active").length
    const totalRevenue = data.reduce((sum, d) => sum + (d.subscription_status === "active" ? d.amount : 0), 0)
    const monthlyRevenue = totalRevenue
    const avgRevenuePerUser = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0

    setStats({
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      churnRate: 5.2, // Mock data
      avgRevenuePerUser,
    })
  }

  const filterData = () => {
    let filtered = billingData

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.subscription_status === filterStatus)
    }

    if (filterTier !== "all") {
      filtered = filtered.filter((item) => item.subscription_tier === filterTier)
    }

    setFilteredData(filtered)
  }

  const exportBillingData = () => {
    const csv = [
      ["Email", "Name", "Tier", "Status", "Amount", "Currency", "Next Billing", "Created"],
      ...filteredData.map((item) => [
        item.user_email,
        item.user_name,
        item.subscription_tier,
        item.subscription_status,
        item.amount,
        item.currency,
        new Date(item.next_billing_date).toLocaleDateString(),
        new Date(item.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `billing-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
            <h1 className="text-3xl font-bold mb-2">Billing Management</h1>
            <p className="text-muted-foreground">Manage subscriptions, payments, and revenue</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={fetchBillingData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportBillingData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Paying customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.avgRevenuePerUser.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Average revenue per user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.churnRate}%</div>
              <p className="text-xs text-muted-foreground">Monthly churn</p>
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
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Billing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Records ({filteredData.length})</CardTitle>
            <CardDescription>Manage customer subscriptions and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.user_name}</div>
                          <div className="text-sm text-muted-foreground">{item.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          £{item.amount}/{item.billing_cycle}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.subscription_status === "active" ? "default" : "destructive"}>
                          {item.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.next_billing_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
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
