import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit'
import { persistStore, persistReducer, createMigrate, PersistedState } from 'redux-persist'
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
  }
}

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  migrate: createMigrate(migrations),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

const persistor = persistStore(store)

export { store, persistor, type RootState }

export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector
export type AppDispatch = typeof store.dispatch
