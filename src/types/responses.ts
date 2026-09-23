export interface textResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        }
      }>
    }
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
  error?: {
    message: string
    code?: number
  }
}

export interface Message {
  type: 'inbound' | 'outbound'
  message: string
  timestamp: string
  role: string
}

export interface ConversationEntry {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

export interface UserState {
  name: string
  API_KEY: string
  conversation: {
    loading: boolean
    error?: string
    data?: Message[]
  }
  conversations: Record<string, ConversationEntry>
  activeConversationId: string | null
  selectedModel: string
  theme: 'dark' | 'light' | 'midnight'
  generationConfig: {
    temperature: number
    topP: number
    streaming: boolean
  }
  usage: { promptTokens: number; candidatesTokens: number; totalTokens: number }
  lastPrompt: { prompt: string; base64File: string | null; mimeType?: string } | null
  systemInstruction: string
}
  