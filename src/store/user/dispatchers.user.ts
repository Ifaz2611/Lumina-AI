import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '..'
import { textResponse } from '../../types/responses'
import { getEnvApiKey } from '../../utils/secureStorage'
import { appendStreamChunk } from './userSlice'

// Helpers
const getApiKey = (stateKey: string) => stateKey?.trim() || getEnvApiKey()?.trim() || ''

const mapErrorMessage = (status: number, apiMessage?: string) => {
  if (apiMessage) {
    if (status === 401 || status === 403) return `Authentication failed ( ${status}): ${apiMessage}. Please check your API key.`
    if (status === 429) return `Rate limited (429): ${apiMessage}. Please wait a moment and retry.`
    if (status >= 500) return `Server error (${status}): ${apiMessage}. Retrying may help.`
    return apiMessage
  }
  if (status === 401 || status === 403) return 'Invalid API key. Please sign out and enter a new key.'
  if (status === 429) return 'Too many requests. Please wait 30s before trying again.'
  if (status === 400) return 'Bad request - check your prompt and try again.'
  if (status >= 500) return 'Gemini service temporarily unavailable.'
  return `Request failed (${status})`
}

// Simple client rate limiter: 6 requests per minute
let requestTimestamps: number[] = []
const checkRateLimit = () => {
  const now = Date.now()
  requestTimestamps = requestTimestamps.filter(t => now - t < 60000)
  if (requestTimestamps.length >= 6) {
    const oldest = requestTimestamps[0]
    const waitSec = Math.ceil((60000 - (now - oldest)) / 1000)
    throw new Error(`Rate limited locally: max 6 requests/min. Try again in ${waitSec}s`)
  }
  requestTimestamps.push(now)
}

const buildContents = (
  conversationData: RootState['user']['conversation']['data'],
  prompt: string,
  base64File: string | null | undefined,
  mimeType: string | undefined,
  systemInstruction: string | undefined
) => {
  // Build role-aware history; exclude the optimistic last outbound already pushed in pending reducer
  const history = (conversationData || []).slice(0, -1)
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = []

  // Optional system instruction as first user message
  if (systemInstruction?.trim()) {
    contents.push({ role: 'user', parts: [{ text: `System: ${systemInstruction.trim()}` }] })
    contents.push({ role: 'model', parts: [{ text: 'Understood.' }] })
  }

  for (const m of history) {
    const role = m.type === 'inbound' ? 'model' as const : 'user' as const
    contents.push({ role, parts: [{ text: m.message }] })
  }

  // Current prompt
  const currentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: prompt }]
  if (base64File) {
    currentParts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: base64File } })
  }
  contents.push({ role: 'user', parts: currentParts })
  return contents
}

async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 2): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, init)
      // retry only on 429/5xx
      if (res.status === 429 || res.status >= 500) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000 + Math.random() * 500))
          continue
        }
      }
      return res
    } catch (e) {
      lastErr = e
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
        continue
      }
      throw e
    }
  }
  throw lastErr
}

export const generateTextContent = createAsyncThunk<
  { text: string; usage?: { promptTokens: number; candidatesTokens: number; totalTokens: number } },
  { prompt: string; base64File?: string | null; mimeType?: string },
  { state: RootState; rejectValue: string }
>('user/generateTextContent', async ({ prompt, base64File, mimeType }, thunkApi) => {
  try {
    checkRateLimit()
  } catch (e) {
    return thunkApi.rejectWithValue((e as Error).message)
  }

  const state = thunkApi.getState() as RootState
  const { conversation, selectedModel, generationConfig, systemInstruction } = state.user
  const apiKey = getApiKey(state.user.API_KEY)

  if (!apiKey) return thunkApi.rejectWithValue('Missing API key. Please sign in again or set VITE_GEMINI_API_KEY.')

  const contents = buildContents(conversation.data, prompt, base64File ?? null, mimeType, systemInstruction)

  const body = JSON.stringify({
    contents,
    generationConfig: {
      temperature: generationConfig?.temperature ?? 0.9,
      topP: generationConfig?.topP ?? 0.95,
    },
  })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`

  let response: Response
  try {
    response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch {
    return thunkApi.rejectWithValue('Network error. Please check your connection and retry.')
  }

  const data: textResponse = await response.json().catch(() => ({ candidates: [], error: { message: 'Invalid JSON response' } } as unknown as textResponse))

  if (!response.ok) {
    return thunkApi.rejectWithValue(mapErrorMessage(response.status, data?.error?.message))
  }

  const aiAnswerText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (aiAnswerText === undefined) {
    return thunkApi.rejectWithValue(data?.error?.message || 'No content returned from model. Try rephrasing.')
  }

  const usage = data.usageMetadata
    ? { promptTokens: data.usageMetadata.promptTokenCount, candidatesTokens: data.usageMetadata.candidatesTokenCount, totalTokens: data.usageMetadata.totalTokenCount }
    : undefined

  return { text: aiAnswerText, usage }
})

// Streaming version using streamGenerateContent
export const generateStreamContent = createAsyncThunk<
  { text: string; usage?: { promptTokens: number; candidatesTokens: number; totalTokens: number } },
  { prompt: string; base64File?: string | null; mimeType?: string },
  { state: RootState; rejectValue: string }
>('user/generateStreamContent', async ({ prompt, base64File, mimeType }, thunkApi) => {
  try {
    checkRateLimit()
  } catch (e) {
    return thunkApi.rejectWithValue((e as Error).message)
  }

  const state = thunkApi.getState() as RootState
  const { conversation, selectedModel, generationConfig, systemInstruction } = state.user
  const apiKey = getApiKey(state.user.API_KEY)

  if (!apiKey) return thunkApi.rejectWithValue('Missing API key.')

  const contents = buildContents(conversation.data, prompt, base64File ?? null, mimeType, systemInstruction)

  const body = JSON.stringify({
    contents,
    generationConfig: {
      temperature: generationConfig?.temperature ?? 0.9,
      topP: generationConfig?.topP ?? 0.95,
    },
  })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?alt=sse&key=${apiKey}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch {
    return thunkApi.rejectWithValue('Network error during streaming.')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: { message: 'Stream failed' } }))
    return thunkApi.rejectWithValue(mapErrorMessage(response.status, (data as textResponse)?.error?.message))
  }

  if (!response.body) {
    return thunkApi.rejectWithValue('Streaming not supported in this browser.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''
  let usage: { promptTokens: number; candidatesTokens: number; totalTokens: number } | undefined

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const jsonStr = trimmed.slice(5).trim()
      if (!jsonStr) continue
      try {
        const data = JSON.parse(jsonStr) as textResponse
        const chunk = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (chunk) {
          fullText += chunk
          thunkApi.dispatch(appendStreamChunk(chunk))
        }
        if (data.usageMetadata) {
          usage = {
            promptTokens: data.usageMetadata.promptTokenCount,
            candidatesTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        }
      } catch {}
    }
  }

  if (!fullText) return thunkApi.rejectWithValue('No streamed content returned.')

  return { text: fullText, usage }
})
