import { hasConsent, setConsent } from '../../utils/analytics'
import { useState, useEffect } from 'react'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try {
      if (!localStorage.getItem('lumina_analytics_consent')) setVisible(true)
    } catch {}
  }, [])
  if (!visible || hasConsent()) return null
  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      style={{
        padding: '10px 16px',
        background: 'var(--bg-muted)',
        borderBottom: '1px solid var(--divider)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Help improve Lumina with anonymous analytics (GTM). We never track API keys or message
        content.
      </span>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => {
            setConsent(true)
            setVisible(false)
          }}
          aria-label="Allow analytics"
          style={{
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid transparent',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Allow
        </button>
        <button
          onClick={() => {
            setConsent(false)
            setVisible(false)
          }}
          aria-label="Decline analytics"
          style={{
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
