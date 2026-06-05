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
    const shareUrl = `https://med-card-one.vercel.app/?uid=${encodeURIComponent(uid)}`

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

  if (!dataUrl) return <div className="text-sm">Generating QR code…</div>

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={dataUrl} alt="Share QR code" width={size} height={size} />
      <a
        href={`https://med-card-one.vercel.app/?uid=${encodeURIComponent(uid)}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs underline"
      >
        Open share link
      </a>
    </div>
  )
}
