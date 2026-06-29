'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DocumentsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [files, setFiles] = useState<FileList | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadDocuments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (!error) setDocuments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUpload = async () => {
    setErrorMsg('')

    if (!files || files.length === 0) {
      setErrorMsg('Please select at least one file.')
      return
    }

    setUploading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const uploadErrors: string[] = []

    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file)

      if (uploadError) {
        uploadErrors.push(`"${file.name}" failed to upload: ${uploadError.message}`)
        continue
      }

      const { data: publicUrlData } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('medical_documents').insert([
        {
          user_id: user.id,
          document_name: file.name,
          document_url: publicUrlData.publicUrl,
        },
      ])

      if (dbError) {
        uploadErrors.push(`"${file.name}" uploaded but record failed to save.`)
      }
    }

    await loadDocuments()

    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    setFiles(null)
    setUploading(false)

    if (uploadErrors.length > 0) {
      setErrorMsg(uploadErrors.join('\n'))
    }
  }

  const handleDelete = async (documentId: string, documentUrl: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const path = documentUrl.split('/medical-documents/')[1]

    if (path) {
      await supabase.storage.from('medical-documents').remove([path])
    }

    const { error } = await supabase
      .from('medical_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      setErrorMsg('Failed to delete document.')
      return
    }

    setDocuments((prev) => prev.filter((d) => d.id !== documentId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading documents…</p>
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

      <div className="mx-auto max-w-4xl pt-10">
        <h1 className="text-4xl font-bold mb-2">Medical Documents</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          Upload prescriptions, lab reports, X-rays, and insurance cards. These are visible to
          anyone who scans your QR code.
        </p>

        {/* Upload Area */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-8 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload New Documents</h2>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-900 border border-red-700 p-3 text-red-200 text-sm whitespace-pre-wrap">
              {errorMsg}
            </div>
          )}

          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-5 py-3 transition-colors text-sm font-medium">
            📁 Select Files
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
            />
          </label>

          {files && files.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs text-zinc-400 mb-2">Selected ({files.length} file{files.length > 1 ? 's' : ''}):</p>
              {Array.from(files).map((file) => (
                <p key={file.name} className="text-zinc-300 text-sm flex items-center gap-2">
                  <span>📄</span> {file.name}{' '}
                  <span className="text-zinc-500 text-xs">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !files || files.length === 0}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload Documents'}
          </button>
        </div>

        {/* Documents List */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Uploaded Documents{' '}
            <span className="text-zinc-500 text-base font-normal">({documents.length})</span>
          </h2>

          {documents.length === 0 ? (
            <p className="text-zinc-400 text-sm">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-800 p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-zinc-400 text-sm">{index + 1}.</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.document_name}</p>
                      {doc.uploaded_at && (
                        <p className="text-zinc-500 text-xs">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 shrink-0">
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.document_url)}
                      className="rounded-lg bg-red-800 hover:bg-red-700 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}