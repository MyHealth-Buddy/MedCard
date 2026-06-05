'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function MedicalPage() {

    const supabase = createClient()
    const router = useRouter()
    const [allergies, setAllergies] = useState('')
    const [medications, setMedications] = useState('')
    const [conditions, setConditions] = useState('')
    const [insurance, setInsurance] = useState('')

    const handleSave = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert('Please login first')
    return
  }

  const { error } = await supabase
    .from('medical_information')
    .insert([
      {
        user_id: user.id,
        allergies: allergies,
        medications: medications,
        conditions: conditions,
        insurance_provider: insurance,
      },
    ])

  if (error) {
    console.error(error)
    alert('Failed to save medical information')
    return
  }

  alert('Medical information saved successfully!')
}
  
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">
          Medical Information
        </h1>

        <div className="space-y-5">

          <textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Allergies"
            rows={3}
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <textarea
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="Current Medications"
            rows={3}
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Medical Conditions"
            rows={3}
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            type="text"
            placeholder="Insurance Provider"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <button
            onClick={() => router.push('/dashboard')}
            className="fixed top-4 left-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition-colors z-50"
          >
            ← Dashboard
          </button>

          <button onClick={handleSave} className="rounded-lg bg-blue-600 px-6 py-3">
            Save Medical Details
          </button>

        </div>
      </div>
    </main>
  );
}