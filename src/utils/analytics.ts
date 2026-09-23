// analytics.ts – privacy-friendly opt-in
export const getConsent = () => {
  try {
    return localStorage.getItem('lumina_analytics_consent')
  } catch {
    return null
  }
}
export const setConsent = (granted: boolean) => {
  try {
    localStorage.setItem('lumina_analytics_consent', granted ? 'granted' : 'denied')
  } catch {}
  if (granted) location.reload()
}
export const hasConsent = () => getConsent() === 'granted'
