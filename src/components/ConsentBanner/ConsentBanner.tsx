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
    <div role="dialog" aria-label="Analytics consent" style={{padding:'8px 12px', background:'var(--input-background)', borderBottom:'1px solid var(--light-border)', display:'flex', gap:'8px', alignItems:'center', justifyContent:'space-between'}}>
      <span style={{fontSize:'0.85rem'}}>Help improve Lumina by allowing anonymous analytics (GTM). No API keys are tracked.</span>
      <div style={{display:'flex', gap:'6px'}}>
        <button onClick={() => { setConsent(true); setVisible(false) }} aria-label="Allow analytics">Allow</button>
        <button onClick={() => { setConsent(false); setVisible(false) }} aria-label="Decline analytics">Decline</button>
      </div>
    </div>
  )
}
