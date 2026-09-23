// secureStorage.ts – API key stored in sessionStorage (cleared on tab close), not localStorage
const SESSION_KEY = 'lumina_api_key'
const SESSION_NAME = 'lumina_user_name'

export const secureStorage = {
  getApiKey(): string {
    try {
      // Prefer env fallback handled elsewhere; here just session
      return sessionStorage.getItem(SESSION_KEY) || ''
    } catch { return '' }
  },
  setApiKey(key: string) {
    try { sessionStorage.setItem(SESSION_KEY, key) } catch {}
  },
  clearApiKey() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
  },
  getName(): string {
    try { return sessionStorage.getItem(SESSION_NAME) || '' } catch { return '' }
  },
  setName(name: string) {
    try { sessionStorage.setItem(SESSION_NAME, name) } catch {}
  },
  clearName() {
    try { sessionStorage.removeItem(SESSION_NAME) } catch {}
  },
  clearAll() {
    try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_NAME) } catch {}
  }
}

// Helper to check if env key exists
export const getEnvApiKey = (): string => {
  // Vite exposes VITE_ prefixed envs
  try { return (import.meta as unknown as { env: Record<string,string> }).env?.VITE_GEMINI_API_KEY || '' } catch { return '' }
}
