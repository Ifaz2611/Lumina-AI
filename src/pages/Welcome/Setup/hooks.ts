import { setUser } from '../../../store/user/userSlice'
import { useState, ChangeEvent, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { getEnvApiKey } from '../../../utils/secureStorage'

// Gemini API keys traditionally start with "AIza" (39 chars) but newer
// Google Cloud / AI Studio keys can use other prefixes (e.g. "AQ.", "ya29.").
// Accept any non-empty, non-whitespace token of 20-512 chars. Let the API
// return 401/403 if the key is actually invalid — don't block valid keys client-side.
const MIN_KEY_LEN = 20
const MAX_KEY_LEN = 512

export const useSetup = () => {
  const [name, setName] = useState<string>('')
  const [API_KEY, setAPI_KEY] = useState<string>('')
  const [showApiError, setShowApiError] = useState(false)
  const [apiErrorText, setApiErrorText] = useState('')
  const dispatch = useDispatch()
  const envKeyExists = useMemo(() => !!getEnvApiKey(), [])

  const validateKey = useCallback((key: string) => {
    const trimmed = key.trim()
    if (!trimmed) return 'API key is required.'
    if (/\s/.test(trimmed))
      return 'API key should not contain spaces. Paste the full key without line breaks.'
    if (trimmed.length < MIN_KEY_LEN)
      return `API key looks too short (${trimmed.length} chars). Paste the full key from Google AI Studio — usually 30+ characters.`
    if (trimmed.length > MAX_KEY_LEN)
      return 'API key looks too long. Check that you pasted only the key.'
    return null
  }, [])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trimStart()
    setAPI_KEY(val)
    if (showApiError) {
      const err = validateKey(val)
      setApiErrorText(err || '')
      setShowApiError(!!err)
    }
  }

  const handleSubmit = () => {
    // If env key exists and user left blank, allow using env key
    if (envKeyExists && !API_KEY.trim()) {
      dispatch(setUser({ name, API_KEY: getEnvApiKey() }))
      return
    }
    const err = validateKey(API_KEY)
    if (err) {
      setApiErrorText(err)
      setShowApiError(true)
      return
    }
    dispatch(setUser({ name, API_KEY: API_KEY.trim() }))
  }

  const getAPI = () => {
    window.open('https://aistudio.google.com/app/api-keys', '_blank', 'noopener')
  }

  return {
    handleNameChange,
    handleApiKeyChange,
    handleSubmit,
    getAPI,
    name,
    API_KEY,
    showApiError,
    apiErrorText,
    envKeyExists,
    validateKey,
  }
}
