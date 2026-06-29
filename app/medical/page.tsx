'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function MedicalPage() {
  const supabase = createClient()
  const router = useRouter()

  const [allergies, setAllergies] = useState('')
  const [medications, setMedications] = useState('')
  const [conditions, setConditions] = useState('')
  const [insurance, setInsurance] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Preload existing medical info on mount
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('medical_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setAllergies(data.allergies ?? '')
        setMedications(data.medications ?? '')
        setConditions(data.conditions ?? '')
        setInsurance(data.insurance_provider ?? '')
      }

      setLoading(false)
    }

    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Check if record exists → update, else insert
    const { data: existing } = await supabase
      .from('medical_information')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const payload = {
      user_id: user.id,
      allergies: allergies.trim(),
      medications: medications.trim(),
      conditions: conditions.trim(),
      insurance_provider: insurance.trim(),
    }

    const { error } = existing
      ? await supabase.from('medical_information').update(payload).eq('user_id', user.id)
      : await supabase.from('medical_information').insert([payload])

    setSaving(false)

    if (error) {
      setErrorMsg('Failed to save medical information. Please try again.')
      return
    }

    setSuccessMsg('Medical information saved!')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading medical information…</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed top-4 left-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition-colors z-50 text-sm"
      >
        ← Dashboard
      </button>

      <div className="mx-auto max-w-3xl pt-10">
        <h1 className="text-4xl font-bold mb-2">Medical Information</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          This is the most critical data for first responders. Keep it accurate and up-to-date.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-900 border border-red-700 p-3 text-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-900 border border-emerald-700 p-3 text-emerald-200 text-sm">
            {successMsg}
          </div>
        )}

        <div className="space-y-5">
          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-orange-300 mb-1">
              ⚠ Known Allergies{' '}
              <span className="text-zinc-400 font-normal">(drugs, food, latex, etc.)</span>
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts, NSAIDs…"
              rows={3}
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Current Medications */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Current Medications{' '}
              <span className="text-zinc-400 font-normal">(name + dosage if possible)</span>
            </label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Metformin 500mg twice daily, Aspirin 75mg…"
              rows={3}
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Medical Conditions / History
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma…"
              rows={3}
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Insurance */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Insurance Provider
            </label>
            <input
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              type="text"
              placeholder="e.g. Star Health, HDFC Ergo, Policy No. XXXX"
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Medical Details'}
          </button>
        </div>
      </div>
    </main>
  )
}