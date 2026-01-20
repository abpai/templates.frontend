import { useCallback, useEffect, useRef, useState } from 'react'

export interface TriggerApp {
  id: string
  name: string
  bundleId: string
  enabled: boolean
}

export const DEFAULT_TRIGGER_APPS: TriggerApp[] = [
  { id: 'zoom', name: 'Zoom', bundleId: 'us.zoom.xos', enabled: true },
  { id: 'meet', name: 'Google Meet', bundleId: 'com.google.Chrome', enabled: true },
  { id: 'slack', name: 'Slack', bundleId: 'com.tinyspeck.slackmacgap', enabled: true },
]

const POLL_INTERVAL_MS = 2000
const DISABLE_DELAY_MS: Record<'30s' | '1m' | '5m' | 'never', number | null> = {
  '30s': 30_000,
  '1m': 60_000,
  '5m': 300_000,
  never: null,
}
const STORAGE_KEY = 'screenpipe-smart-audio'

interface FrontmostAppResponse {
  bundleId?: string
  bundle_id?: string
  name: string
}

interface AppMonitorState {
  frontmostApp: FrontmostAppResponse | null
  isTriggered: boolean
  triggeredBy: string | null
  isLoading: boolean
  error: Error | null
}

interface AppMonitorResult extends AppMonitorState {
  triggerApps: TriggerApp[]
  setTriggerApps: (apps: TriggerApp[]) => void
  onAudioStateChange: (callback: (enabled: boolean) => void) => void
}

export function useAppMonitor(): AppMonitorResult {
  const [frontmostApp, setFrontmostApp] = useState<FrontmostAppResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [triggerApps, setTriggerApps] = useState<TriggerApp[]>(DEFAULT_TRIGGER_APPS)
  const [smartAudioEnabled, setSmartAudioEnabled] = useState(true)
  const [disableDelayMs, setDisableDelayMs] = useState<number | null>(DISABLE_DELAY_MS['30s'])
  const [isTriggered, setIsTriggered] = useState(false)
  const [triggeredBy, setTriggeredBy] = useState<string | null>(null)

  const audioCallbackRef = useRef<((enabled: boolean) => void) | null>(null)
  const disableTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasTriggeredRef = useRef(false)

  const enabledApps = smartAudioEnabled ? triggerApps.filter((app) => app.enabled) : []

  const loadStoredConfig = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        enabled?: boolean
        triggerApps?: string[]
        disableDelay?: '30s' | '1m' | '5m' | 'never'
      }

      if (typeof parsed.enabled === 'boolean') {
        setSmartAudioEnabled(parsed.enabled)
      }

      if (Array.isArray(parsed.triggerApps)) {
        const selected = new Set(parsed.triggerApps)
        const defaults = DEFAULT_TRIGGER_APPS.map((app) => ({
          ...app,
          enabled: selected.has(app.name),
        }))
        const customApps = parsed.triggerApps
          .filter((name) => !DEFAULT_TRIGGER_APPS.some((app) => app.name === name))
          .map((name) => ({
            id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            bundleId: name.toLowerCase().replace(/\s+/g, '.'),
            enabled: true,
          }))

        setTriggerApps([...defaults, ...customApps])
      }

      if (parsed.disableDelay && parsed.disableDelay in DISABLE_DELAY_MS) {
        setDisableDelayMs(DISABLE_DELAY_MS[parsed.disableDelay])
      }
    } catch {
      // ignore storage issues
    }
  }, [])

  const checkTriggerApp = useCallback(
    (app: FrontmostAppResponse | null) => {
      if (!app) return null

      // Check if the frontmost app matches any enabled trigger app
      const matchedApp = enabledApps.find(
        (trigger) =>
          app.bundleId === trigger.bundleId ||
          app.name.toLowerCase().includes(trigger.name.toLowerCase())
      )

      return matchedApp || null
    },
    [enabledApps]
  )

  const fetchFrontmostApp = useCallback(async () => {
    try {
      const response = await fetch('/frontmost-app')
      if (!response.ok) {
        throw new Error(`Failed to get frontmost app: ${response.status}`)
      }
      const data = (await response.json()) as FrontmostAppResponse
      const normalized: FrontmostAppResponse = {
        name: data.name ?? 'Unknown',
        bundleId: data.bundleId ?? data.bundle_id ?? '',
      }
      setFrontmostApp(normalized)
      setError(null)
      return normalized
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const onAudioStateChange = useCallback((callback: (enabled: boolean) => void) => {
    audioCallbackRef.current = callback
  }, [])

  useEffect(() => {
    loadStoredConfig()
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        loadStoredConfig()
      }
    }
    window.addEventListener('storage', handleStorage)

    const poll = async () => {
      const app = await fetchFrontmostApp()

      if (!smartAudioEnabled) {
        if (wasTriggeredRef.current) {
          wasTriggeredRef.current = false
          setIsTriggered(false)
          setTriggeredBy(null)
          audioCallbackRef.current?.(false)
        }
        return
      }

      const matchedApp = checkTriggerApp(app)

      if (matchedApp) {
        // Clear any pending disable timeout
        if (disableTimeoutRef.current) {
          clearTimeout(disableTimeoutRef.current)
          disableTimeoutRef.current = null
        }

        // Trigger audio if not already triggered
        if (!wasTriggeredRef.current) {
          setIsTriggered(true)
          setTriggeredBy(matchedApp.name)
          wasTriggeredRef.current = true
          audioCallbackRef.current?.(true)
        }
      } else if (wasTriggeredRef.current) {
        // App switched away - start debounce timer to disable (unless disabled)
        if (disableDelayMs !== null && !disableTimeoutRef.current) {
          disableTimeoutRef.current = setTimeout(() => {
            setIsTriggered(false)
            setTriggeredBy(null)
            wasTriggeredRef.current = false
            audioCallbackRef.current?.(false)
            disableTimeoutRef.current = null
          }, disableDelayMs)
        }
      }
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
      if (disableTimeoutRef.current) {
        clearTimeout(disableTimeoutRef.current)
      }
    }
  }, [fetchFrontmostApp, checkTriggerApp, smartAudioEnabled, disableDelayMs, loadStoredConfig])

  return {
    frontmostApp,
    isTriggered,
    triggeredBy,
    isLoading,
    error,
    triggerApps,
    setTriggerApps,
    onAudioStateChange,
  }
}
