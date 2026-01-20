import { useCallback, useState } from 'react'

interface AudioControlState {
  isEnabled: boolean
  isPending: boolean
  error: Error | null
}

interface AudioControlResult extends AudioControlState {
  enable: () => Promise<void>
  disable: () => Promise<void>
  toggle: () => Promise<void>
}

export function useAudioControl(initialEnabled = false): AudioControlResult {
  const [state, setState] = useState<AudioControlState>({
    isEnabled: initialEnabled,
    isPending: false,
    error: null,
  })

  const enable = useCallback(async () => {
    setState((prev) => ({ ...prev, isPending: true, error: null }))

    // Optimistic update
    setState((prev) => ({ ...prev, isEnabled: true }))

    try {
      const response = await fetch('/audio/enable', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to enable audio')
      }
    } catch (err) {
      // Rollback on error
      setState((prev) => ({
        ...prev,
        isEnabled: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }))
    } finally {
      setState((prev) => ({ ...prev, isPending: false }))
    }
  }, [])

  const disable = useCallback(async () => {
    setState((prev) => ({ ...prev, isPending: true, error: null }))

    // Optimistic update
    setState((prev) => ({ ...prev, isEnabled: false }))

    try {
      const response = await fetch('/audio/disable', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to disable audio')
      }
    } catch (err) {
      // Rollback on error
      setState((prev) => ({
        ...prev,
        isEnabled: true,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }))
    } finally {
      setState((prev) => ({ ...prev, isPending: false }))
    }
  }, [])

  const toggle = useCallback(async () => {
    if (state.isEnabled) {
      await disable()
    } else {
      await enable()
    }
  }, [state.isEnabled, enable, disable])

  return { ...state, enable, disable, toggle }
}
