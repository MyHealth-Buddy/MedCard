'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Contact {
  id: string
  contact_name: string
  relationship: string
  phone: string
}

export default function EmergencyPage() {
  const supabase = createClient()
  const router = useRouter()

  const [contactName, setContactName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRelationship, setEditRelationship] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const loadContacts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: true })

    if (!error) setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const validatePhone = (p: string) =>
    !p.trim() || /^\+?[\d\s\-()]{7,15}$/.test(p.trim())

  const handleAdd = async () => {
    setFormError('')

    if (!contactName.trim()) {
      setFormError('Contact name is required.')
      return
    }
    if (!phone.trim()) {
      setFormError('Phone number is required.')
      return
    }
    if (!validatePhone(phone)) {
      setFormError('Enter a valid phone number (7–15 digits).')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('emergency_contacts').insert([
      {
        user_id: user.id,
        contact_name: contactName.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
      },
    ])

    setSaving(false)

    if (error) {
      setFormError('Failed to add contact. Please try again.')
      return
    }

    setContactName('')
    setRelationship('')
    setPhone('')
    await loadContacts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this emergency contact?')) return

    await supabase.from('emergency_contacts').delete().eq('id', id)
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const startEdit = (c: Contact) => {
    setEditingId(c.id)
    setEditName(c.contact_name)
    setEditRelationship(c.relationship)
    setEditPhone(c.phone)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return
    if (!validatePhone(editPhone)) return

    setEditSaving(true)

    const { error } = await supabase
      .from('emergency_contacts')
      .update({
        contact_name: editName.trim(),
        relationship: editRelationship.trim(),
        phone: editPhone.trim(),
      })
      .eq('id', id)

    setEditSaving(false)

    if (error) return

    setEditingId(null)
    await loadContacts()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading contacts…</p>
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
        <h1 className="text-4xl font-bold mb-2">Emergency Contacts</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          Add people who should be called first in an emergency. At least one is required.
        </p>

        {/* Add Contact Form */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-200">Add New Contact</h2>

          {formError && (
            <div className="rounded-lg bg-red-900 border border-red-700 p-3 text-red-200 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Contact Name <span className="text-red-400">*</span>
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              type="text"
              placeholder="e.g. Rahul's Father"
              className="w-full rounded-lg bg-zinc-800 p-4 border border-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Relationship</label>
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              type="text"
              placeholder="e.g. Father, Mother, Spouse, Friend"
              className="w-full rounded-lg bg-zinc-800 p-4 border border-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded-lg bg-zinc-800 p-4 border border-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Adding…' : '+ Add Contact'}
          </button>
        </div>

        {/* Saved Contacts List */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Saved Contacts{' '}
            <span className="text-zinc-500 text-base font-normal">({contacts.length})</span>
          </h2>

          {contacts.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              No contacts added yet. Add at least one emergency contact above.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) =>
                editingId === contact.id ? (
                  // Inline edit mode
                  <div
                    key={contact.id}
                    className="rounded-xl bg-zinc-800 border border-blue-600 p-4 space-y-3"
                  >
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Contact name"
                      className="w-full rounded-lg bg-zinc-700 p-3 text-sm border border-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      value={editRelationship}
                      onChange={(e) => setEditRelationship(e.target.value)}
                      placeholder="Relationship"
                      className="w-full rounded-lg bg-zinc-700 p-3 text-sm border border-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                      type="tel"
                      className="w-full rounded-lg bg-zinc-700 p-3 text-sm border border-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(contact.id)}
                        disabled={editSaving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                      >
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-800 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{contact.contact_name}</p>
                      {contact.relationship && (
                        <p className="text-zinc-400 text-sm">{contact.relationship}</p>
                      )}
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-emerald-400 font-medium text-sm hover:underline"
                      >
                        📞 {contact.phone}
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(contact)}
                        className="rounded-lg bg-zinc-700 px-3 py-2 text-xs hover:bg-zinc-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="rounded-lg bg-red-800 px-3 py-2 text-xs hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}