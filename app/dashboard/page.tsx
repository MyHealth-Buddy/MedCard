'use client'

import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl p-8">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              MedCard Dashboard
            </h1>

            <p className="mt-2 text-zinc-400">
              Manage your emergency medical information
            </p>
          </div>

          <button
            onClick={() => alert('QR Generator Coming Soon')}
            className="rounded-lg bg-red-600 px-5 py-3 font-medium hover:bg-red-700"
          >
            Generate QR
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">

          {/* <div className="rounded-xl bg-zinc-900 p-6">
            <h3 className="text-zinc-400">
              Profile Status
            </h3>

            <p className="mt-2 text-3xl font-bold">
              100%
            </p>
          </div> */}

          <div className="rounded-xl bg-zinc-900 p-6">
            <h3 className="text-zinc-400">
              Documents Uploaded
            </h3>

            <p className="mt-2 text-3xl font-bold">
              --
            </p>
          </div>

          <div className="rounded-xl bg-zinc-900 p-6">
            <h3 className="text-zinc-400">
              Emergency Contacts
            </h3>

            <p className="mt-2 text-3xl font-bold">
              --
            </p>
          </div>

        </div>

        {/* Main Sections */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Personal Information */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Personal Information
            </h2>

            <p className="mt-3 text-zinc-400">
              Name, blood group, phone number,
              address and date of birth.
            </p>

            <button
              onClick={() => router.push('/profile')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              Edit
            </button>
          </div>

          {/* Medical Information */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Medical Information
            </h2>

            <p className="mt-3 text-zinc-400">
              Allergies, medications,
              conditions and insurance details.
            </p>

            <button
              onClick={() => router.push('/medical')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              Edit
            </button>
          </div>

          {/* Emergency Contacts */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Emergency Contacts
            </h2>

            <p className="mt-3 text-zinc-400">
              Add family members and emergency
              phone numbers.
            </p>

            <button
              onClick={() => router.push('/emergency')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              Manage
            </button>
          </div>

          {/* Documents */}
          <div className="rounded-xl bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Medical Documents
            </h2>

            <p className="mt-3 text-zinc-400">
              Upload prescriptions, reports
              and insurance cards.
            </p>

            <button
              onClick={() => router.push('/documents')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
            >
              Upload
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}