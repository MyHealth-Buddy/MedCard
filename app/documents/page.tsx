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

  const loadDocuments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('medical_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setDocuments(data || [])
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUpload = async () => {

    console.log('UPLOAD BUTTON CLICKED')
    console.log('FILES:', files)

    if (!files || files.length === 0) {
      alert('Please select a file')
      return
    }

    setUploading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first')
      setUploading(false)
      return
    }

    console.log('CURRENT USER:')
    console.log(user)

    for (const file of Array.from(files)) {

  console.log('================================')
  console.log('STARTING UPLOAD')
  console.log('FILE NAME:', file.name)

  const filePath = `${user.id}/${Date.now()}-${file.name}`

  console.log('FILE PATH:', filePath)

  const { error: uploadError } = await supabase.storage
    .from('medical-documents')
    .upload(filePath, file)

  if (uploadError) {

    console.error('STORAGE UPLOAD ERROR')
    console.error(uploadError)

    alert(
      `Storage Upload Error:\n${JSON.stringify(uploadError)}`
    )

    continue
  }

  console.log('FILE UPLOADED TO STORAGE')

  const { data: publicUrlData } = supabase.storage
    .from('medical-documents')
    .getPublicUrl(filePath)

  const documentUrl = publicUrlData.publicUrl

  console.log('PUBLIC URL GENERATED')
  console.log(documentUrl)

  const { error: dbError } = await supabase
    .from('medical_documents')
    .insert([
      {
        user_id: user.id,
        document_name: file.name,
        document_url: documentUrl,
      },
    ])

  if (dbError) {

    console.error('DATABASE INSERT ERROR')
    console.error(dbError)

    alert(
      `Database Error:\n${JSON.stringify(dbError)}`
    )

    continue
  }

  console.log('DATABASE INSERT SUCCESSFUL')
}

    await loadDocuments()

    setFiles(null)
    setUploading(false)

    alert('Documents uploaded successfully!')
  }

  const handleDelete = async (
    documentId: string,
    documentUrl: string
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const path = documentUrl.split('/medical-documents/')[1]

    if (path) {
      await supabase.storage
        .from('medical-documents')
        .remove([path])
    }

    const { error } = await supabase
      .from('medical_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error(error)
      alert('Delete failed')
      return
    }

    await loadDocuments()
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold mb-8">
          Medical Documents
        </h1>

        <div className="rounded-xl bg-zinc-900 p-8">

          <label className="cursor-pointer rounded-lg bg-zinc-800 px-6 py-3 inline-block">
            Select Documents
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
            />
          </label>

          {files && (
          <div className="mt-4 space-y-2">
            {Array.from(files).map((file) => (
              <p
                key={file.name}
                className="text-zinc-300"
              >
                📄 {file.name}
              </p>
            ))}
          </div>
        )}
          
          <br></br>
          <br></br>
          <br></br>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="fixed top-4 left-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition-colors z-50"
          >
            ← Dashboard
          </button>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>

        </div>

        <div className="mt-10 rounded-xl bg-zinc-900 p-6">

          <h2 className="text-2xl font-semibold mb-4">
            Uploaded Documents
          </h2>

          {documents.length === 0 ? (
            <p className="text-zinc-400">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-4">

              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {doc.document_name}
                    </p>
                  </div>

                  <div className="flex gap-3">

                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-green-600 px-4 py-2"
                    >
                      View
                    </a>

                    <button
                      onClick={() =>
                        handleDelete(
                          doc.id,
                          doc.document_url
                        )
                      }
                      className="rounded bg-red-600 px-4 py-2"
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