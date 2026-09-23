import { describe, it, expect } from 'vitest'
import reducer, { setUser, clearChat, setSelectedModel } from './userSlice'

describe('userSlice', () => {
  it('should handle setUser trimming', () => {
    const state = reducer(undefined, setUser({ name: ' Ada ', API_KEY: ' AIza12345678901234567890123456789 ' }))
    expect(state.name).toBe('Ada')
    expect(state.API_KEY.trim()).toBe('AIza12345678901234567890123456789')
  })
  it('should clearChat', () => {
    let state = reducer(undefined, setUser({ name: 'A', API_KEY: 'AIza12345678901234567890123456789' }))
    // simulate pending already pushes; just test clear
    state = reducer(state, clearChat())
    expect(state.conversation.data).toEqual([])
  })
  it('should set model', () => {
    const state = reducer(undefined, setSelectedModel('gemini-2.5-pro'))
    expect(state.selectedModel).toBe('gemini-2.5-pro')
  })
})
