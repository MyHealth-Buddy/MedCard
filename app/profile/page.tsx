'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState('')

  // Preload existing profile data on mount
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
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setFullName(data.full_name ?? '')
        setBloodGroup(data.blood_group ?? '')
        setPhone(data.phone ?? '')
        setDob(data.date_of_birth ?? '')
        setAddress(data.address ?? '')
      }

      setLoading(false)
    }

    load()
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) newErrors.fullName = 'Full name is required.'

    if (phone.trim() && !/^\+?[\d\s\-()]{7,15}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (7–15 digits).'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setSuccessMsg('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Check if profile already exists to decide insert vs update
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const payload = {
      user_id: user.id,
      full_name: fullName.trim(),
      blood_group: bloodGroup,
      phone: phone.trim(),
      date_of_birth: dob || null,
      address: address.trim(),
    }

    const { error } = existing
      ? await supabase.from('user_profiles').update(payload).eq('user_id', user.id)
      : await supabase.from('user_profiles').insert([payload])

    setSaving(false)

    if (error) {
      setErrors({ form: 'Failed to save profile. Please try again.' })
      return
    }

    setSuccessMsg('Profile saved successfully!')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading your profile…</p>
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
        <h1 className="text-4xl font-bold mb-2">Personal Information</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          This info appears on your emergency card. Fill in as much as possible.
        </p>

        {errors.form && (
          <div className="mb-4 rounded-lg bg-red-900 border border-red-700 p-3 text-red-200 text-sm">
            {errors.form}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-900 border border-emerald-700 p-3 text-emerald-200 text-sm">
            {successMsg}
          </div>
        )}

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="e.g. Rahul Sharma"
              className={`w-full rounded-lg bg-zinc-900 p-4 border ${
                errors.fullName ? 'border-red-500' : 'border-zinc-700'
              } focus:outline-none focus:border-blue-500`}
            />
            {errors.fullName && <p className="mt-1 text-red-400 text-xs">{errors.fullName}</p>}
          </div>

          {/* Blood Group — dropdown for accuracy */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Blood Group{' '}
              <span className="text-amber-400 text-xs font-normal">(critical in emergencies)</span>
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              aria-label="Blood group"
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">Select blood group…</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="e.g. +91 98765 43210"
              className={`w-full rounded-lg bg-zinc-900 p-4 border ${
                errors.phone ? 'border-red-500' : 'border-zinc-700'
              } focus:outline-none focus:border-blue-500`}
            />
            {errors.phone && <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Date of Birth</label>
            <input
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              type="date"
              title="Date of birth"
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Home address"
              rows={4}
              className="w-full rounded-lg bg-zinc-900 p-4 border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Information'}
          </button>
        </div>
      </div>
    </main>
  )
}