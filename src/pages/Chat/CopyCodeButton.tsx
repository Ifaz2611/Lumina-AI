import { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

interface CopyCodeButtonProps {
  code: string
}

export default function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // reset after 2s
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button className="copy-button" onClick={handleCopy} aria-label="Copy code">
      {copied ? (
        <>
          <Icon icon="mdi:check" height={12} /> Copied
        </>
      ) : (
        <>
          <Icon icon="mdi:content-copy" height={12} /> Copy
        </>
      )}
    </button>
  )
}