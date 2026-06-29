'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [docCount, setDocCount] = useState<number | null>(null)
  const [contactCount, setContactCount] = useState<number | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileComplete, setProfileComplete] = useState({ profile: false, medical: false })

  useEffect(() => {
    // If someone lands here with ?uid= (old QR code links), redirect to the public view
    const params = new URLSearchParams(window.location.search)
    const uid = params.get('uid')
    if (uid) {
      router.replace(`/view?uid=${encodeURIComponent(uid)}`)
      return
    }

    async function loadStats() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Run all queries in parallel
      const [profileRes, medicalRes, contactsRes, docsRes] = await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
        supabase.from('medical_information').select('id').eq('user_id', user.id).maybeSingle(),
        supabase.from('emergency_contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('medical_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      setProfileName(profileRes.data?.full_name ?? null)
      setProfileComplete({
        profile: !!profileRes.data,
        medical: !!medicalRes.data,
      })
      setContactCount(contactsRes.count ?? 0)
      setDocCount(docsRes.count ?? 0)
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl p-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              {profileName ? `Hi, ${profileName.split(' ')[0]}` : 'MedCard Dashboard'}
            </h1>
            <p className="mt-2 text-zinc-400">Manage your emergency medical information</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="shrink-0 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-5 py-3 font-medium transition-colors text-sm"
          >
            View QR Code
          </button>
        </div>

        {/* Profile completeness warnings */}
        {(!profileComplete.profile || !profileComplete.medical || (contactCount ?? 0) === 0) && (
          <div className="mb-8 rounded-xl bg-amber-950 border border-amber-700 p-4 space-y-1">
            <p className="text-amber-300 font-semibold text-sm">⚠ Your emergency card is incomplete:</p>
            {!profileComplete.profile && (
              <p className="text-amber-200 text-sm">• Personal info (name, blood group) not filled yet</p>
            )}
            {!profileComplete.medical && (
              <p className="text-amber-200 text-sm">• Medical info (allergies, medications) not filled yet</p>
            )}
            {(contactCount ?? 0) === 0 && (
              <p className="text-amber-200 text-sm">• No emergency contacts added yet</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-zinc-400 text-sm">Documents Uploaded</h3>
            <p className="mt-2 text-4xl font-bold">{docCount ?? '—'}</p>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-zinc-400 text-sm">Emergency Contacts</h3>
            <p className="mt-2 text-4xl font-bold">{contactCount ?? '—'}</p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid gap-5 sm:grid-cols-2">

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {profileComplete.profile && <span className="text-xs text-emerald-400 font-medium">✓ Filled</span>}
            </div>
            <p className="text-zinc-400 text-sm mt-1 flex-1">
              Name, blood group, phone number, address and date of birth.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              {profileComplete.profile ? 'Edit' : 'Fill Now →'}
            </button>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold">Medical Information</h2>
              {profileComplete.medical && <span className="text-xs text-emerald-400 font-medium">✓ Filled</span>}
            </div>
            <p className="text-zinc-400 text-sm mt-1 flex-1">
              Allergies, medications, conditions and insurance details.
            </p>
            <button
              onClick={() => router.push('/medical')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              {profileComplete.medical ? 'Edit' : 'Fill Now →'}
            </button>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold">Emergency Contacts</h2>
              {(contactCount ?? 0) > 0 && (
                <span className="text-xs text-emerald-400 font-medium">✓ {contactCount} added</span>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-1 flex-1">
              Add family members and emergency phone numbers.
            </p>
            <button
              onClick={() => router.push('/emergency')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Manage
            </button>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold">Medical Documents</h2>
              {(docCount ?? 0) > 0 && (
                <span className="text-xs text-emerald-400 font-medium">✓ {docCount} file{docCount === 1 ? '' : 's'}</span>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-1 flex-1">
              Upload prescriptions, reports and insurance cards.
            </p>
            <button
              onClick={() => router.push('/documents')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Upload
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}