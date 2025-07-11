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
    const filter = searchParams.get("filter") || "all" // all, contacted, uncontacted
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log(`📋 Fetching saved leads for user ${user.id} (filter: ${filter})`)

    let query = supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (filter === "contacted") {
      query = query.eq("is_contacted", true)
    } else if (filter === "uncontacted") {
      query = query.eq("is_contacted", false)
    }

    const { data: savedLeads, error } = await query

    if (error) {
      console.error("Error fetching saved leads:", error)
      throw error
    }

    return NextResponse.json({
      leads: savedLeads || [],
      total: savedLeads?.length || 0,
      filter,
    })
  } catch (error: any) {
    console.error("❌ Error fetching saved leads:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch saved leads",
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
    const { platform, external_id, content, author, url, intent_score, keywords, metadata, notes } = body

    if (!platform || !external_id || !content) {
      return NextResponse.json(
        {
          error: "platform, external_id, and content are required",
        },
        { status: 400 },
      )
    }

    console.log(`💾 Saving lead for user ${user.id}:`, external_id)

    const { data, error } = await supabase
      .from("saved_leads")
      .upsert([
        {
          user_id: user.id,
          platform,
          external_id,
          content,
          author,
          url,
          intent_score,
          keywords,
          metadata,
          notes,
          is_contacted: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving lead:", error)
      throw error
    }

    return NextResponse.json({
      lead: data,
      message: "Lead saved successfully",
    })
  } catch (error: any) {
    console.error("❌ Error saving lead:", error)
    return NextResponse.json(
      {
        error: "Failed to save lead",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, is_contacted, notes } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    console.log(`📝 Updating lead ${id} for user ${user.id}`)

    const updateData: any = {}
    if (typeof is_contacted === "boolean") {
      updateData.is_contacted = is_contacted
      if (is_contacted) {
        updateData.contacted_at = new Date().toISOString()
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { data, error } = await supabase
      .from("saved_leads")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating lead:", error)
      throw error
    }

    return NextResponse.json({
      lead: data,
      message: "Lead updated successfully",
    })
  } catch (error: any) {
    console.error("❌ Error updating lead:", error)
    return NextResponse.json(
      {
        error: "Failed to update lead",
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
    const leadId = searchParams.get("id")

    if (!leadId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    console.log(`🗑️ Deleting lead ${leadId} for user ${user.id}`)

    const { error } = await supabase.from("saved_leads").delete().eq("id", leadId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting lead:", error)
      throw error
    }

    return NextResponse.json({
      message: "Lead deleted successfully",
    })
  } catch (error: any) {
    console.error("❌ Error deleting lead:", error)
    return NextResponse.json(
      {
        error: "Failed to delete lead",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
