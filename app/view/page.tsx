'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Profile {
  full_name: string
  blood_group: string
  phone: string
  date_of_birth: string
  address: string
}

interface Medical {
  allergies: string
  medications: string
  conditions: string
  insurance_provider: string
}

interface Contact {
  id: string
  contact_name: string
  relationship: string
  phone: string
}

interface Document {
  id: string
  document_name: string
  document_url: string
  uploaded_at: string
}

export default function ViewPage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [medical, setMedical] = useState<Medical | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const uid = params.get('uid')

    if (!uid) {
      setNotFound(true)
      setLoading(false)
      return
    }

    async function loadAll() {
      const [profileRes, medicalRes, contactsRes, docsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', uid).maybeSingle(),
        supabase.from('medical_information').select('*').eq('user_id', uid).maybeSingle(),
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', uid)
          .order('id', { ascending: true }),
        supabase
          .from('medical_documents')
          .select('*')
          .eq('user_id', uid)
          .order('uploaded_at', { ascending: true }),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (medicalRes.data) setMedical(medicalRes.data)
      setContacts(contactsRes.data || [])
      setDocuments(docsRes.data || [])

      if (!profileRes.data && !medicalRes.data && contactsRes.data?.length === 0) {
        setNotFound(true)
      }

      setLoading(false)
    }

    loadAll()
  }, [])

  const calcAge = (dob: string) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Loading medical profile…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-sm">
          <p className="text-5xl mb-4">⚠</p>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Profile Not Found</h1>
          <p className="text-zinc-400 text-sm">
            No medical profile is associated with this QR code. The person may not have set up
            their MedCard yet.
          </p>
        </div>
      </div>
    )
  }

  const hasNoMedical =
    !medical?.allergies &&
    !medical?.medications &&
    !medical?.conditions &&
    !medical?.insurance_provider

  return (
    <main className="min-h-screen bg-zinc-950 text-white print:bg-white print:text-black">
      {/* Emergency Banner */}
      <div className="bg-red-700 print:bg-red-100 px-4 py-4 text-center">
        <p className="font-black text-xl tracking-widest text-white print:text-red-900">
          ⚠ EMERGENCY MEDICAL INFORMATION ⚠
        </p>
        <p className="text-sm text-red-200 print:text-red-700 mt-1">
          Show this screen to paramedics or first responders immediately
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5 print:px-2 print:py-3 print:max-w-full">
        {/* Print button — hidden when printing */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🖨 Print / Save as PDF
          </button>
        </div>

        {/* Identity Card */}
        {profile && (
          <section className="bg-zinc-900 print:bg-gray-50 rounded-2xl p-5 border border-zinc-700 print:border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 print:text-gray-400 mb-3">
              Patient Identity
            </p>
            <p className="text-3xl font-bold">{profile.full_name || '—'}</p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {profile.date_of_birth && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-zinc-400 print:text-gray-500">Age:</span>
                  <span className="font-semibold">
                    {calcAge(profile.date_of_birth)} yrs
                  </span>
                </div>
              )}
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="text-sm text-blue-400 print:text-blue-700 font-medium hover:underline"
                >
                  📞 {profile.phone}
                </a>
              )}
            </div>

            {profile.address && (
              <p className="mt-2 text-zinc-400 print:text-gray-500 text-sm">
                📍 {profile.address}
              </p>
            )}
          </section>
        )}

        {/* Blood Group — largest, most prominent element */}
        {profile?.blood_group && (
          <section className="bg-red-900 print:bg-red-50 border-2 border-red-600 print:border-red-300 rounded-2xl p-6 flex items-center gap-5">
            <div className="text-6xl font-black text-white print:text-red-800 leading-none">
              {profile.blood_group}
            </div>
            <div>
              <p className="font-bold text-red-200 print:text-red-700 text-lg">Blood Group</p>
              <p className="text-xs text-red-300 print:text-red-500 mt-1">
                Critical for transfusions — do not ignore
              </p>
            </div>
          </section>
        )}

        {/* Allergies — second most critical */}
        {medical?.allergies && (
          <section className="bg-orange-950 print:bg-orange-50 border border-orange-700 print:border-orange-300 rounded-2xl p-5">
            <p className="text-orange-400 print:text-orange-700 font-black text-sm uppercase tracking-widest mb-2">
              ⚠ Known Allergies — Do NOT Administer
            </p>
            <p className="text-orange-100 print:text-orange-900 font-medium text-base whitespace-pre-wrap">
              {medical.allergies}
            </p>
          </section>
        )}

        {/* Medical Conditions */}
        {medical?.conditions && (
          <section className="bg-zinc-900 print:bg-gray-50 border border-zinc-700 print:border-gray-200 rounded-2xl p-5">
            <p className="text-yellow-400 print:text-yellow-700 font-bold text-sm uppercase tracking-widest mb-2">
              Medical Conditions / History
            </p>
            <p className="text-zinc-200 print:text-gray-800 whitespace-pre-wrap">
              {medical.conditions}
            </p>
          </section>
        )}

        {/* Current Medications */}
        {medical?.medications && (
          <section className="bg-zinc-900 print:bg-gray-50 border border-zinc-700 print:border-gray-200 rounded-2xl p-5">
            <p className="text-blue-400 print:text-blue-700 font-bold text-sm uppercase tracking-widest mb-2">
              Current Medications
            </p>
            <p className="text-zinc-200 print:text-gray-800 whitespace-pre-wrap">
              {medical.medications}
            </p>
          </section>
        )}

        {/* Insurance */}
        {medical?.insurance_provider && (
          <section className="bg-zinc-900 print:bg-gray-50 border border-zinc-700 print:border-gray-200 rounded-2xl p-5">
            <p className="text-zinc-400 print:text-gray-500 font-bold text-sm uppercase tracking-widest mb-2">
              Insurance Provider
            </p>
            <p className="text-zinc-200 print:text-gray-800">{medical.insurance_provider}</p>
          </section>
        )}

        {/* Warning if no medical info at all */}
        {hasNoMedical && (
          <section className="bg-zinc-800 print:bg-gray-100 border border-zinc-600 rounded-2xl p-5">
            <p className="text-zinc-400 text-sm">
              This person has not added detailed medical information yet. Contact their emergency
              numbers below for more details.
            </p>
          </section>
        )}

        {/* Emergency Contacts */}
        {contacts.length > 0 && (
          <section className="bg-zinc-900 print:bg-gray-50 border border-zinc-700 print:border-gray-200 rounded-2xl p-5">
            <p className="text-emerald-400 print:text-emerald-700 font-bold text-sm uppercase tracking-widest mb-3">
              📞 Emergency Contacts — Call Immediately
            </p>
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-zinc-800 print:bg-white print:border print:border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold">{c.contact_name}</p>
                    {c.relationship && (
                      <p className="text-zinc-400 print:text-gray-500 text-sm">{c.relationship}</p>
                    )}
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-emerald-400 print:text-emerald-700 font-bold text-xl hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {contacts.length === 0 && (
          <section className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
            <p className="text-zinc-500 text-sm">No emergency contacts on file.</p>
          </section>
        )}

        {/* Medical Documents */}
        {documents.length > 0 && (
          <section className="bg-zinc-900 print:bg-gray-50 border border-zinc-700 print:border-gray-200 rounded-2xl p-5">
            <p className="text-purple-400 print:text-purple-700 font-bold text-sm uppercase tracking-widest mb-3">
              📄 Medical Documents
            </p>
            <div className="space-y-2">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-zinc-800 print:bg-white print:border print:border-gray-200 rounded-xl p-3 hover:bg-zinc-700 transition-colors group"
                >
                  <span>📄</span>
                  <span className="text-zinc-200 print:text-gray-800 text-sm group-hover:underline">
                    {doc.document_name}
                  </span>
                  <span className="ml-auto text-zinc-500 text-xs print:hidden">Open ↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 print:text-gray-400 pb-4 print:hidden">
          Powered by MedCard — Emergency Digital Medical ID
        </p>
      </div>
    </main>
  )
}
