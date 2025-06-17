"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Trash2,
  Edit,
  Wallet,
  Globe,
  Mail,
  Code,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"

interface MonitoringTarget {
  id: string
  target_type: "wallet" | "domain" | "email" | "api"
  target_value: string
  target_name?: string
  target_description?: string
  is_active: boolean
  created_at: string
}

const TARGET_TYPES = [
  {
    value: "wallet",
    label: "Crypto Wallet",
    icon: Wallet,
    description: "Monitor wallet addresses for breach mentions",
  },
  { value: "domain", label: "Domain/URL", icon: Globe, description: "Track domain names and subdomains" },
  { value: "email", label: "Email Address", icon: Mail, description: "Monitor email addresses in breach data" },
  { value: "api", label: "API Endpoint", icon: Code, description: "Watch API endpoints and server identifiers" },
]

export default function MonitoringTargetsPage() {
  const router = useRouter()
  const { isSignedIn, user } = useAuth()
  const [targets, setTargets] = useState<MonitoringTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingTarget, setEditingTarget] = useState<MonitoringTarget | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    target_type: "domain" as const,
    target_value: "",
    target_name: "",
    target_description: "",
  })

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }
    fetchTargets()
  }, [isSignedIn, router])

  const fetchTargets = async () => {
    try {
      setError(null)

      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      console.log("Fetching targets for user:", user.id)

      const { data, error } = await supabase
        .from("monitoring_targets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error fetching targets:", error)
        throw error
      }

      console.log("Fetched targets:", data)
      setTargets(data || [])
    } catch (error: any) {
      console.error("Error in fetchTargets:", error)
      setError(`Failed to fetch targets: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to fetch monitoring targets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    if (!formData.target_value.trim()) {
      toast({
        title: "Error",
        description: "Target value is required",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const targetData = {
        user_id: user.id,
        target_type: formData.target_type,
        target_value: formData.target_value.trim(),
        target_name: formData.target_name.trim() || null,
        target_description: formData.target_description.trim() || null,
        is_active: true,
      }

      console.log("Submitting target data:", targetData)

      let result
      if (editingTarget) {
        result = await supabase
          .from("monitoring_targets")
          .update(targetData)
          .eq("id", editingTarget.id)
          .eq("user_id", user.id)
          .select()
      } else {
        result = await supabase.from("monitoring_targets").insert([targetData]).select()
      }

      if (result.error) {
        console.error("Supabase error:", result.error)
        throw result.error
      }

      console.log("Target saved successfully:", result.data)

      toast({
        title: "Success",
        description: editingTarget ? "Target updated successfully" : "Target added successfully",
      })

      // Reset form
      setFormData({
        target_type: "domain",
        target_value: "",
        target_name: "",
        target_description: "",
      })
      setEditingTarget(null)

      // Refresh targets list
      await fetchTargets()
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      const errorMessage = error.message || "Failed to save target. Please try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (targetId: string) => {
    if (!confirm("Are you sure you want to delete this monitoring target?")) return

    try {
      setError(null)
      const { error } = await supabase.from("monitoring_targets").delete().eq("id", targetId).eq("user_id", user?.id)

      if (error) {
        console.error("Error deleting target:", error)
        throw error
      }

      toast({ title: "Success", description: "Target deleted successfully" })
      fetchTargets()
    } catch (error: any) {
      console.error("Error in handleDelete:", error)
      toast({
        title: "Error",
        description: "Failed to delete target. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (target: MonitoringTarget) => {
    try {
      setError(null)
      const { error } = await supabase
        .from("monitoring_targets")
        .update({ is_active: !target.is_active })
        .eq("id", target.id)
        .eq("user_id", user?.id)

      if (error) {
        console.error("Error toggling target:", error)
        throw error
      }

      toast({
        title: "Success",
        description: `Target ${!target.is_active ? "activated" : "deactivated"}`,
      })
      fetchTargets()
    } catch (error: any) {
      console.error("Error in handleToggleActive:", error)
      toast({
        title: "Error",
        description: "Failed to update target status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (target: MonitoringTarget) => {
    setEditingTarget(target)
    setFormData({
      target_type: target.target_type,
      target_value: target.target_value,
      target_name: target.target_name || "",
      target_description: target.target_description || "",
    })

    // Switch to the add tab
    const addTab = document.querySelector('[value="add"]') as HTMLElement
    if (addTab) {
      addTab.click()
    }
  }

  const getTargetIcon = (type: string) => {
    const targetType = TARGET_TYPES.find((t) => t.value === type)
    return targetType?.icon || Shield
  }

  const getTargetTypeLabel = (type: string) => {
    const targetType = TARGET_TYPES.find((t) => t.value === type)
    return targetType?.label || type
  }

  const getPlaceholder = (type: string) => {
    switch (type) {
      case "wallet":
        return "0x1234567890abcdef1234567890abcdef12345678"
      case "domain":
        return "example.com or api.example.com"
      case "email":
        return "admin@example.com"
      case "api":
        return "api.example.com/v1 or server-identifier"
      default:
        return "Enter value to monitor"
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Monitoring Targets</h1>
            <p className="text-muted-foreground">Add and manage the assets you want to monitor for security threats</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          )}

          <Tabs defaultValue="targets" className="space-y-6">
            <TabsList>
              <TabsTrigger value="targets">My Targets ({targets.length})</TabsTrigger>
              <TabsTrigger value="add">Add New Target</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{editingTarget ? "Edit Target" : "Add New Monitoring Target"}</CardTitle>
                  <CardDescription>
                    Configure a new asset to monitor for security threats and breach mentions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="target_type">Target Type</Label>
                        <Select
                          value={formData.target_type}
                          onValueChange={(value: any) => setFormData({ ...formData, target_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TARGET_TYPES.map((type) => {
                              const Icon = type.icon
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {TARGET_TYPES.find((t) => t.value === formData.target_type)?.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target_name">Display Name (Optional)</Label>
                        <Input
                          id="target_name"
                          placeholder="My Main Website"
                          value={formData.target_name}
                          onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_value">Target Value *</Label>
                      <Input
                        id="target_value"
                        placeholder={getPlaceholder(formData.target_type)}
                        value={formData.target_value}
                        onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_description">Description (Optional)</Label>
                      <Textarea
                        id="target_description"
                        placeholder="Additional context about this target..."
                        value={formData.target_description}
                        onChange={(e) => setFormData({ ...formData, target_description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={isAdding}>
                        {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isAdding ? "Saving..." : editingTarget ? "Update Target" : "Add Target"}
                      </Button>
                      {editingTarget && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingTarget(null)
                            setFormData({
                              target_type: "domain",
                              target_value: "",
                              target_name: "",
                              target_description: "",
                            })
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="targets" className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
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
              ) : targets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Monitoring Targets</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by adding your first asset to monitor for security threats
                    </p>
                    <Button
                      onClick={() => {
                        const addTab = document.querySelector('[value="add"]') as HTMLElement
                        if (addTab) addTab.click()
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Target
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {targets.map((target) => {
                    const Icon = getTargetIcon(target.target_type)
                    return (
                      <Card key={target.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <div>
                                <CardTitle className="text-lg">{target.target_name || target.target_value}</CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {getTargetTypeLabel(target.target_type)}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(target)}
                              className="h-8 w-8"
                            >
                              {target.is_active ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Value:</p>
                            <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                              {target.target_value}
                            </p>
                          </div>

                          {target.target_description && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                              <p className="text-sm text-muted-foreground">{target.target_description}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              {target.is_active ? (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Paused
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(target)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(target.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
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
