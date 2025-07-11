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
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const intent_score = url.searchParams.get("intent_score")
    const is_contacted = url.searchParams.get("is_contacted")
    const platform = url.searchParams.get("platform")

    let query = supabase.from("saved_leads").select("*").eq("user_id", user.id)

    if (intent_score) {
      query = query.eq("intent_score", intent_score)
    }
    if (is_contacted !== null) {
      query = query.eq("is_contacted", is_contacted === "true")
    }
    if (platform) {
      query = query.eq("platform", platform)
    }

    const { data: leads, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
    })
  } catch (error) {
    console.error("Get saved leads error:", error)
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
    const { platform, external_id, content, author, url, intent_score, confidence, keywords, signals, metadata, tags } =
      body

    if (!platform || !external_id || !content || !intent_score) {
      return NextResponse.json(
        {
          error: "Platform, external_id, content, and intent_score are required",
        },
        { status: 400 },
      )
    }

    // Check user's saved leads limit
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()

    const limits = {
      free: 50,
      starter: 500,
      pro: 2000,
      enterprise: 10000,
    }

    const userLimit = limits[profile?.subscription_tier as keyof typeof limits] || limits.free

    const { count } = await supabase
      .from("saved_leads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count || 0) >= userLimit) {
      return NextResponse.json(
        {
          error: `Saved leads limit reached. Limit: ${userLimit}`,
        },
        { status: 400 },
      )
    }

    const { data: savedLead, error } = await supabase
      .from("saved_leads")
      .upsert(
        {
          user_id: user.id,
          platform,
          external_id,
          content,
          author,
          url,
          intent_score,
          confidence,
          keywords,
          signals,
          metadata,
          tags,
          is_contacted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,external_id",
        },
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      lead: savedLead,
    })
  } catch (error) {
    console.error("Save lead error:", error)
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
    const { id, is_contacted, notes, tags } = body

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (is_contacted !== undefined) {
      updateData.is_contacted = is_contacted
      if (is_contacted) {
        updateData.contacted_at = new Date().toISOString()
      }
    }
    if (notes !== undefined) updateData.notes = notes
    if (tags !== undefined) updateData.tags = tags

    const { data: updatedLead, error } = await supabase
      .from("saved_leads")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    })
  } catch (error) {
    console.error("Update lead error:", error)
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
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("saved_leads").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    })
  } catch (error) {
    console.error("Delete lead error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
