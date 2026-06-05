"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import UserQRCode from './components/UserQRCode'

export default function Home() {
  const supabase = createClient()

  const [session, setSession] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [sharedUid, setSharedUid] = useState<string | null>(null)

  useEffect(() => {
    // check for a shared uid in the URL (e.g. ?uid=USER_UID)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const uidFromQuery = params.get('uid')
      if (uidFromQuery) setSharedUid(uidFromQuery)
    }

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

      {sharedUid ? (
        <div className="bg-zinc-800 p-6 rounded-md text-center">
          <p className="mb-2">Viewing shared MedCard for <strong>{sharedUid}</strong></p>
          <p className="mb-4">This is a public view — no login required.</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors"
            >
              Sign in to manage
            </Link>
            <a
              href={`https://med-card-one.vercel.app/?uid=${encodeURIComponent(sharedUid)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-green-600 px-6 py-3 font-semibold hover:bg-green-500 transition-colors"
            >
              Open share link
            </a>
          </div>
        </div>
      ) : !session ? (
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors"
        >
          Go to Login Page
        </Link>
      ) : (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-6">

          {/* Header & Value Prop */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">Your Emergency Digital Medical ID</h1>
            <p className="text-sm text-slate-300 px-2">
              Scan this QR code to instantly view critical medical details in an emergency.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl max-w-[220px] mx-auto shadow-md">
            {user?.id && <UserQRCode uid={user.id} size={176} />}
          </div>

          <button
            onClick={async () => {
              try {
                const shareUrl = `https://med-card-one.vercel.app/?uid=${encodeURIComponent(user?.id ?? '')}`
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              } catch (err) {
                console.error('Failed to copy share link', err)
              }
            }}
            className="text-xs text-sky-400 hover:underline font-medium"
          >
            {copied ? 'Copied!' : 'Copy public share link'}
          </button>

          <hr className="border-slate-800" />

          {/* Instructions Section */}
          <div className="text-left space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">How to use:</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Print & Attach:</strong> Keep it on your phone cover, school bag, or motorcycle keychain.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Instant Scan:</strong> Anyone can scan it to view your medical profile during a crisis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Faster Treatment:</strong> Helps bystanders and doctors give you accurate care quickly.</span>
              </li>
            </ul>
          </div>

          {/* New Option A Profile Management Section */}
          <div className="pt-5 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400 px-4 leading-relaxed">
              Set up your emergency contact numbers, medical history, and allergies so doctors can help you faster.
            </p>
            <a
              href={`https://med-card-one.vercel.app/?uid=${encodeURIComponent(user?.id ?? '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-sm"
            >
              Create or Edit Your Profile
            </a>
          </div>

        </div>
      )}
    </div>
  )
}