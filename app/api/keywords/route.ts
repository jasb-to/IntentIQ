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

    const { data: keywords, error } = await supabase
      .from("user_keywords")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      keywords: keywords || [],
    })
  } catch (error) {
    console.error("Get keywords error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { keyword, category = "general" } = body

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    // Check user's keyword limit
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const limits = {
      free: 10,
      starter: 50,
      pro: 200,
      enterprise: 1000,
    }

    const userLimit = limits[profile?.subscription_tier as keyof typeof limits] || limits.free

    const { count } = await supabase
      .from("user_keywords")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) >= userLimit) {
      return NextResponse.json(
        {
          error: `Keyword limit reached. Limit: ${userLimit}`,
        },
        { status: 400 },
      )
    }

    const { data: newKeyword, error } = await supabase
      .from("user_keywords")
      .insert({
        user_id: user.id,
        keyword: keyword.trim(),
        category,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Keyword already exists" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      keyword: newKeyword,
    })
  } catch (error) {
    console.error("Create keyword error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, keyword, category, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (keyword !== undefined) updateData.keyword = keyword.trim()
    if (category !== undefined) updateData.category = category
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: updatedKeyword, error } = await supabase
      .from("user_keywords")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!updatedKeyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      keyword: updatedKeyword,
    })
  } catch (error) {
    console.error("Update keyword error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("user_keywords").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Keyword deleted successfully",
    })
  } catch (error) {
    console.error("Delete keyword error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
