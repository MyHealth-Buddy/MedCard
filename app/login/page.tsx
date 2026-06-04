'use client'

import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  // Initialize the Supabase client we just built
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    // This triggers the Google popup/redirect
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Supabase exactly where to send the user after Google approves them.
        // We use window.location.origin so it dynamically works on localhost now, and your real domain later.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <button
        onClick={handleGoogleLogin}
        className="rounded-md bg-white px-6 py-3 text-black font-semibold hover:bg-gray-200 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  )
}