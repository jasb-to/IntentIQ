"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Zap, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface ThreatCardProps {
  threat: {
    id: string
    name: string
    source_ip: string
    severity: "low" | "medium" | "high" | "critical"
    timestamp: string
    type: string
    blocked: boolean
  }
  index: number
}

export function ThreatCard({ threat, index }: ThreatCardProps) {
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
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <Zap className="h-4 w-4" />
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getCardGlow = (severity: string) => {
    switch (severity) {
      case "low":
        return "shadow-glow-green"
      case "medium":
        return "shadow-glow"
      case "high":
        return "shadow-glow-blue"
      case "critical":
        return "shadow-glow-red"
      default:
        return "shadow-glow"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className={`${getCardGlow(threat.severity)} border-border/50 hover:border-primary/50 transition-all duration-300`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{threat.name}</CardTitle>
            <Badge className={`${getSeverityColor(threat.severity)} flex items-center gap-1`}>
              {getSeverityIcon(threat.severity)}
              {threat.severity.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Source IP:</span>
            <span className="font-mono">{threat.source_ip}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span>{threat.type}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={threat.blocked ? "destructive" : "secondary"}>
              {threat.blocked ? "Blocked" : "Monitoring"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Clock className="h-3 w-3" />
            {new Date(threat.timestamp).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
