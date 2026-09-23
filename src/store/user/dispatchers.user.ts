import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '..'
import { textResponse } from '../../types/responses'

export const generateTextContent = createAsyncThunk(
  'user/generateTextContent',
  async ({ prompt, base64File, mimeType }: { prompt: string, base64File?: string | null, mimeType?: string }, thunkApi) => {
    const currentState = thunkApi.getState() as RootState
    const { API_KEY: apiKey, conversation, selectedModel } = currentState.user

    if (!apiKey) {
      throw new Error('Missing API key. Please sign in again.')
    }

    // Build history from previous messages (exclude the optimistic outbound just pushed in pending)
    const historyText = conversation.data
      ?.filter((m) => m.type === 'outbound' || m.type === 'inbound')
      .slice(0, -1)
      .map((entry) => entry.message)
      .join('\n') ?? ''

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = []

    if (historyText) {
      parts.push({ text: `Conversation history:\n${historyText}` })
    }
    parts.push({ text: prompt })

    if (base64File) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64File,
        },
      })
    }

    const requestBody = {
      contents: [{ parts }],
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data: textResponse = await response.json()

    if (!response.ok) {
      throw new Error(data?.error?.message || `Request failed with ${response.status}`)
    }

    const aiAnswerText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (aiAnswerText === undefined) {
      throw new Error(data?.error?.message || 'No content returned from model')
    }

    return aiAnswerText
  }
)
