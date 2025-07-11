import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv" // csv, json
    const type = searchParams.get("type") || "saved_leads" // saved_leads, searches, keywords

    console.log(`📤 Exporting ${type} as ${format} for user ${user.id}`)

    let data: any[] = []
    let filename = ""

    if (type === "saved_leads") {
      const { data: leads, error } = await supabase
        .from("saved_leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      data = leads || []
      filename = `intentiq-saved-leads-${new Date().toISOString().split("T")[0]}`
    }

    if (type === "searches") {
      const { data: searches, error } = await supabase
        .from("lead_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      data = searches || []
      filename = `intentiq-searches-${new Date().toISOString().split("T")[0]}`
    }

    if (type === "keywords") {
      const { data: keywords, error } = await supabase
        .from("user_keywords")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      data = keywords || []
      filename = `intentiq-keywords-${new Date().toISOString().split("T")[0]}`
    }

    if (format === "csv") {
      if (data.length === 0) {
        return new NextResponse("No data to export", { status: 404 })
      }

      // Convert to CSV
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              if (value === null || value === undefined) return ""
              if (typeof value === "object") return JSON.stringify(value)
              if (typeof value === "string" && value.includes(",")) return `"${value}"`
              return value
            })
            .join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    if (format === "json") {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error: any) {
    console.error("❌ Error exporting data:", error)
    return NextResponse.json(
      {
        error: "Failed to export data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
