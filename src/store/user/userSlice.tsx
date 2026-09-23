import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { generateTextContent, generateStreamContent } from './dispatchers.user'
import { UserState, ConversationEntry } from '../../types/responses'
import { DEFAULT_MODEL } from '../../constants/models'
import { secureStorage, getEnvApiKey } from '../../utils/secureStorage'

const envKey = getEnvApiKey()

const createDefaultConversation = (): ConversationEntry => ({
  id: Date.now().toString(),
  title: 'New chat',
  messages: [],
  createdAt: new Date().toISOString(),
})

const defaultConv = createDefaultConversation()

const initialUserState: UserState = {
  name: secureStorage.getName() || '',
  API_KEY: secureStorage.getApiKey() || envKey || '',
  conversation: {
    loading: false,
    error: undefined,
    data: []
  },
  conversations: { [defaultConv.id]: defaultConv },
  activeConversationId: defaultConv.id,
  selectedModel: DEFAULT_MODEL,
  theme: 'dark',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    streaming: false,
  },
  usage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 },
  lastPrompt: null,
  systemInstruction: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; API_KEY: string }>) => {
      const trimmedKey = action.payload.API_KEY.trim()
      const trimmedName = action.payload.name.trim()
      state.name = trimmedName
      state.API_KEY = trimmedKey
      // Persist securely in sessionStorage, not localStorage
      secureStorage.setName(trimmedName)
      secureStorage.setApiKey(trimmedKey)
      state.lastPrompt = null
    },
    clearUser: (state) => {
      secureStorage.clearAll()
      state.name = initialUserState.name
      state.API_KEY = getEnvApiKey() || '' // keep env key if present
      state.conversation = { loading: false, error: undefined, data: [] }
      const nc = createDefaultConversation()
      state.conversations = { [nc.id]: nc }
      state.activeConversationId = nc.id
      state.lastPrompt = null
    },
    clearChat: (state) => {
      state.conversation = { loading: false, error: undefined, data: [] }
      state.usage = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
      state.lastPrompt = null
      if (state.activeConversationId && state.conversations[state.activeConversationId]) {
        state.conversations[state.activeConversationId].messages = []
      }
    },
    createConversation: (state) => {
      const conv = createDefaultConversation()
      state.conversations[conv.id] = conv
      state.activeConversationId = conv.id
      state.conversation = { loading: false, error: undefined, data: [] }
    },
    switchConversation: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.conversations[id]) {
        // save current before switch
        if (state.activeConversationId && state.conversations[state.activeConversationId]) {
          state.conversations[state.activeConversationId].messages = state.conversation.data || []
        }
        state.activeConversationId = id
        state.conversation.data = state.conversations[id].messages
        state.conversation.error = undefined
        state.conversation.loading = false
      }
    },
    renameConversation: (state, action: PayloadAction<{ id: string; title: string }>) => {
      if (state.conversations[action.payload.id]) state.conversations[action.payload.id].title = action.payload.title
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      delete state.conversations[action.payload]
      const ids = Object.keys(state.conversations)
      if (state.activeConversationId === action.payload) {
        if (ids.length) {
          state.activeConversationId = ids[0]
          state.conversation.data = state.conversations[ids[0]].messages
        } else {
          const nc = createDefaultConversation()
          state.conversations[nc.id] = nc
          state.activeConversationId = nc.id
          state.conversation.data = []
        }
      }
    },
    setTheme: (state, action: PayloadAction<UserState['theme']>) => {
      state.theme = action.payload
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload
    },
    setGenerationConfig: (state, action: PayloadAction<Partial<UserState['generationConfig']>>) => {
      state.generationConfig = { ...state.generationConfig, ...action.payload }
    },
    setSystemInstruction: (state, action: PayloadAction<string>) => {
      state.systemInstruction = action.payload
    },
    deleteMessage: (state, action: PayloadAction<number>) => {
      state.conversation.data?.splice(action.payload, 1)
      if (state.activeConversationId && state.conversations[state.activeConversationId]) {
        state.conversations[state.activeConversationId].messages = [...(state.conversation.data || [])]
      }
    },
    editMessage: (state, action: PayloadAction<{ index: number; message: string }>) => {
      const msg = state.conversation.data?.[action.payload.index]
      if (msg) msg.message = action.payload.message
      if (state.activeConversationId && state.conversations[state.activeConversationId]) {
        state.conversations[state.activeConversationId].messages = [...(state.conversation.data || [])]
      }
    },
    appendStreamChunk: (state, action: PayloadAction<string>) => {
      const last = state.conversation.data?.[state.conversation.data.length - 1]
      if (last && last.type === 'inbound' && state.conversation.loading) {
        last.message += action.payload
      } else {
        state.conversation.data?.push({
          type: 'inbound',
          message: action.payload,
          timestamp: new Date().toISOString(),
          role: 'model',
        })
      }
      if (state.activeConversationId && state.conversations[state.activeConversationId]) {
        state.conversations[state.activeConversationId].messages = [...(state.conversation.data || [])]
      }
    },
  },
  extraReducers: (builder) => {
    const syncActive = (state: UserState) => {
      if (state.activeConversationId && state.conversations[state.activeConversationId]) {
        state.conversations[state.activeConversationId].messages = [...(state.conversation.data || [])]
        // auto-title from first user message
        if (state.conversations[state.activeConversationId].title === 'New chat' && state.conversation.data?.[0]) {
          const firstUser = state.conversation.data.find(m => m.type === 'outbound')
          if (firstUser) state.conversations[state.activeConversationId].title = firstUser.message.slice(0, 32)
        }
      }
    }
    const handlePending = (state: UserState, prompt: string, metaArg: unknown) => {
      if (!state.conversation) state.conversation = { loading: false, error: undefined, data: [] }
      state.conversation.loading = true
      state.conversation.error = undefined
      state.lastPrompt = metaArg as UserState['lastPrompt']
      state.conversation.data?.push({
        type: 'outbound',
        message: prompt,
        timestamp: new Date().toISOString(),
        role: 'user',
      })
      syncActive(state)
    }
    builder
      .addCase(generateTextContent.pending, (state, action) => {
        handlePending(state, action.meta.arg.prompt, action.meta.arg)
      })
      .addCase(generateTextContent.fulfilled, (state, action) => {
        state.conversation.loading = false
        const payload = action.payload as { text: string; usage?: UserState['usage'] }
        const text = typeof payload === 'string' ? payload : payload.text
        const usage = typeof payload === 'object' ? payload.usage : undefined
        if (usage) state.usage = usage
        state.conversation.data?.push({
          type: 'inbound',
          message: text,
          timestamp: new Date().toISOString(),
          role: 'model',
        })
        state.lastPrompt = { prompt: action.meta.arg.prompt, base64File: action.meta.arg.base64File ?? null, mimeType: action.meta.arg.mimeType }
        syncActive(state)
      })
      .addCase(generateTextContent.rejected, (state, action) => {
        state.conversation.loading = false
        state.conversation.error = (action.payload as string) || action.error.message || 'Error generating content'
      })
      // Streaming reducers handle optimistic push via pending, chunks via appendStreamChunk handled outside, fulfilled just clears loading
      .addCase(generateStreamContent.pending, (state, action) => {
        handlePending(state, action.meta.arg.prompt, action.meta.arg)
        // push empty inbound to append chunks
        state.conversation.data?.push({
          type: 'inbound',
          message: '',
          timestamp: new Date().toISOString(),
          role: 'model',
        })
      })
      .addCase(generateStreamContent.fulfilled, (state, action) => {
        state.conversation.loading = false
        if (action.payload?.usage) state.usage = action.payload.usage
        const last = state.conversation.data?.[state.conversation.data.length - 1]
        if (last && last.type === 'inbound' && !last.message && action.payload?.text) {
          last.message = action.payload.text
        }
        state.lastPrompt = { prompt: action.meta.arg.prompt, base64File: action.meta.arg.base64File ?? null, mimeType: action.meta.arg.mimeType }
        syncActive(state)
      })
      .addCase(generateStreamContent.rejected, (state, action) => {
        state.conversation.loading = false
        // remove empty streaming bubble if failed
        const last = state.conversation.data?.[state.conversation.data.length - 1]
        if (last && last.type === 'inbound' && !last.message) state.conversation.data?.pop()
        state.conversation.error = (action.payload as string) || action.error.message || 'Streaming error'
      })
  },
})

export const { setUser, clearUser, clearChat, createConversation, switchConversation, renameConversation, deleteConversation, setTheme, setSelectedModel, setGenerationConfig, setSystemInstruction, deleteMessage, editMessage, appendStreamChunk } = userSlice.actions
export default userSlice.reducer
