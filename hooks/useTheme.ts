import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ResolvedTheme, ThemePreference } from '../types'

const STORAGE_KEY = 'theme'

function normalizeThemePreference(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return 'system'
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference: ThemePreference, systemTheme: ResolvedTheme): ResolvedTheme {
  return preference === 'system' ? systemTheme : preference
}

function applyTheme(resolvedTheme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  document.documentElement.style.colorScheme = resolvedTheme
}

export interface UseThemeResult {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  cyclePreference: () => void
}

export function useTheme(): UseThemeResult {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    normalizeThemePreference(localStorage.getItem(STORAGE_KEY))
  )
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

  const resolvedTheme = useMemo(
    () => resolveTheme(preference, systemTheme),
    [preference, systemTheme]
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference)
  }, [preference])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const update = () => setSystemTheme(media.matches ? 'dark' : 'light')
    update()

    if (media.addEventListener) {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    // Safari < 14
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaAny = media as any
    if (mediaAny.addListener) {
      mediaAny.addListener(update)
      return () => mediaAny.removeListener(update)
    }

    return undefined
  }, [])

  const cyclePreference = useCallback(() => {
    setPreference((prev) => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }, [])

  return { preference, resolvedTheme, setPreference, cyclePreference }
}
