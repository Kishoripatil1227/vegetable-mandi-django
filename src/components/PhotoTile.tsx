'use client'
import { useEffect, useRef, useState } from 'react'

// Shows a photo from /public/images. If the file is missing it falls back to a big emoji,
// so the page looks good with or without photos.
export default function PhotoTile({
  src,
  emoji,
  label,
  className = '',
  emojiClass = 'text-6xl',
}: {
  src: string
  emoji: string
  label: string
  className?: string
  emojiClass?: string
}) {
  const [ok, setOk] = useState(true)
  const ref = useRef<HTMLImageElement>(null)

  // the image can fail before React attaches onError, so check once after mount
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) setOk(false)
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={label}
          loading="lazy"
          onError={() => setOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden className={`absolute inset-0 grid place-items-center ${emojiClass}`}>
          {emoji}
        </span>
      )}
    </div>
  )
}