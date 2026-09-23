import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setTheme } from '../../store/user/userSlice'

const THEMES = ['dark', 'light', 'midnight'] as const

export const useThemeToggle = () => {
  const { theme } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  // Apply theme to document – single effect, no double dispatch
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  // Init once: persisted redux already has theme, but check if no persisted value and system prefers
  useEffect(() => {
    const saved = (() => {
      try {
        return localStorage.getItem('theme')
      } catch {
        return null
      }
    })()
    if (!saved) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!systemPrefersDark && theme === 'dark') {
        // keep dark as default; no flicker – only switch if explicitly light preferred and no saved
      }
      // If system prefers light and we are dark with no saved, we could switch, but keep user's redux value to avoid flicker
    } else if (saved !== theme) {
      // Hydrated from localStorage separate from redux – sync
      if ((THEMES as readonly string[]).includes(saved)) {
        dispatch(setTheme(saved as typeof theme))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleThemeToggle = useCallback(() => {
    const idx = THEMES.indexOf(theme as (typeof THEMES)[number])
    const next = THEMES[(idx + 1) % THEMES.length]
    dispatch(setTheme(next))
  }, [theme, dispatch])

  return { theme, handleThemeToggle, themes: THEMES }
}
