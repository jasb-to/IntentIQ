import { NextResponse } from "next/server"

// Simulated threat data that updates in real-time
const threatTypes = [
  "SQL Injection Attempt",
  "XSS Attack",
  "DDoS Attack",
  "Brute Force Login",
  "Malware Detection",
  "Suspicious API Access",
  "Data Exfiltration Attempt",
  "Unauthorized Access",
  "Port Scanning",
  "Phishing Attempt",
]

const generateRandomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

const generateThreat = () => {
  const severities = ["low", "medium", "high", "critical"]
  const severity = severities[Math.floor(Math.random() * severities.length)]

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: threatTypes[Math.floor(Math.random() * threatTypes.length)],
    sourceIp: generateRandomIP(),
    severity,
    timestamp: new Date().toISOString(),
    type: "Network Security",
    blocked: Math.random() > 0.3, // 70% chance of being blocked
  }
}

export async function GET() {
  try {
    // Generate 5-10 random threats
    const threatCount = Math.floor(Math.random() * 6) + 5
    const threats = Array.from({ length: threatCount }, generateThreat)

    // Sort by severity (critical first)
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    threats.sort(
      (a, b) =>
        severityOrder[b.severity as keyof typeof severityOrder] -
        severityOrder[a.severity as keyof typeof severityOrder],
    )

    return NextResponse.json({
      threats,
      timestamp: new Date().toISOString(),
      totalThreats: threats.length,
      blockedThreats: threats.filter((t) => t.blocked).length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch threats" }, { status: 500 })
  }
}
