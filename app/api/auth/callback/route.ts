import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { URL } from "url" // Declare the URL variable

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_callback_error`)
      }

      // Create user profile if it doesn't exist
      if (data.user) {
        const { error: profileError } = await supabase.from("user_profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || "",
            subscription_tier: "free",
            subscription_status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }
    }

    // Redirect to dashboard after successful auth
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=server_error`)
  }
}
