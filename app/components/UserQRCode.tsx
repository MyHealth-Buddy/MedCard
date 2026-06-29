"use client"

import { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'

interface Props {
  uid: string
  size?: number
}

export default function UserQRCode({ uid, size = 200 }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://med-card-one.vercel.app'
    const shareUrl = `${origin}/view?uid=${encodeURIComponent(uid)}`

    toDataURL(shareUrl, { margin: 1, width: size })
      .then((url) => {
        if (mounted) setDataUrl(url)
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err)
      })

    return () => {
      mounted = false
    }
  }, [uid, size])

  if (!dataUrl) return <div className="text-sm text-zinc-400">Generating QR code…</div>

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={dataUrl} alt="Emergency medical QR code" width={size} height={size} />
    </div>
  )
}
