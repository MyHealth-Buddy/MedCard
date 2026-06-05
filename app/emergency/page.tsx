'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'


export default function EmergencyPage() {

  const supabase = createClient()
  const router = useRouter()
  const [contactName, setContactName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [contacts, setContacts] = useState<any[]>([])

  const loadContacts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) return
    
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
    
      if (error) {
        console.error(error)
        return
      }
    
      setContacts(data || [])
    }

    useEffect(() => {
      loadContacts()
    }, [])


  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      return
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .insert([
        {
          user_id: user.id,
          contact_name: contactName,
          relationship,
          phone,
        },
      ])

    if (error) {
      console.error(error)
      alert('Failed to save contact')
      return
    }

    alert('Emergency contact saved successfully!')

    await loadContacts()

    setContactName('')
    setRelationship('')
    setPhone('')
  }

  return (

    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">
          Emergency Contacts
        </h1>

        <div className="space-y-5">

          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            type="text"
            placeholder="Contact Name"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            type="text"
            placeholder="Relationship"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Phone Number"
            className="w-full rounded-lg bg-zinc-900 p-4"
          />

          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            Add Contact
          </button>

        </div>

        <div className="mt-10 rounded-xl bg-zinc-900 p-5">
          <h2 className="text-xl font-semibold mb-4">
            Saved Contacts
          </h2>

          <button
            onClick={() => router.push('/dashboard')}
            className="fixed top-4 left-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition-colors z-50"
          >
            ← Dashboard
          </button>

          {contacts.length === 0 ? (
  <p className="text-zinc-400">
    No contacts added yet.
      </p>
    ) : (
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-lg bg-zinc-800 p-4"
          >
            <p className="font-semibold">
              {contact.contact_name}
            </p>
        
            <p className="text-zinc-400">
              {contact.relationship}
            </p>
        
            <p className="text-zinc-300">
              {contact.phone}
            </p>
          </div>
        ))}
      </div>
    )}
        </div>
      </div>
    </main>
  );
}