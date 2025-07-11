import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authorization.replace("Bearer ", ""))

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "csv"
    const type = url.searchParams.get("type") || "leads"
    const intent_score = url.searchParams.get("intent_score")
    const days = Number.parseInt(url.searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let data: any[] = []
    let filename = ""

    if (type === "leads") {
      let query = supabase
        .from("saved_leads")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())

      if (intent_score) {
        query = query.eq("intent_score", intent_score)
      }

      const { data: leads, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      data = leads || []
      filename = `intentiq-leads-${new Date().toISOString().split("T")[0]}`
    } else if (type === "searches") {
      const { data: searches, error } = await supabase
        .from("lead_searches")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      data = searches || []
      filename = `intentiq-searches-${new Date().toISOString().split("T")[0]}`
    }

    if (format === "csv") {
      // Convert to CSV
      if (data.length === 0) {
        return new Response("No data to export", {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}.csv"`,
          },
        })
      }

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              if (value === null || value === undefined) return ""
              if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""')
              return `"${String(value).replace(/"/g, '""')}"`
            })
            .join(","),
        ),
      ].join("\n")

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      // Return JSON
      return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
