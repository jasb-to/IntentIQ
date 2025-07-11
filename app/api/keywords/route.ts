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

    console.log("🔍 Fetching keywords for user:", user.id)

    const { data: keywords, error } = await supabase
      .from("user_keywords")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching keywords:", error)
      throw error
    }

    return NextResponse.json({
      keywords: keywords || [],
      total: keywords?.length || 0,
    })
  } catch (error: any) {
    console.error("❌ Error fetching keywords:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch keywords",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { keyword, category } = body

    if (!keyword) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 })
    }

    console.log("💾 Saving keyword for user:", user.id)

    // Check if keyword already exists
    const { data: existing } = await supabase
      .from("user_keywords")
      .select("id")
      .eq("user_id", user.id)
      .eq("keyword", keyword.trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: "Keyword already exists" }, { status: 409 })
    }

    // Save keyword
    const { data, error } = await supabase
      .from("user_keywords")
      .insert([
        {
          user_id: user.id,
          keyword: keyword.trim(),
          category: category || "general",
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving keyword:", error)
      throw error
    }

    return NextResponse.json({
      keyword: data,
      message: "Keyword saved successfully",
    })
  } catch (error: any) {
    console.error("❌ Error saving keyword:", error)
    return NextResponse.json(
      {
        error: "Failed to save keyword",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const keywordId = searchParams.get("id")

    if (!keywordId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    console.log("🗑️ Deleting keyword:", keywordId)

    const { error } = await supabase.from("user_keywords").delete().eq("id", keywordId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting keyword:", error)
      throw error
    }

    return NextResponse.json({
      message: "Keyword deleted successfully",
    })
  } catch (error: any) {
    console.error("❌ Error deleting keyword:", error)
    return NextResponse.json(
      {
        error: "Failed to delete keyword",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
