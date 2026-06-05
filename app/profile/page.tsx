'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      return
    }

    const { error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          full_name: fullName,
          blood_group: bloodGroup,
          phone: phone,
          date_of_birth: dob,
          address: address,
        },
      ])

    if (error) {
      console.error(error)
      alert('Failed to save')
      return
    }

    alert('Profile saved successfully!')
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">
          Personal Information
        </h1>

        <div className="space-y-5">

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            type="text"
            placeholder="Blood Group"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Phone Number"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            type="date"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            rows={4}
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <button
            onClick={() => router.push('/dashboard')}
            className="fixed top-4 left-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition-colors z-50"
          >
            ← Dashboard
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-6 py-3"
          >
            Save Information
          </button>

        </div>
      </div>
    </main>
  )
}