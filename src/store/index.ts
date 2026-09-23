import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit'
import { persistStore, persistReducer, createMigrate, PersistedState, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import userReducer from './user/userSlice';
import { TypedUseSelectorHook, useSelector as rawUseSelector } from 'react-redux'
import { UserState } from '../types/responses';
import { DEFAULT_MODEL, LEGACY_MODELS, VALID_MODELS } from '../constants/models';


type RootState = {
  user: UserState
}

const rootReducer: Reducer<RootState> = combineReducers({
  user: userReducer,
})

const migrations = {
  1: (state: PersistedState) => {
    const current = state as Partial<RootState> | undefined
    const user = current?.user
    if (user && typeof user.selectedModel === 'string') {
      if (
        (LEGACY_MODELS as readonly string[]).includes(user.selectedModel) ||
        !(VALID_MODELS as readonly string[]).includes(user.selectedModel)
      ) {
        return {
          ...current,
          user: { ...user, selectedModel: DEFAULT_MODEL }
        } as unknown as PersistedState
      }
    }
    return state
  },
  2: (state: PersistedState) => {
    const current = state as Partial<RootState> | undefined
    if (current?.user) {
      // strip any persisted API_KEY from old localStorage state for security
      const { API_KEY, ...safe } = current.user as unknown as Record<string, unknown>
      void API_KEY
      return { ...current, user: safe } as unknown as PersistedState
    }
    return state
  },
  3: (state: PersistedState) => {
    const current = state as Partial<RootState> | undefined
    if (current?.user && !(current.user as unknown as Record<string, unknown>).conversations) {
      const data = (current.user.conversation as unknown as { data?: unknown[] })?.data || []
      const id = Date.now().toString()
      const conv = { id, title: 'Imported chat', messages: data as never[], createdAt: new Date().toISOString() }
      return {
        ...current,
        user: {
          ...current.user,
          conversations: { [id]: conv },
          activeConversationId: id,
          generationConfig: (current.user as unknown as Record<string, unknown>).generationConfig || { temperature: 0.9, topP: 0.95, streaming: false },
          usage: (current.user as unknown as Record<string, unknown>).usage || { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 },
          lastPrompt: null,
          systemInstruction: (current.user as unknown as Record<string, unknown>).systemInstruction || '',
        }
      } as unknown as PersistedState
    }
    return state
  }
}

// Do not persist API_KEY in localStorage – secureStorage (sessionStorage) handles it
const apiKeyTransform = createTransform<UserState, UserState>(
  (inboundState: UserState) => {
    const { API_KEY: _api, ...rest } = inboundState
    void _api
    return rest as UserState
  },
  (outboundState: UserState) => outboundState,
  { whitelist: ['user'] }
)

const persistConfig = {
  key: 'root',
  storage,
  version: 3,
  transforms: [apiKeyTransform],
  migrate: createMigrate(migrations, { debug: false }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
})

const persistor = persistStore(store)

export { store, persistor, type RootState }

export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector
export type AppDispatch = typeof store.dispatch
