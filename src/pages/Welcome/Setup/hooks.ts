import { setUser } from '../../../store/user/userSlice'
import { useState, ChangeEvent, useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { getEnvApiKey } from '../../../utils/secureStorage'

// Gemini API key starts with AIza and is 39 chars; allow 35-45 for future
const API_KEY_REGEX = /^AIza[0-9A-Za-z\-_]{35,}$/

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
        if (!API_KEY_REGEX.test(trimmed)) return 'Invalid API key format. It should start with "AIza" and be ~39 characters.'
        if (trimmed.length < 35 || trimmed.length > 45) return 'API key length looks invalid.'
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

    return { handleNameChange, handleApiKeyChange, handleSubmit, getAPI, name, API_KEY, showApiError, apiErrorText, envKeyExists, validateKey }
}
