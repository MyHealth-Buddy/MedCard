"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const supabase = createClient()

  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)
      }
    }

    loadSession()

    const { data: { subscription } = {} as any } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    }) as any

    return () => {
      mounted = false
      try {
        subscription?.unsubscribe()
      } catch {}
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to MedCard</h1>

      {!session ? (
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors"
        >
          Go to Login Page
        </Link>
      ) : (
        <div className="bg-zinc-800 p-6 rounded-md text-center">
          <p className="mb-2">You're signed in as <strong>{user?.email ?? 'Unknown'}</strong></p>
          <p className="mb-4">Extra info: welcome back — you can now access MedCard features.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSignOut}
              className="rounded-md bg-red-600 px-6 py-3 font-semibold hover:bg-red-500 transition-colors"
            >
              Sign out
            </button>
            <Link
              href="/"
              className="rounded-md bg-green-600 px-6 py-3 font-semibold hover:bg-green-500 transition-colors"
            >
              Stay on this page
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}