import { useEffect, useRef, useState } from 'react'

export interface ScreenpipeEvent {
  name: string
  data: unknown
}

interface TimelineStreamOptions {
  enabled?: boolean
  includeImages?: boolean
}

export function useTimelineStream(options: TimelineStreamOptions = {}) {
  const { enabled = true, includeImages = false } = options
  const [events, setEvents] = useState<ScreenpipeEvent[]>([])
  const [lastEvent, setLastEvent] = useState<ScreenpipeEvent | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled) return

    const host = window.location.hostname || 'localhost'
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${protocol}://${host}:3030/ws/events?images=${includeImages ? 'true' : 'false'}`

    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.addEventListener('open', () => setIsConnected(true))
    socket.addEventListener('close', () => setIsConnected(false))
    socket.addEventListener('error', () => setIsConnected(false))
    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data as string) as ScreenpipeEvent
        setLastEvent(payload)
        setEvents((prev) => [payload, ...prev].slice(0, 200))
      } catch {
        // ignore malformed payloads
      }
    })

    return () => {
      socket.close()
    }
  }, [enabled, includeImages])

  return { events, lastEvent, isConnected }
}
