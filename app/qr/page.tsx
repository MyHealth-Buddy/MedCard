"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import UserQRCode from '../components/UserQRCode'

export default function QRPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (!user) {
        // If middleware missed them for any reason, fall back to client-side redirect
        router.push('/login')
        return
      }

      setUser(user)
    }

    load()

    return () => {
      mounted = false
    }
  }, [supabase, router])

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?uid=${encodeURIComponent(
    user?.id ?? ''
  )}`

  const handleShare = async () => {
    if (!shareUrl) return

    if ((navigator as any).share) {
      try {
        setSharing(true)
        await (navigator as any).share({
          title: 'Emergency Medical ID',
          text: 'Scan this QR code to view critical medical details',
          url: shareUrl,
        })
      } catch (err) {
        // user cancelled or failed
      } finally {
        setSharing(false)
      }
    } else {
      await handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-slate-900 rounded-2xl p-8 space-y-6">

          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">Your Emergency Digital Medical ID</h1>
            <p className="text-sm text-slate-300">Scan this QR code to instantly view critical medical details in an emergency.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl">
              {user?.id && <UserQRCode uid={user.id} size={220} />}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                {sharing ? 'Sharing…' : 'Share QR code'}
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors text-center"
              >
                Open share link
              </a>

              <button
                onClick={handleCopy}
                className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy public share link'}
              </button>
            </div>
          </div>

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

          <div className="pt-5 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400 px-4 leading-relaxed">Set up your emergency contact numbers, medical history, and allergies so doctors can help you faster.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-sm"
            >
              Create or Edit Your Profile
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
