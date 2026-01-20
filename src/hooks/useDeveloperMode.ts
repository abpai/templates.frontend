import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'screenpipe-dev-mode'

function readStoredValue(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'true'
  } catch {
    return false
  }
}

export function useDeveloperMode(): {
  enabled: boolean
  setEnabled: (next: boolean) => void
  toggle: () => void
} {
  const [enabled, setEnabledState] = useState<boolean>(() => readStoredValue())

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false')
    } catch {
      // ignore storage errors
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled(!enabled)
  }, [enabled, setEnabled])

  useEffect(() => {
    setEnabledState(readStoredValue())
  }, [])

  return { enabled, setEnabled, toggle }
}
