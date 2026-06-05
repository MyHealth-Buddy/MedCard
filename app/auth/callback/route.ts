import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // After a successful login we will always send the user to /qr
  const next = '/qr'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    // Exchange the secure code for a logged-in session
    const { data, error } =  await supabase.auth.exchangeCodeForSession(code)

    console.log("SESSION DATA:", data)
    console.log("AUTH ERROR:", error)
    
    if (!error) {
      // Success! Send them to the target page.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something fails or the code is missing, send them to an error page (or back to login)
  return NextResponse.redirect(`${origin}/login?error=CouldNotAuthenticate`)
}